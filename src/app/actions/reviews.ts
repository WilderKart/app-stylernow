'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitReview(bookingId: string, rating: number, comment: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // Check ownership by policy (booking client_id must match auth)
    // RLS handles it, but let's be graceful
    if (!user) return { error: 'No user' }

    const { error } = await supabase.from('reviews').insert({
        booking_id: bookingId,
        rating,
        comment
    })

    if (error) {
        console.error(error)
        return { error: 'Error submitting review' }
    }

    revalidatePath('/home')
    return { success: true }
}
