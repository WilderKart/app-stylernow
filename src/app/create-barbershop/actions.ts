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
            // Prevent automatic redirect link, enforce CODE input
            emailRedirectTo: undefined,
            // Metadata for later
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
    // Try update first
    const { error: profileError } = await supabase
        .from('profiles')
        .update({ status: 'EMAIL_VERIFIED' })
        .eq('id', session.user.id)

    if (profileError) {
        console.warn("⚠️ [verifyEmail] Update failed, attempting Upsert...", profileError.message)

        // Upsert fallback (for first time creation if trigger didn't run)
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
    }

    console.log("🎉 [verifyEmail] Success. Status => EMAIL_VERIFIED. Redirecting...");

    // 3. Redirect to WhatsApp verification
    const phone = session.user.user_metadata.phone
    redirect(`/create-barbershop/verify-whatsapp?phone=${encodeURIComponent(phone || '')}`)
}
