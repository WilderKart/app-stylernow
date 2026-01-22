import { createClient } from '@/lib/supabase/server'
import { BookingWizard } from '@/components/booking/BookingWizard'
import { redirect } from 'next/navigation'

export default async function BookingPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const barberiaId = params.id

    // Fetch Barberia Data (for validity)
    const { data: barberia } = await supabase.from('barberias').select('name').eq('id', barberiaId).single()

    if (!barberia) {
        return <div>Barbería no encontrada</div>
    }

    // Fetch Services
    const { data: services } = await supabase
        .from('services')
        .select('id, name, price, duration, category')
        .eq('barberia_id', barberiaId)
        .order('price')

    // Fetch Staff
    const { data: staffMembers } = await supabase
        .from('staff')
        .select('id, name, role, image_url')
        .eq('barberia_id', barberiaId)
        .eq('is_active', true)

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white p-4 sticky top-0 z-10 shadow-sm flex items-center gap-3">
                <a href="/home" className="text-gray-500">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </a>
                <div>
                    <h1 className="font-bold text-lg">{barberia.name}</h1>
                    <p className="text-xs text-green-600 font-medium">Reservando Cita</p>
                </div>
            </header>

            <div className="p-4">
                <BookingWizard
                    barberiaId={barberiaId}
                    services={services || []}
                    staffMembers={staffMembers || []}
                />
            </div>
        </div>
    )
}
