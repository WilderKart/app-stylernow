import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    // Basic security check (e.g. for Vercel Cron)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Allow if no secret defined for dev, but warn
        if (process.env.CRON_SECRET) {
            return new NextResponse('Unauthorized', { status: 401 })
        }
    }

    const supabase = await createClient()

    try {
        // Call the Database Function to calculate ranking
        // This function should be defined in your PostgreSQL migrations
        // It aggregates reviews, popularity, etc., and updates 'barberia_weekly_score'
        const { error } = await supabase.rpc('calculate_weekly_ranking')

        if (error) {
            console.error('Error calculating ranking:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true, message: 'Ranking updated successfully' })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
