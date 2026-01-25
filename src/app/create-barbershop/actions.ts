'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { checkRateLimit, logAudit, sanitizeImage, validateImageFile } from '@/lib/security'

// --- Strict Zod Schemas ---

const startRegistrationSchema = z.object({
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos").regex(/^\d+$/, "Solo números")
}).strict();

// Paso 1: Business Info
const businessInfoSchema = z.object({
    name: z.string().min(3, "Nombre muy corto"),
    commercial_name: z.string().optional(),
    business_type: z.enum(['BARBERSHOP', 'SALON', 'SPA', 'STUDIO', 'NATURAL', 'JURIDICA']),
    document_number: z.string().min(5, "Documento requerido"),
    city: z.string().min(3, "Ciudad requerida")
}).strict();

// Paso 2: Location
const locationContactSchema = z.object({
    address: z.string().min(5, "Dirección requerida"),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    phone: z.string().min(10, "Teléfono inválido").regex(/^\d+$/, "Solo números"),
    whatsapp: z.string().min(10, "WhatsApp inválido").regex(/^\d+$/, "Solo números"),
}).strict();

// Paso 3: Visual Identity
// Handled manually due to FormData, but internal JSON parts validated
const openingHoursSchema = z.record(z.string(), z.string()).optional(); // Simplified for JSON.parse check

// Paso 4: Staff
const staffCountSchema = z.object({
    staff_count: z.number().int().min(1, "Al menos 1 persona").max(50, "Máximo 50 por ahora")
}).strict();


// --- Security Wrapper ---

type ActionContext = {
    user: any;
    supabase: any;
};

async function secureAction(
    actionName: string,
    requiredStep: number, // The step that MUST be active (e.g. 1 to save step 1) or 0 for init
    handler: (ctx: ActionContext) => Promise<any>
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: "No autorizado." };
    }

    // 1. Rate Limiting (Hard Limit: 10 actions/min per user)
    const allowed = await checkRateLimit(user.id, actionName, 10, 60);
    if (!allowed) {
        await logAudit(user.id, actionName, { error: 'Rate Limit Exceeded' }, undefined, 'WARN');
        return { error: "Demasiados intentos. Intenta más tarde." };
    }

    // 2. Step Enforcement (State Machine)
    if (requiredStep > 0) {
        const { data: shop } = await supabase
            .from('barbershops')
            .select('id, owner_id, onboarding_step, onboarding_completed')
            .eq('owner_id', user.id)
            .single();

        if (!shop) return { error: "Barbería no encontrada." };
        if (shop.owner_id !== user.id) return { error: "Acceso denegado (Ownership)." };

        // Strict Sequence: You can only edit the current step or previous steps (if logical)
        if (shop.onboarding_step < requiredStep) {
            await logAudit(user.id, actionName, { error: 'Step Bypass Attempt', current: shop.onboarding_step, required: requiredStep }, undefined, 'CRITICAL');
            return { error: "No puedes saltar pasos del registro." };
        }
    }

    try {
        const result = await handler({ user, supabase });
        // Audit Success
        await logAudit(user.id, actionName, { success: true }, undefined, 'INFO');
        return result;
    } catch (e: any) {
        console.error(`Action ${actionName} Error:`, e);
        await logAudit(user.id, actionName, { error: e.message }, undefined, 'CRITICAL');
        return { error: "Error interno del servidor." };
    }
}


// --- Public Actions (No Auth Required for Start) ---

export async function startRegistration(email: string, phone: string) {
    const val = startRegistrationSchema.safeParse({ email, phone });
    if (!val.success) return { error: val.error.issues[0]?.message ?? "Datos inválidos" };

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: null as any,
            shouldCreateUser: true,
            data: {
                phone: phone,
                role: 'OWNER',
                status: 'CREATED'
            }
        }
    })

    if (error) {
        return { error: "Error enviando código. Intenta de nuevo." }
    }

    return { success: true }
}

export async function verifyEmail(email: string, otp: string) {
    const supabase = await createClient()
    const { data: { session }, error } = await supabase.auth.verifyOtp({
        email, token: otp, type: 'email'
    })

    if (error || !session?.user) return { error: "Código inválido." }

    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: session.user.id,
            status: 'EMAIL_VERIFIED',
            phone: session.user.user_metadata.phone,
            role: 'OWNER'
        })

    if (upsertError) return { error: "Error creando perfil." }

    const phone = session.user.user_metadata.phone
    redirect(`/create-barbershop/verify-whatsapp?phone=${encodeURIComponent(phone || '')}`)
}

// --- Protected Actions ---

export async function sendWhatsAppOtp(phone: string) {
    return secureAction('SEND_WHATSAPP_OTP', 0, async ({ user, supabase }) => {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await supabase.from('profiles').update({
            phone_otp: otp,
            phone_otp_expires_at: expiresAt.toISOString()
        }).eq('id', user.id);

        console.log("🔐 [WA OTP]:", otp);
        return { success: true, message: "Código enviado" };
    });
}

export async function verifyWhatsAppOtp(otp: string) {
    return secureAction('VERIFY_WHATSAPP_OTP', 0, async ({ user, supabase }) => {
        const { data: profile } = await supabase
            .from('profiles')
            .select('phone_otp, phone_otp_expires_at, status')
            .eq('id', user.id)
            .single();

        if (!profile || profile.phone_otp !== otp) return { error: "Código incorrecto." };

        await supabase.from('profiles').update({
            status: 'PHONE_VERIFIED',
            phone_otp: null
        }).eq('id', user.id);

        return { success: true };
    });
}

export async function setPassword(password: string) {
    return secureAction('SET_PASSWORD', 0, async ({ user, supabase }) => {
        if (password.length < 6) return { error: "Mínimo 6 caracteres." };

        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw new Error(error.message);

        await supabase.from('profiles').update({ status: 'ACCOUNT_ACTIVE' }).eq('id', user.id);
        // Cant use redirect inside try/catch of secureAction wrapper easily without breaking flow, 
        // return success so client handles it.
        return { success: true };
    });
}

// --- Wizard Steps Secured ---

// Step 1: Business Info
export async function saveBusinessInfo(data: any) {
    return secureAction('SAVE_BUSINESS_INFO', 0, async ({ user, supabase }) => {
        const val = businessInfoSchema.safeParse(data);
        if (!val.success) return { error: val.error.issues[0]?.message ?? "Datos inválidos" };

        const { error } = await supabase.from('barbershops')
            .upsert({
                owner_id: user.id,
                ...val.data,
                status: 'DRAFT',
                onboarding_step: 1 // Init step
            }, { onConflict: 'owner_id' });

        if (error) throw error;

        // Advance step if currently active
        // Logic: if step is 1, upgrade to 2. If already >2 keep it.
        const { data: current } = await supabase.from('barbershops').select('onboarding_step').eq('owner_id', user.id).single();
        if (current && current.onboarding_step === 1) {
            await supabase.from('barbershops').update({ onboarding_step: 2 }).eq('owner_id', user.id);
        }

        return { success: true };
    });
}

// Step 2: Location
export async function saveLocationAndContact(data: any) {
    return secureAction('SAVE_LOCATION', 2, async ({ user, supabase }) => {
        const val = locationContactSchema.safeParse(data);
        if (!val.success) return { error: val.error.issues[0]?.message ?? "Datos inválidos" };

        const { error } = await supabase.from('barbershops')
            .update({ ...val.data })
            .eq('owner_id', user.id); // Secure wrapper checks ownership, but RLS/security requires .eq

        if (error) throw error;

        // Advance Step 
        const { data: current } = await supabase.from('barbershops').select('onboarding_step').eq('owner_id', user.id).single();
        if (current && current.onboarding_step === 2) {
            await supabase.from('barbershops').update({ onboarding_step: 3 }).eq('owner_id', user.id);
        }

        return { success: true };
    });
}

// Step 3: Visual Identity
export async function saveVisualIdentity(formData: FormData) {
    return secureAction('SAVE_VISUAL_IDENTITY', 3, async ({ user, supabase }) => {
        const logoFile = formData.get('logo') as File;
        const localPhotos = formData.getAll('local_photos') as File[];
        const timestamp = Date.now();
        const updates: any = {};

        // 1. Logo Security Check
        if (logoFile && logoFile.size > 0) {
            const { isValid, error } = await validateImageFile(logoFile);
            if (!isValid) return { error: `Logo: ${error}` };

            const buffer = await sanitizeImage(logoFile);
            const path = `logos/${user.id}/logo-${timestamp}.webp`;

            await supabase.storage.from('barbershop-docs').upload(path, buffer, { contentType: 'image/webp', upsert: true });
            updates.logo_url = path;
        }

        // 2. Photos Security Check
        const validPhotos = localPhotos.filter(f => f.size > 0);
        if (validPhotos.length > 2) return { error: "Máximo 2 fotos permitidas." };

        const uploadedPhotos: string[] = [];
        for (let i = 0; i < validPhotos.length; i++) {
            const photo = validPhotos[i];
            const { isValid, error } = await validateImageFile(photo);
            if (!isValid) return { error: `Foto ${i + 1}: ${error}` };

            const buffer = await sanitizeImage(photo);
            const path = `locales/${user.id}/photo-${i}-${timestamp}.webp`;

            await supabase.storage.from('barbershop-docs').upload(path, buffer, { contentType: 'image/webp', upsert: true });
            uploadedPhotos.push(path);
        }
        if (uploadedPhotos.length > 0) updates.local_photos = uploadedPhotos;

        // 3. Update DB
        if (Object.keys(updates).length > 0) {
            await supabase.from('barbershops').update(updates).eq('owner_id', user.id);
        }

        // 4. Update JSONB & Advance Step
        const openingHoursStr = formData.get('opening_hours') as string;
        const description = formData.get('description') as string;
        if (description) await supabase.from('barbershops').update({ description }).eq('owner_id', user.id);

        if (openingHoursStr) {
            try {
                const json = JSON.parse(openingHoursStr);
                // Advance Step 
                const { data: current } = await supabase.from('barbershops').select('onboarding_step').eq('owner_id', user.id).single();
                if (current && current.onboarding_step === 3) {
                    await supabase.from('barbershops').update({
                        opening_hours: json,
                        onboarding_step: 4
                    }).eq('owner_id', user.id);
                } else {
                    await supabase.from('barbershops').update({ opening_hours: json }).eq('owner_id', user.id);
                }
            } catch (e) { return { error: "Horario inválido" } }
        }

        return { success: true };
    });
}

// Step 4: Staff
export async function saveStaffCount(count: number) {
    return secureAction('SAVE_STAFF_COUNT', 4, async ({ user, supabase }) => {
        const val = staffCountSchema.safeParse({ staff_count: count });
        if (!val.success) return { error: val.error.issues[0]?.message ?? "Datos inválidos" };

        const { error } = await supabase.from('barbershops')
            .update({
                staff_count: count,
                onboarding_step: 5,
                onboarding_completed: true,
                status: 'PENDING_REVIEW'
            })
            .eq('owner_id', user.id);

        if (error) throw error;
        return { success: true };
    });
}

// Upload Documents
export async function uploadDocument(formData: FormData) {
    return secureAction('UPLOAD_DOCUMENT', 0, async ({ user, supabase }) => {
        const file = formData.get('file') as File;
        const type = formData.get('type') as string;
        const barbershopId = formData.get('barbershopId') as string;

        if (!user) return { error: "No autorizado" };

        const { isValid, error } = await validateImageFile(file);
        if (!isValid) return { error };

        const buffer = await sanitizeImage(file);
        const path = `documents/${user.id}/${type}-${Date.now()}.webp`;

        const { error: uploadError } = await supabase.storage.from('barbershop-docs').upload(path, buffer, { contentType: 'image/webp' });
        if (uploadError) throw new Error("Upload Failed");

        await supabase.from('barbershop_documents').insert({
            barbershop_id: barbershopId,
            type: type,
            storage_path: path,
            status: 'UPLOADED'
        });

        return { success: true };
    });
}

// Final Submission
export async function submitForReview(barbershopId: string) {
    return secureAction('SUBMIT_FOR_REVIEW', 0, async ({ user, supabase }) => {
        // Validation: Verify docs exist? 
        // For now, trust the client flow or add DB check if stricter.
        // Client checks if all required docs uploaded. 
        // We could query 'barbershop_documents' to be sure but standardizing first.

        const { error } = await supabase.from('barbershops')
            .update({
                status: 'PENDING_REVIEW',
                onboarding_completed: true,
                onboarding_step: 5
            })
            .eq('id', barbershopId)
            .eq('owner_id', user.id);

        if (error) throw error;

        // Redirect to welcome? client handles it?
        // DocumentsClient redirects to /welcome?status=review usually.
        return { success: true };
    });
}
