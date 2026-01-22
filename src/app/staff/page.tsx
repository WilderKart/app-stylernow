import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { updateBookingStatus } from '@/app/actions/staff'

// Client Component for Buttons to avoid cluttering here? 
// Or simple form actions. Let's make a small client component for the actions row.
import { StaffBookingActions } from '@/components/staff/StaffBookingActions'

export default async function StaffPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // Get Staff Profile
    const { data: staff } = await supabase
        .from('staff')
        .select('id, name, image_url, barberia_id')
        .eq('user_id', user.id)
        .single()

    if (!staff) {
        return (
            <div className="p-6 text-center text-gray-500">
                <h1 className="text-xl font-bold mb-2">Acceso Restringido</h1>
                <p>No tienes un perfil de Staff activo asociado a tu cuenta.</p>
            </div>
        )
    }

    // Get Bookings (Today & Future)
    // RLS ensures we only see ours
    const now = new Date().toISOString()
    const todayStart = now.split('T')[0]

    const { data: bookings } = await supabase
        .from('reservas')
        .select(`
        id, 
        start_time, 
        end_time, 
        status, 
        price: services(price),
        service: services(name, duration),
        client: users(email) 
    `)
        // Note: client name might involve a profile table join later. Using email for MVP or mock logic.
        // Ideally we join public.users -> but public.users only has email? 
        // Let's assume public.users has no name yet. We'll use "Cliente".
        .gte('start_time', todayStart)
        .order('start_time', { ascending: true })

    // stats
    const todayBookings = bookings?.filter(b => b.start_time.startsWith(todayStart)) || []
    const completedToday = todayBookings.filter(b => b.status === 'completed').length

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white p-6 shadow-sm border-b border-gray-100">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Panel de Staff</p>
                        <h1 className="text-2xl font-bold text-gray-900">Hola, {staff.name.split(' ')[0]}</h1>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                        {staff.image_url && <Image src={staff.image_url} alt="Profile" fill className="object-cover" />}
                    </div>
                </div>
            </header>

            <div className="p-4 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-black text-white p-4 rounded-xl shadow-lg">
                        <span className="block text-3xl font-bold">{todayBookings.length}</span>
                        <span className="text-xs opacity-70">Citas Hoy</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <span className="block text-3xl font-bold text-green-600">{completedToday}</span>
                        <span className="text-xs text-gray-500">Completadas</span>
                    </div>
                </div>

                {/* Agenda */}
                <div>
                    <h2 className="font-bold text-lg mb-4">Tu Agenda</h2>

                    {bookings && bookings.length > 0 ? (
                        <div className="space-y-3">
                            {bookings.map((booking: any) => {
                                const startTime = new Date(booking.start_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                                const isToday = booking.start_time.startsWith(todayStart)

                                return (
                                    <div key={booking.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`px-2 py-1 rounded text-xs font-bold ${isToday ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                    {startTime}
                                                </div>
                                                {!isToday && (
                                                    <span className="text-xs text-gray-400">
                                                        {new Date(booking.start_time).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        booking.status === 'completed' ? 'bg-gray-100 text-gray-500 line-through' :
                                                            'bg-red-50 text-red-500'
                                                }`}>
                                                {booking.status === 'pending' && 'Pendiente'}
                                                {booking.status === 'confirmed' && 'Confirmada'}
                                                {booking.status === 'completed' && 'Finalizada'}
                                                {booking.status === 'cancelled' && 'Cancelada'}
                                            </span>
                                        </div>

                                        <h3 className="font-bold text-gray-900">{booking.service?.name}</h3>
                                        <p className="text-sm text-gray-500 mb-4">Cliente Invitado</p>

                                        <StaffBookingActions
                                            bookingId={booking.id}
                                            currentStatus={booking.status}
                                        />
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <p>No tienes citas programadas.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
