'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ReviewModal } from '@/components/reviews/ReviewModal'

type Booking = {
    id: string
    start_time: string
    status: string
    services: { name: string; price: number; duration: number }
    barberias: { name: string; image_url: string }
    staff: { first_name: string; last_name: string }
    reviews: { rating: number }[]
}

export function BookingsList({ bookings }: { bookings: Booking[] }) {
    const [selectedBooking, setSelectedBooking] = useState<string | null>(null)

    const now = new Date()
    const upcoming = bookings.filter(b => new Date(b.start_time) > now && b.status !== 'cancelled')
    const past = bookings.filter(b => new Date(b.start_time) <= now || b.status === 'cancelled')

    return (
        <div className="space-y-8">
            {/* Upcoming */}
            <section>
                <h2 className="font-bold text-lg mb-4">Próximas Citas</h2>
                {upcoming.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No tienes citas programadas.</p>
                ) : (
                    <div className="space-y-4">
                        {upcoming.map(booking => (
                            <BookingCard key={booking.id} booking={booking} isPast={false} onReview={() => { }} />
                        ))}
                    </div>
                )}
            </section>

            {/* Past */}
            <section>
                <h2 className="font-bold text-lg mb-4">Historial</h2>
                {past.length === 0 ? (
                    <p className="text-gray-400 text-sm italic">No tienes historial.</p>
                ) : (
                    <div className="space-y-4">
                        {past.map(booking => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                isPast={true}
                                onReview={() => setSelectedBooking(booking.id)}
                            />
                        ))}
                    </div>
                )}
            </section>

            {selectedBooking && (
                <ReviewModal
                    bookingId={selectedBooking}
                    onClose={() => setSelectedBooking(null)}
                />
            )}
        </div>
    )
}

function BookingCard({ booking, isPast, onReview }: { booking: Booking, isPast: boolean, onReview: () => void }) {
    const date = new Date(booking.start_time)
    const hasReview = booking.reviews && booking.reviews.length > 0

    return (
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-4">
            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                {booking.barberias.image_url ? (
                    <Image src={booking.barberias.image_url} alt={booking.barberias.name} fill className="object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">💈</div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold truncate">{booking.barberias.name}</h3>
                        <p className="text-xs text-gray-500">{booking.services.name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                        {booking.status}
                    </span>
                </div>

                <div className="mt-2 flex justify-between items-end">
                    <p className="text-sm font-medium">
                        {date.toLocaleDateString()} <span className="text-gray-400">|</span> {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>

                    {isPast && booking.status === 'confirmed' && (
                        hasReview ? (
                            <span className="text-xs text-yellow-500 font-bold">★ {booking.reviews[0].rating}</span>
                        ) : (
                            <button
                                onClick={onReview}
                                className="bg-black text-white text-xs px-3 py-1.5 rounded-lg font-bold"
                            >
                                Calificar
                            </button>
                        )
                    )}
                </div>
            </div>
        </div>
    )
}
