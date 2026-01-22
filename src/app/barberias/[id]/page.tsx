import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'

export default async function BarberiaProfilePage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { id } = params

    const { data: barberia } = await supabase
        .from('barberias')
        .select('*')
        .eq('id', id)
        .single()

    if (!barberia) return <div>Barbería no encontrada</div>

    return (
        <div className="min-h-screen bg-white pb-20">
            {/* Hero Image */}
            <div className="relative h-64 w-full bg-gray-200">
                {barberia.image_url && (
                    <Image
                        src={barberia.image_url}
                        alt={barberia.name}
                        fill
                        className="object-cover"
                    />
                )}
                <Link href="/home" className="absolute top-4 left-4 bg-white/80 p-2 rounded-full backdrop-blur-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </Link>
            </div>

            <div className="px-5 py-6 rounded-t-3xl -mt-6 bg-white relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h1 className="text-2xl font-bold">{barberia.name}</h1>
                    {barberia.verified && (
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-bold">Verificado</span>
                    )}
                </div>
                <p className="text-gray-500 text-sm mb-6 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {barberia.address}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-gray-50 p-3 rounded-xl text-center">
                        <span className="block font-bold text-gray-900">4.8</span>
                        <span className="text-xs text-gray-400">Puntuación</span>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl text-center">
                        <span className="block font-bold text-gray-900">Abierto</span>
                        <span className="text-xs text-green-500">Hoy hasta 20:00</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-bold">Descripción</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">
                        Especialistas en cortes clásicos y modernos. Disfruta de una experiencia premium con nuestros mejores barberos.
                    </p>
                </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 max-w-[414px] mx-auto z-20">
                <div className="flex gap-3">
                    {barberia.phone && (
                        <a
                            href={`https://wa.me/${barberia.phone.replace(/[^0-9]/g, '')}?text=Hola, quiero reservar una cita.`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-500 text-white p-4 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center aspect-square"
                            aria-label="Contactar por WhatsApp"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </a>
                    )}
                    <Link
                        href={`/barberias/${id}/book`}
                        className="flex-1 bg-black text-white text-center py-4 rounded-full font-bold text-lg shadow-lg hover:bg-gray-900 transition-colors"
                    >
                        Reservar Cita
                    </Link>
                </div>
            </div>
        </div>
    )
}
