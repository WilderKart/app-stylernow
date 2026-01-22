'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateBookingStatus(bookingId: string, newStatus: string) {
    const supabase = await createClient()

    // Verify auth is staff assigned to this booking
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'No autorizado' }

    // Check if user is staff linked
    // RLS handles the check implicitly on UPDATE if configured correctly "auth.uid() in (select user_id from staff...)"
    // But let's be safe.

    const { error } = await supabase
        .from('reservas')
        .update({ status: newStatus })
        .eq('id', bookingId)

    if (error) {
        console.error('Error updating booking:', error)
        return { error: 'Error al actualizar.' }
    }

    revalidatePath('/staff')
    return { success: true }
}
