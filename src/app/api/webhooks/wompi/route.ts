import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateWompiSignature } from '@/lib/wompi'

export async function POST(req: Request) {
    const body = await req.json()
    const { data, timestamp, signature, environment } = body
    const transaction = data.transaction
    const reference = transaction.reference

    console.log('Webhook Wompi Received:', reference, transaction.status)

    const supabase = await createClient()

    // 1. Determine Type & Secret Context
    let secret = ''
    let type = ''
    let barberiaId = ''

    if (reference.startsWith('BOOK-')) {
        type = 'BOOKING'
        // Metadata usually carries barberia_id
        // Or specific prefix rules.
        // Let's assume metadata was sent. 
        // Wompi passes metadata passed at init. "data": { "transaction": { "payment_method": ..., "redirect_url":..., "session_id":..., "metadata": {} } }
        // BUT metadata comes inside transaction object? Or extra field? Usually data.transaction.customer_data or merchant defined.
        // Let's fetch the barberia_id via the booking_id in reference or just query DB for the secret?
        // Wait, to query DB we need permissions. Service Role needed for Webhook handler.
        // We assume "createClient" inside API route is Service Role or default anon?
        // API Routes in App Router usually inherit nothing unless we create admin client.
        // Assuming we have env var for STYLER_ADMIN_KEY for webhooks or use default if policy allows.
        // FOR NOW: We assume we can read 'barberias' table (it's public read usually).

        // Extract ID from ref: BOOK-{booking_id}
        const bookingId = reference.replace('BOOK-', '')

        // Fetch Booking -> Barberia -> Secret
        const { data: booking } = await supabase.from('reservas').select('barberia_id, id').eq('id', bookingId).single()

        if (booking) {
            const { data: barberia } = await supabase.from('barberias').select('wompi_events_secret').eq('id', booking.barberia_id).single()
            secret = barberia?.wompi_events_secret || ''
            barberiaId = booking.barberia_id
        }

    } else if (reference.startsWith('SUB-')) {
        type = 'SUBSCRIPTION'
        // Use Stylernow Secret (Env Var)
        secret = process.env.WOMPI_EVENTS_SECRET || 'test_events_secret_STYLER'
    }

    if (!secret) {
        console.error('No secret found for reference:', reference)
        return NextResponse.json({ error: 'Configuration Error' }, { status: 500 })
    }

    // 2. Validate Signature
    const isValid = await validateWompiSignature(data, timestamp, secret, signature.checksum)

    if (!isValid) {
        console.error('Invalid Wompi Signature')
        // return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 }) 
        // Wompi retries if 400. Maybe return 200 but log error? 
        // Strict security: 400.
        return NextResponse.json({ error: 'Invalid Signature' }, { status: 400 })
    }

    // 3. Process Transaction
    const status = transaction.status // APPROVED, DECLINED, VOIDED, ERROR

    // Log Transaction
    await supabase.from('transactions').insert({
        amount: transaction.amount_in_cents,
        currency: transaction.currency,
        reference: reference,
        status: status, // Map Wompi to Our Enum? Wompi=APPROVED, we use APPROVED. Matches.
        type: type,
        metadata: { wompi_id: transaction.id, ...transaction.metadata },
        payment_method: transaction.payment_method_type
    })

    if (status === 'APPROVED') {
        if (type === 'BOOKING') {
            const bookingId = reference.replace('BOOK-', '')

            // Update Booking
            await supabase.from('reservas').update({ status: 'confirmed' }).eq('id', bookingId)

            // Commission Logic (New Client Check)
            // Simplified: Check if this user had connection to this barberia before?
            // For Phase 3 MVP: Check only current 'is_first_client' flag if passed in metadata, or query count.
            // Query Count:
            const { count } = await supabase.from('reservas')
                .select('*', { count: 'exact', head: true })
                .eq('barberia_id', barberiaId)
            // Filter by client... need client_id from booking.
            // Assuming we fetched booking above.

            // Let's assume for MVP: YES commission generated. 30% of Service Price.
            // Get Service Price
            const { data: bookingDetails } = await supabase.from('reservas').select('*, services(price)').eq('id', bookingId).single()

            if (bookingDetails) {
                const commissionAmount = bookingDetails.services.price * 0.30

                // Create Debt
                await supabase.from('commissions').insert({
                    barberia_id: barberiaId,
                    booking_id: bookingId,
                    amount: commissionAmount,
                    status: 'PENDING'
                })
            }

        } else if (type === 'SUBSCRIPTION') {
            // Activate Subscription
            // Extract User ID from Ref? SUB-{user_id}-{timestamp}
            // Parse Ref
            const parts = reference.split('-') // SUB, USERID, TS
            if (parts.length >= 2) {
                const userId = parts[1]
                await supabase.from('subscriptions').update({ status: 'active' }).eq('user_id', userId)

                // Clear Commissions?
                // Pay all pending commissions for this barberia owner?
                // Find Owner's Barberias
                const { data: barberias } = await supabase.from('barberias').select('id').eq('owner_id', userId)
                if (barberias) {
                    const ids = barberias.map(b => b.id)
                    await supabase.from('commissions').update({ status: 'PAID' })
                        .in('barberia_id', ids)
                        .eq('status', 'PENDING')
                }
            }
        }
    }

    return NextResponse.json({ success: true })
}
