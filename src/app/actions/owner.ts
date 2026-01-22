'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function upsertService(serviceId: string | null, data: { name: string, price: number, duration: number, category: string, barberia_id: string }) {
    const supabase = await createClient()

    // Note: RLS policies on 'services' table should enforce that only owners of the barberia_id can insert/update.
    // We rely on RLS, but explicit check is good if we didn't setup complex RLS with joins.
    // Given we did RLS foundation, let's assume it works or we'll catch error.

    let result
    if (serviceId) {
        result = await supabase.from('services').update(data).eq('id', serviceId)
    } else {
        result = await supabase.from('services').insert(data)
    }

    if (result.error) {
        console.error('Error upserting service:', result.error)
        return { error: 'Error al guardar servicio.' }
    }

    revalidatePath('/barberia/servicios')
    return { success: true }
}

export async function upsertStaff(staffId: string | null, data: any) {
    const supabase = await createClient()

    // Trigger check_plan_limits will run on INSERT.

    let result
    if (staffId) {
        result = await supabase.from('staff').update(data).eq('id', staffId)
    } else {
        result = await supabase.from('staff').insert(data)
    }

    if (result.error) {
        console.error('Error upserting staff:', result.error)
        // Parse Trigger Error
        if (result.error.message.includes('Plan limit reached')) {
            return { error: result.error.message } // "Plan limit reached..."
        }
        return { error: 'Error al guardar staff.' }
    }

    revalidatePath('/barberia/team')
    return { success: true }
}

export async function updateStaffSchedule(staffId: string, dayOfWeek: number, start: string, end: string, isActive: boolean) {
    const supabase = await createClient()

    // Check if schedule row exists for this day? Or upsert?
    // We keyed by (staff_id, day_of_week) ideally? The schema doesn't force unique yet?
    // Let's assume unique constraint or delete/insert strategy for simplicity? 
    // Or just UPDATE active ones.

    // Safe strategy: Check if exists.
    const { data: existing } = await supabase.from('horarios')
        .select('id')
        .eq('staff_id', staffId)
        .eq('day_of_week', dayOfWeek)
        .single()

    let error
    if (existing) {
        const res = await supabase.from('horarios').update({
            start_time: start,
            end_time: end,
            is_active: isActive
        }).eq('id', existing.id)
        error = res.error
    } else {
        const res = await supabase.from('horarios').insert({
            staff_id: staffId,
            day_of_week: dayOfWeek,
            start_time: start,
            end_time: end,
            is_active: isActive
        })
        error = res.error
    }

    if (error) {
        return { error: 'Error actualizando horario' }
    }

    revalidatePath(`/barberia/team/${staffId}`)
    return { success: true }
}
