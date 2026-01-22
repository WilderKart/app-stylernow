'use server'

import { createClient } from '@/lib/supabase/server'
import { generateWompiSignature } from '@/lib/wompi' // Assumed reusable or re-implemented here if client-side restriction applies, but server actions are server.

export async function initiateBookingPayment(
    barberiaId: string,
    staffId: string,
    serviceId: string,
    date: string,
    time: string,
    price: number
) {
    const supabase = await createClient()

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    // 2. Get Barberia Wompi Keys
    const { data: barberia } = await supabase.from('barberias').select('wompi_pub_key, wompi_integrity_secret').eq('id', barberiaId).single()

    if (!barberia || !barberia.wompi_pub_key) {
        return { error: 'Esta barbería no tiene pagos configurados.' }
    }

    // 3. Create Booking (Pending Payment)
    const startAt = `${date}T${time}`
    const { data: service } = await supabase.from('services').select('duration').eq('id', serviceId).single()
    if (!service) return { error: 'Servicio inválido' }

    const startDate = new Date(startAt)
    const endDate = new Date(startDate.getTime() + service.duration * 60000)

    const { data: booking, error } = await supabase
        .from('reservas')
        .insert({
            cliente_id: user.id,
            barberia_id: barberiaId,
            staff_id: staffId,
            service_id: serviceId,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            status: 'pending_payment' // NEW STATUS
        })
        .select()
        .single()

    if (error) {
        console.error(error)
        return { error: 'Error al iniciar reserva' }
    }

    // 4. Generate Wompi Payload
    const reference = `BOOK-${booking.id}`
    const amountInCents = price * 100 // COP
    const currency = 'COP'
    const integritySecret = barberia.wompi_integrity_secret || 'test_integrity_secret_KEEP_SECRET' // Fallback for dev

    const signature = await generateWompiSignature(reference, amountInCents, currency, integritySecret)

    // Link Construction (Redirect URL)
    // Sandbox URL: https://checkout.wompi.co/p/?...
    // Parameters: public-key, currency, amount-in-cents, reference, signature-integrity, redirect-url

    const redirectUrl = `https://stylernow.com/home` // Should be a confirmation page checking status

    // Return data for the client to Navigate or Render Form
    return {
        success: true,
        paymentData: {
            publicKey: barberia.wompi_pub_key,
            currency,
            amountInCents,
            reference,
            signature,
            redirectUrl
        }
    }
}
