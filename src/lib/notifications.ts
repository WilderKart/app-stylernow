// src/lib/notifications.ts

// MOCK implementations for Phase 5 MVP. 
// Replace console.logs with real API calls using 'resend' and 'firebase-admin' packages.

export async function sendTransactionalEmail(to: string, subject: string, html: string) {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[EMAIL DEV] To: ${to} | Subject: ${subject}`)
        return { success: true, id: 'mock-email-id' }
    }

    // TODO: Implement Resend
    // import { Resend } from 'resend';
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // return await resend.emails.send({ from: 'Stylernow <onboarding@resend.dev>', to, subject, html });

    console.log(`[EMAIL PROD STUB] To: ${to} | Subject: ${subject}`)
    return { success: true }
}

export async function sendPushNotification(userId: string, title: string, body: string) {
    // 1. Get tokens from DB (Pseudo-code, call DB helper)
    // const tokens = await supabase.from('user_devices').select('fcm_token').eq('user_id', userId)

    console.log(`[PUSH STUB] User: ${userId} | "${title}": ${body}`)
    return { success: true }
}

export function getWhatsAppLink(phone: string, text: string) {
    // Format Phone: Remove non-numeric, ensure 57 prefix if implementation requires
    const cleanPhone = phone.replace(/\D/g, '')
    const finalPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}` // Default Colombia
    return `https://wa.me/${finalPhone}?text=${encodeURIComponent(text)}`
}
