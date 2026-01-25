'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function startRegistration(email: string, phone: string) {
    console.log("🚀 [startRegistration] Init:", { email, phone });

    if (!email || !phone) {
        return { error: 'Email y teléfono son obligatorios.' }
    }

    const supabase = await createClient()

    // 1. Trigger Supabase OTP (Supabase sends email via Resend if configured)
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            // Explicitly set to null to avoid Magic Link behavior if possible, 
            // though usually this depends on the Email Template settings in Dashboard.
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
        // Map common errors to friendly messages
        if (error.message.includes("Signups not allowed")) return { error: "El registro está deshabilitado temporalmente." };
        if (error.message.includes("Too many requests")) return { error: "Demasiados intentos. Espera unos minutos." };
        return { error: error.message }
    }

    console.log("✅ [startRegistration] OTP Sent successfully to:", email);
    return { success: true }
}

export async function verifyEmail(email: string, otp: string) {
    console.log("🚀 [verifyEmail] Init for:", email);
    const supabase = await createClient()

    // 1. Verify OTP
    const { data: { session }, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
    })

    if (error) {
        console.error('❌ [verifyEmail] OTP Verification Failed:', error.message);
        return { error: "Código inválido o expirado." }
    }

    if (!session?.user) {
        console.error('❌ [verifyEmail] No session after verification.');
        return { error: "No se pudo verificar la sesión." }
    }

    console.log("✅ [verifyEmail] Params Validated. User ID:", session.user.id);

    // 2. Update Profile Status strictly
    // We use UPSERT to ensure the profile exists even if the creation trigger failed or hasn't run.
    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: session.user.id,
            status: 'EMAIL_VERIFIED',
            phone: session.user.user_metadata.phone,
            role: 'OWNER'
        })

    if (upsertError) {
        console.error('❌ [verifyEmail] Critical Profile Update Error:', upsertError)
        return { error: "Error de sistema al crear el perfil. Contacta soporte." }
    }

    console.log("🎉 [verifyEmail] Success. Status => EMAIL_VERIFIED. Redirecting...");

    // 3. Redirect to WhatsApp verification
    const phone = session.user.user_metadata.phone
    redirect(`/create-barbershop/verify-whatsapp?phone=${encodeURIComponent(phone || '')}`)
}

export async function sendWhatsAppOtp(phone: string) {
    console.log("🚀 [sendWhatsAppOtp] Request for:", phone);

    // 1. Validate Session & Cooldown
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("🔐 [SIMULATION MODE] WhatsApp OTP:", otp);

    // 3. Store in DB (Simulated "Send")
    // We update the profile with the generated OTP
    const { error } = await supabase
        .from('profiles')
        .update({
            phone_otp: otp,
            phone_otp_expires_at: expiresAt.toISOString()
        })
        .eq('id', user.id)

    if (error) {
        console.error("❌Error storing OTP:", error);
        return { error: "Error al generar código." };
    }

    return { success: true, message: "Código enviado (Revisa consola)" };
}

export async function verifyWhatsAppOtp(otp: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    // 1. Get stored OTP & Status
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('phone_otp, phone_otp_expires_at, status')
        .eq('id', user.id)
        .single();

    if (error || !profile) return { error: "Error al validar código." };

    // Security: Prevent re-verification of active accounts
    if (profile.status === 'ACCOUNT_ACTIVE') {
        return { success: true }; // Idempotent success
    }

    // 2. Validate Otp matches
    if (profile.phone_otp !== otp) {
        return { error: "Código incorrecto." };
    }

    if (new Date(profile.phone_otp_expires_at) < new Date()) {
        return { error: "El código ha expirado." };
    }

    // 3. Update Status to PHONE_VERIFIED & Clear OTP
    const { error: updateError } = await supabase
        .from('profiles')
        .update({
            status: 'PHONE_VERIFIED',
            phone_otp: null, // Clear used OTP
            phone_otp_expires_at: null
        })
        .eq('id', user.id)

    if (updateError) return { error: "No se pudo actualizar el estado." };

    console.log("🎉 Phone Verified! Moving to next step.");

    // 4. Return success instead of redirecting (Client handles redirect)
    return { success: true };
}

export async function setPassword(password: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    // Security: Check Profile Status strictly
    const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single();

    if (!profile) return { error: "Perfil no encontrado." };

    if (profile.status === 'ACCOUNT_ACTIVE') {
        // Already active? Just redirect.
        redirect('/create-barbershop/business-info');
    }

    if (profile.status !== 'PHONE_VERIFIED') {
        return { error: "Debes verificar tu teléfono primero." };
    }

    // 1. Update Supabase Auth Password
    const { error: authError } = await supabase.auth.updateUser({
        password: password
    })

    if (authError) {
        console.error("❌ Link password failed:", authError);
        return { error: "No se pudo asignar la contraseña." };
    }

    // 2. Update Profile Status to FINAL
    const { error: dbError } = await supabase
        .from('profiles')
        .update({ status: 'ACCOUNT_ACTIVE' })
        .eq('id', user.id)

    if (dbError) {
        return { error: "Error al activar cuenta." };
    }

    // 3. Final Redirect -> Go to Wizard
    redirect('/create-barbershop/business-info');
}

export async function saveBusinessInfo(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    // Upsert Barbershop (DRAFT)
    const { error } = await supabase
        .from('barbershops')
        .upsert({
            owner_id: user.id,
            name: data.name,
            commercial_name: data.commercial_name || data.name, // Fallback to name
            business_type: data.business_type,
            document_number: data.document_number,
            status: 'DRAFT'
        }, { onConflict: 'owner_id' }) // Ensure 1 barbershop per owner for now

    if (error) {
        console.error("❌ Save Business Info Failed FULL:", JSON.stringify(error, null, 2));
        return { error: `Error al guardar: ${error.message || error.details || 'Desconocido'}` };
    }

    redirect('/create-barbershop/visual-identity');
}

export async function saveVisualIdentity(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    const logoFile = formData.get('logo') as File;
    const bannerFile = formData.get('banner') as File;

    const updates: any = {};
    const timestamp = Date.now();

    // 1. Upload Logo
    if (logoFile && logoFile.size > 0) {
        const fileExt = logoFile.name.split('.').pop();
        const filePath = `${user.id}/logo-${timestamp}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('barbershop-docs')
            .upload(filePath, logoFile);

        if (uploadError) {
            console.error("Logo Upload Error:", uploadError);
            return { error: "Error al subir logo." };
        }
        updates.logo_url = filePath;
    }

    // 2. Upload Banner
    if (bannerFile && bannerFile.size > 0) {
        const fileExt = bannerFile.name.split('.').pop();
        const filePath = `${user.id}/banner-${timestamp}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('barbershop-docs')
            .upload(filePath, bannerFile);

        if (uploadError) {
            console.error("Banner Upload Error:", uploadError);
            return { error: "Error al subir portada." };
        }
        updates.banner_url = filePath;
    }

    // 3. Update DB
    if (Object.keys(updates).length > 0) {
        const { error: dbError } = await supabase
            .from('barbershops')
            .update(updates)
            .eq('owner_id', user.id);

        if (dbError) {
            console.error("DB Update Error:", dbError);
            return { error: "Error al guardar referencias de imagen." };
        }
    }

    // 4. Redirect to Documents
    redirect('/create-barbershop/documents');
}

export async function uploadDocument(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: "No autorizado" }

    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const barbershopId = formData.get('barbershopId') as string;

    if (!file || !type || !barbershopId) return { error: "Datos incompletos" };

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${type}-${Date.now()}.${fileExt}`;

    // 1. Upload to Storage
    const { error: uploadError } = await supabase.storage
        .from('barbershop-docs')
        .upload(filePath, file);

    if (uploadError) return { error: "Error subiendo archivo al storage." };

    // 2. Register in DB
    const { error: dbError } = await supabase
        .from('barbershop_documents')
        .insert({
            barbershop_id: barbershopId,
            type: type,
            storage_path: filePath,
            status: 'UPLOADED'
        });

    if (dbError) return { error: "Error registrando documento." };

    return { success: true };
}

export async function submitForReview(barbershopId: string) {
    const supabase = await createClient()

    // 1. Update Status
    const { error } = await supabase
        .from('barbershops')
        .update({ status: 'PENDING_REVIEW' })
        .eq('id', barbershopId);

    if (error) return { error: "Error enviando a revisión." };

    // 2. Redirect to Dashboard / Waiting Screen
    redirect('/welcome?status=review');
}
