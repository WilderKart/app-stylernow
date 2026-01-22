import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'

export default async function BarberiaPage() {
    const supabase = await createClient()

    // 1. Validate User
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    // 2. Fetch OWN barberia (RLS enforcement happens at row level, but query needs to match owner_id)
    // We can select * from barberias where owner_id = user.id
    const { data: barberia, error } = await supabase
        .from('barberias')
        .select('*')
        .eq('owner_id', user.id)
        .single()

    // 3. Fetch Services
    let services = []
    if (barberia) {
        const { data: servicesData } = await supabase
            .from('services')
            .select('*')
            .eq('barberia_id', barberia.id)
            .order('price', { ascending: true })

        services = servicesData || []
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <header className="bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold">Mi Negocio</h1>
                <p className="text-gray-500 text-sm">Panel de Administración</p>
            </header>

            <div className="p-4 space-y-6">

                {/* Status Card */}
                {barberia ? (
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0">
                            {barberia.image_url && (
                                <Image src={barberia.image_url} alt="Logo" fill className="object-cover" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="font-bold text-gray-900 truncate">{barberia.name}</h2>
                            <p className="text-sm text-gray-500 truncate">{barberia.address}</p>
                            <div className="mt-2 flex gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${barberia.verified ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                    {barberia.verified ? 'Verificado' : 'No Verificado'}
                                </span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Activo</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800">
                        <h3 className="font-bold mb-1">Perfil Incompleto</h3>
                        <p className="text-sm">Aún no has registrado tu barbería. Contáctanos para activarla.</p>
                    </div>
                )}

                {/* Quick Actions Grid */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 h-28">
                        <span className="text-2xl">📅</span>
                        <span className="text-sm font-medium">Agenda</span>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-2 h-28">
                        <span className="text-2xl">👥</span>
                        <span className="text-sm font-medium">Staff</span>
                    </div>
                </div>

                {/* Services List */}
                <div>
                    <h3 className="font-bold text-lg mb-3">Mis Servicios</h3>
                    {services.length > 0 ? (
                        <div className="space-y-3">
                            {services.map((svc: any) => (
                                <div key={svc.id} className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-900">{svc.name}</h4>
                                        <p className="text-xs text-gray-500">{svc.duration} min • {svc.category}</p>
                                    </div>
                                    <span className="font-bold text-sm bg-gray-50 px-2 py-1 rounded">
                                        ${svc.price.toLocaleString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-sm italic">No hay servicios registrados.</p>
                    )}
                </div>

            </div>

            {/* Bottom Nav (Owner) */}
            <nav className="fixed bottom-0 left-0 right-0 bg-black text-white px-6 py-3 flex justify-between items-center max-w-[414px] mx-auto z-10">
                <div className="flex flex-col items-center gap-1 text-yellow-500">
                    <span className="text-[10px] font-medium">Panel</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400">
                    <span className="text-[10px] font-medium">Finanzas</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400">
                    <span className="text-[10px] font-medium">Perfil</span>
                </div>
            </nav>
        </div>
    )
}
