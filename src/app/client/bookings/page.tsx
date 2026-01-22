import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BookingsList } from '@/components/client/BookingsList'

export default async function ClientBookingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: bookings } = await supabase
        .from('bookings')
        .select(`
            id,
            start_time,
            status,
            services (name, price, duration),
            barberias (name, image_url),
            staff (first_name, last_name),
            reviews (rating)
        `)
        .eq('client_id', user.id)
        .order('start_time', { ascending: false })

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <header className="bg-white p-6 shadow-sm mb-6 sticky top-0 z-10">
                <h1 className="text-2xl font-bold">Mis Citas</h1>
            </header>

            <div className="px-4">
                <BookingsList bookings={bookings as any || []} />
            </div>

            {/* Simple Bottom Nav for Context */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around text-xs font-medium text-gray-400 max-w-[414px] mx-auto z-20">
                <a href="/home" className="flex flex-col items-center gap-1">
                    <span>🏠</span> Inicio
                </a>
                <a href="/client/bookings" className="flex flex-col items-center gap-1 text-black">
                    <span>📅</span> Citas
                </a>
                <a href="/profile" className="flex flex-col items-center gap-1">
                    <span>👤</span> Perfil
                </a>
            </div>
        </div>
    )
}
