import Image from 'next/image'
import Link from 'next/link'

interface Barberia {
    id: string
    name: string
    address: string
    image_url: string | null
    verified: boolean
}

export function BarberCard({ barberia }: { barberia: Barberia }) {
    return (
        <Link href={`/barberias/${barberia.id}`} className="block group">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-40 w-full bg-gray-200">
                    {barberia.image_url ? (
                        <Image
                            src={barberia.image_url}
                            alt={barberia.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 414px) 100vw, 414px"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            <span className="text-2xl">💈</span>
                        </div>
                    )}
                    {barberia.verified && (
                        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verificado
                        </div>
                    )}
                </div>
                <div className="p-3">
                    <h3 className="font-bold text-gray-900 group-hover:text-black truncate">{barberia.name}</h3>
                    <p className="text-sm text-gray-500 truncate flex items-center gap-1 mt-1">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {barberia.address || 'Ubicación no disponible'}
                    </p>
                </div>
            </div>
        </Link>
    )
}
