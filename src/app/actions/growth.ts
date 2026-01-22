'use server'

import { createClient } from '@/lib/supabase/server'

export async function getWeeklyTopBarberias() {
    const supabase = await createClient()

    // Get Top 10 from this week
    // We join score -> barberias
    const { data } = await supabase.from('barberia_weekly_score')
        .select('score, rank, barberias(id, name, city, image_url)')
        .order('rank', { ascending: true })
        .limit(10)

    return data || []
}

export async function checkBirthdayBenefit() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { eligible: false }

    const { data: eligible } = await supabase.rpc('check_birthday_eligibility', { p_user_id: user.id })
    return { eligible: !!eligible }
}

export async function redeemBirthdayBenefit(barberiaId: string) {
    // Only called when submitting a booking if eligible
    // We register the redemption. 
    // Actual booking cost $0 logic handles in createBooking (needs update there too).
    // Or we just mark it redeemed here.

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'No user' }

    // Insert Reward Record
    const year = new Date().getFullYear()
    const { error } = await supabase.from('birthday_rewards').insert({
        user_id: user.id,
        year: year,
        redeemed: true
    })

    if (error) return { error: 'Error redeeming' }
    return { success: true }
}

export async function getUserGrowthData() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Get Points
    const { data: points } = await supabase.from('loyalty_points')
        .select('barberia_id, points_balance, barberias(name)')
        .eq('user_id', user.id)

    return { points }
}
