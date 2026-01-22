'use client'

import { useState } from 'react'
import { updateBookingStatus } from '@/app/actions/staff'

interface Props {
    bookingId: string
    currentStatus: string
}

export function StaffBookingActions({ bookingId, currentStatus }: Props) {
    const [loading, setLoading] = useState(false)

    const handleUpdate = async (status: string) => {
        if (loading) return
        setLoading(true)
        await updateBookingStatus(bookingId, status)
        setLoading(false)
    }

    if (currentStatus === 'completed' || currentStatus === 'cancelled') {
        return null
    }

    return (
        <div className="flex gap-2 border-t pt-3 mt-1">
            {currentStatus === 'pending' && (
                <>
                    <button
                        onClick={() => handleUpdate('confirmed')}
                        disabled={loading}
                        className="flex-1 bg-black text-white py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform"
                    >
                        Confirmar
                    </button>
                    <button
                        onClick={() => handleUpdate('cancelled')}
                        disabled={loading}
                        className="flex-1 bg-white border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold"
                    >
                        Rechazar
                    </button>
                </>
            )}

            {currentStatus === 'confirmed' && (
                <button
                    onClick={() => handleUpdate('completed')}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm font-bold active:scale-95 transition-transform"
                >
                    Finalizar Servicio
                </button>
            )}
        </div>
    )
}
