'use client'

import { useEffect, useState } from 'react'
import { getWeeklyTopBarberias } from '@/app/actions/growth'
import Image from 'next/image'
import Link from 'next/link'

export function TopWeeklyBarberias() {
    const [list, setList] = useState<any[]>([])

    useEffect(() => {
        getWeeklyTopBarberias().then(setList)
    }, [])

    if (list.length === 0) return null

    return (
        <section className="py-8 bg-black text-white px-4 rounded-xl my-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                🏆 Top Barberías de la Semana
            </h2>
            <div className="flex overflow-x-auto gap-4 pb-4">
                {list.map((item) => (
                    <Link key={item.barberias.id} href={`/barberias/${item.barberias.id}`}>
                        <div className="min-w-[200px] bg-gray-900 rounded-lg p-3 hover:scale-105 transition-transform cursor-pointer relative">
                            {/* Rank Badge */}
                            <div className="absolute -top-2 -left-2 bg-yellow-400 text-black font-bold w-8 h-8 rounded-full flex items-center justify-center border-2 border-black z-10">
                                #{item.rank}
                            </div>

                            <div className="h-24 bg-gray-800 rounded-md mb-2 relative overflow-hidden">
                                {item.barberias.image_url ? (
                                    <Image src={item.barberias.image_url} alt={item.barberias.name} fill className="object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-600">No Image</div>
                                )}
                            </div>
                            <h3 className="font-bold text-sm truncate">{item.barberias.name}</h3>
                            <p className="text-gray-400 text-xs">{item.barberias.city}</p>
                            <div className="mt-2 text-xs bg-gray-800 inline-block px-2 py-1 rounded">
                                Score: {Math.round(item.score)}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
