'use client'
import { useState } from 'react'
import { submitReview } from '@/app/actions/reviews'

export function ReviewModal({ bookingId, onClose }: { bookingId: string, onClose: () => void }) {
    const [rating, setRating] = useState(5)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async () => {
        setSubmitting(true)
        await submitReview(bookingId, rating, comment)
        setSubmitting(false)
        onClose()
        alert('¡Gracias por tu reseña!')
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                <h2 className="font-bold text-lg text-center">Califica tu experiencia</h2>

                <div className="flex justify-center gap-2 text-3xl">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                            {star <= rating ? '⭐' : '☆'}
                        </button>
                    ))}
                </div>

                <textarea
                    className="w-full border p-3 rounded-xl text-sm"
                    placeholder="¿Qué tal estuvo el corte?"
                    rows={3}
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                />

                <div className="flex gap-2">
                    <button onClick={onClose} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Omitir</button>
                    <button onClick={handleSubmit} disabled={submitting} className="flex-1 bg-black text-white py-3 rounded-xl font-bold">Enviar</button>
                </div>
            </div>
        </div>
    )
}
