import { createClient } from '@/lib/supabase/server'
import { BarberList } from '@/components/home/BarberList'
import { HomeHeader } from '@/components/home/Header'
import { redirect } from 'next/navigation'

export default async function HomePage() {
    const supabase = await createClient()

    // Validate session again (redundant to middleware but good for data access context)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fetch real name from public.users if helpful, or just use metadata/email
    // Let's assume email for now until we have profiles setup fully
    const userName = user.email ? user.email.split('@')[0] : 'Invitado'

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="px-4 pt-2">
                <HomeHeader userName={userName} />

                {/* Search Bar Placeholder */}
                <div className="relative mb-6">
                    <input
                        type="text"
                        placeholder="Buscar barbería o servicio..."
                        className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-10 pr-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/5"
                        readOnly // For now
                    />
                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                <BarberList />
            </div>

            {/* Bottom Nav Placeholder - Can be a separate component */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center max-w-[414px] mx-auto z-10">
                <div className="flex flex-col items-center gap-1 text-black">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span className="text-[10px] font-medium">Inicio</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[10px] font-medium">Turnos</span>
                </div>
                <div className="flex flex-col items-center gap-1 text-gray-400">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-[10px] font-medium">Perfil</span>
                </div>
            </nav>
        </div>
    )
}
