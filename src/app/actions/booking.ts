'use server'

import { createClient } from '@/lib/supabase/server'

export async function getAvailableSlots(barberiaId: string, date: string, duration: number = 30) {
    const supabase = await createClient()

    const { data, error } = await supabase.rpc('get_available_slots', {
        p_barberia_id: barberiaId,
        p_date: date,
        p_duration_minutes: duration
    })

    if (error) {
        console.error('Error fetching slots:', error)
        return []
    }


    return data
}

export async function createBooking(
    barberiaId: string,
    staffId: string,
    serviceId: string,
    date: string,   // YYYY-MM-DD
    time: string,   // HH:mm:ss
    price: number
) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    // Construct timestamp
    // Assuming date is local to barberia, and we store as timestamptz. 
    // For MVP, we treat date+time as literal timestamp.
    const startAt = `${date}T${time}`

    // NOTE: In production, we should recalculate end_time based on service duration from DB, not trust client.
    // Fetch service duration
    const { data: service } = await supabase
        .from('services')
        .select('duration')
        .eq('id', serviceId)
        .single()

    if (!service) return { error: 'Servicio no válido' }

    // Calc end time
    const startDate = new Date(startAt)
    const endDate = new Date(startDate.getTime() + service.duration * 60000)

    // Insert
    const { data, error } = await supabase
        .from('reservas')
        .insert({
            cliente_id: user.id,
            barberia_id: barberiaId,
            staff_id: staffId,
            service_id: serviceId,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            status: 'pending' // Default
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating booking:', error)
        return { error: 'Error al reservar. Inténtalo de nuevo.' }
    }

    return { success: true, bookingId: data.id }
}

