'use client'

import { useState, useEffect } from 'react'

interface Props {
    selectedDate: string | null
    onSelect: (date: string) => void
}

export function BookingCalendar({ selectedDate, onSelect }: Props) {
    const [dates, setDates] = useState<Date[]>([])

    useEffect(() => {
        // Generate next 14 days
        const nextDays = []
        const today = new Date()
        for (let i = 0; i < 14; i++) {
            const d = new Date(today)
            d.setDate(today.getDate() + i)
            nextDays.push(d)
        }
        setDates(nextDays)
    }, [])

    return (
        <div className="flex gap-2 overflow-x-auto pb-4 pt-2 no-scrollbar">
            {dates.map((date) => {
                const dateStr = date.toISOString().split('T')[0] // YYYY-MM-DD local approx (careful with TZ)
                // Better: use local date string construction
                const offset = date.getTimezoneOffset()
                const localDate = new Date(date.getTime() - (offset * 60 * 1000))
                const isoDate = localDate.toISOString().split('T')[0]

                const isSelected = selectedDate === isoDate
                const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' })
                const dayNum = date.getDate()

                return (
                    <button
                        key={isoDate}
                        onClick={() => onSelect(isoDate)}
                        className={`flex flex-col items-center justify-center min-w-[60px] h-[70px] rounded-xl border transition-all ${isSelected
                                ? 'bg-black text-white border-black shadow-md'
                                : 'bg-white text-gray-600 border-gray-100 hover:border-gray-300'
                            }`}
                    >
                        <span className="text-xs uppercase font-medium">{dayName}</span>
                        <span className="text-xl font-bold">{dayNum}</span>
                    </button>
                )
            })}
        </div>
    )
}
