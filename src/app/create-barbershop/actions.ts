'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

// --- Zod Schemas ---

const startRegistrationSchema = z.object({
    email: z.string().email("Email inválido"),
    phone: z.string().min(10, "Teléfono debe tener al menos 10 dígitos").regex(/^\d+$/, "Solo números")
});

const businessInfoSchema = z.object({
    name: z.string().min(3, "Nombre muy corto"),
    commercial_name: z.string().optional(),
    business_type: z.enum(['BARBERSHOP', 'SALON', 'SPA', 'STUDIO', 'NATURAL', 'JURIDICA']), // Added NATURAL/JURIDICA based on client usage
    document_number: z.string().min(5, "Documento requerido"),
    city: z.string().min(3, "Ciudad requerida")
});

const locationContactSchema = z.object({
    address: z.string().min(5, "Dirección requerida"),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    phone: z.string().min(10, "Teléfono inválido").regex(/^\d+$/, "Solo números"),
    whatsapp: z.string().min(10, "WhatsApp inválido").regex(/^\d+$/, "Solo números"),
});

const staffCountSchema = z.object({
    staff_count: z.number().int().min(1, "Al menos 1 persona").max(50, "Máximo 50 por ahora")
});

// --- Actions ---

export async function startRegistration(email: string, phone: string) {
    const val = startRegistrationSchema.safeParse({ email, phone });
    if (!val.success) return { error: val.error.errors[0].message };

    const supabase = await createClient()

    // 1. Trigger Supabase OTP
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
        console.error('❌ [startRegistration] Auth Error:', error.message)
        if (error.message.includes("Signups not allowed")) return { error: "El registro está deshabilitado temporalmente." };
        if (error.message.includes("Too many requests")) return { error: "Demasiados intentos. Espera unos minutos." };
        return { error: error.message }
    }

    return { success: true }
}

export async function verifyEmail(email: string, otp: string) {
    const supabase = await createClient()

    const { data: { session }, error } = await supabase.auth.verifyOtp({
        email, token: otp, type: 'email'
    })

    if (error) return { error: "Código inválido o expirado." }
    if (!session?.user) return { error: "No se pudo verificar la sesión." }

    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: session.user.id,
            status: 'EMAIL_VERIFIED',
            phone: session.user.user_metadata.phone,
            role: 'OWNER'
        })

    if (upsertError) return { error: "Error de sistema al crear el perfil." }

    const phone = session.user.user_metadata.phone
    redirect(`/create-barbershop/verify-whatsapp?phone=${encodeURIComponent(phone || '')}`)
}

export async function sendWhatsAppOtp(phone: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    console.log("🔐 [SIMULATION MODE] WhatsApp OTP:", otp);

    const { error } = await supabase.from('profiles').update({
        phone_otp: otp,
        phone_otp_expires_at: expiresAt.toISOString()
    }).eq('id', user.id)

    if (error) return { error: "Error al generar código." };
    return { success: true, message: "Código enviado" };
}

export async function verifyWhatsAppOtp(otp: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('phone_otp, phone_otp_expires_at, status')
        .eq('id', user.id)
        .single();

    if (error || !profile) return { error: "Error al validar código." };
    if (profile.status === 'ACCOUNT_ACTIVE') return { success: true };

    if (profile.phone_otp !== otp) return { error: "Código incorrecto." };
    if (new Date(profile.phone_otp_expires_at) < new Date()) return { error: "El código ha expirado." };

    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            status: 'PHONE_VERIFIED',
            phone_otp: null,
            phone_otp_expires_at: null
        })
        .eq('id', user.id)

    if (updateError) return { error: "No se pudo actualizar el estado." };
    return { success: true };
}

export async function setPassword(password: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    if (password.length < 6) return { error: "La contraseña debe tener al menos 6 caracteres" }

    const { data: profile } = await supabase.from('profiles').select('status').eq('id', user.id).single();
    if (!profile) return { error: "Perfil no encontrado." };

    // Allow if already active or verified
    if (profile.status !== 'PHONE_VERIFIED' && profile.status !== 'ACCOUNT_ACTIVE') {
        return { error: "Debes verificar tu teléfono primero." };
    }

    const { error: authError } = await supabase.auth.updateUser({ password })
    if (authError) return { error: "No se pudo asignar la contraseña." };

    const { error: dbError } = await supabase.from('profiles').update({ status: 'ACCOUNT_ACTIVE' }).eq('id', user.id)
    if (dbError) return { error: "Error al activar cuenta." };

    // Here we redirect because it's the end of the strict auth flow
    redirect('/create-barbershop/business-info');
}

// --- WIZARD STEPS ---

// Step 1: Business Info
export async function saveBusinessInfo(data: any) {
    const val = businessInfoSchema.safeParse(data);
    if (!val.success) return { error: val.error.errors[0].message };

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { error } = await supabase
        .from('barbershops')
        .upsert({
            owner_id: user.id,
            name: data.name,
            commercial_name: data.commercial_name || data.name,
            business_type: data.business_type,
            document_number: data.document_number,
            city: data.city,
            status: 'DRAFT'
        }, { onConflict: 'owner_id' })

    if (error) {
        console.error("❌ Save Business Info Failed:", error);
        return { error: "Error al guardar información básica." };
    }

    return { success: true };
}

// Step 2: Location & Contact
export async function saveLocationAndContact(data: any) {
    // Basic formatting before validation if needed, handled by client
    const val = locationContactSchema.safeParse(data);
    if (!val.success) return { error: val.error.errors[0].message };

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    // Ownership check implicitly handled by RLS normally, but strictly checking owner_id in UPDATE
    const { error } = await supabase
        .from('barbershops')
        .update({
            address: data.address,
            phone: data.phone,
            whatsapp: data.whatsapp,
            latitude: data.latitude || null,
            longitude: data.longitude || null
        })
        .eq('owner_id', user.id)

    if (error) return { error: "Error al guardar ubicación y contacto." };
    return { success: true };
}

// Step 3: Visual Identity & Hours (Modified to handle multiple photos)
export async function saveVisualIdentity(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const logoFile = formData.get('logo') as File;
    const localPhotos = formData.getAll('local_photos') as File[]; // Expecting array
    const description = formData.get('description') as string;
    const openingHoursStr = formData.get('opening_hours') as string;

    const timestamp = Date.now();
    const updates: any = {};

    if (description) updates.description = description;

    if (openingHoursStr) {
        try {
            updates.opening_hours = JSON.parse(openingHoursStr);
        } catch (e) {
            return { error: "Formato de horarios inválido" };
        }
    }

    // 1. Upload Logo
    if (logoFile && logoFile.size > 0) {
        if (!logoFile.type.startsWith('image/')) return { error: "El logo debe ser una imagen" };

        const fileExt = logoFile.name.split('.').pop();
        const filePath = `logos/${user.id}/logo-${timestamp}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('barbershop-docs')
            .upload(filePath, logoFile, { upsert: true });

        if (uploadError) return { error: "Error al subir logo." };

        updates.logo_url = filePath; // Storing Path
    }

    // 2. Upload Local Photos (Max 2)
    const uploadedPhotos: string[] = [];
    if (localPhotos.length > 0) {
        // Filter valid files first
        const validPhotos = localPhotos.filter(p => p.size > 0 && p.type.startsWith('image/'));

        for (let i = 0; i < Math.min(validPhotos.length, 2); i++) {
            const photo = validPhotos[i];
            const fileExt = photo.name.split('.').pop();
            const filePath = `locales/${user.id}/photo-${i}-${timestamp}.${fileExt}`;

            const { error } = await supabase.storage
                .from('barbershop-docs')
                .upload(filePath, photo, { upsert: true });

            if (!error) {
                uploadedPhotos.push(filePath); // Storing Path
            }
        }
        if (uploadedPhotos.length > 0) {
            updates.local_photos = uploadedPhotos; // JSONB array of paths
        }
    }

    if (Object.keys(updates).length > 0) {
        const { error } = await supabase
            .from('barbershops')
            .update(updates)
            .eq('owner_id', user.id);

        if (error) return { error: "Error al actualizar identidad visual." };
    }

    return { success: true };
}

// Step 4: Staff Count
export async function saveStaffCount(count: number) {
    const val = staffCountSchema.safeParse({ staff_count: count });
    if (!val.success) return { error: val.error.errors[0].message };

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const { error } = await supabase
        .from('barbershops')
        .update({ staff_count: count })
        .eq('owner_id', user.id)

    if (error) return { error: "Error al guardar equipo." };

    return { success: true };
}

export async function uploadDocument(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    // Ownership check (verify the barbershop provided actually belongs to the user, although saving path with user.id is safe)
    // We assume the user is uploading doc for their own shop.

    if (!file || !type) return { error: "Datos incompletos" };
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) return { error: "Formato no inválido" };

    const fileExt = file.name.split('.').pop();
    const filePath = `documents/${user.id}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from('barbershop-docs')
        .upload(filePath, file);

    if (uploadError) return { error: "Error subiendo archivo." };

    const { data: shop } = await supabase.from('barbershops').select('id').eq('owner_id', user.id).single();
    if (!shop) return { error: "Barbería no encontrada." };

    const { error: dbError } = await supabase
        .from('barbershop_documents')
        .insert({
            barbershop_id: shop.id,
            type: type,
            storage_path: filePath,
            status: 'UPLOADED'
        });

    if (dbError) return { error: "Error registrando documento." };

    return { success: true };
}

export async function submitForReview(barbershopId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: "No autorizado" }

    // Ownership check
    const { data: shop } = await supabase.from('barbershops').select('id, owner_id').eq('id', barbershopId).single();
    if (!shop || shop.owner_id !== user.id) return { error: "No autorizado para esta barbería." };

    const { error } = await supabase
        .from('barbershops')
        .update({ status: 'PENDING_REVIEW' })
        .eq('id', barbershopId);

    if (error) return { error: "Error enviando a revisión." };

    return { success: true };
}
