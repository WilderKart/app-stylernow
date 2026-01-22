'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ServiceSelector } from './ServiceSelector'
import { StaffSelector } from './StaffSelector'
import { BookingCalendar } from './BookingCalendar'
import { getAvailableSlots, createBooking } from '@/app/actions/booking'
import { initiateBookingPayment } from '@/app/actions/payment'

interface Props {
    barberiaId: string
    services: any[]
    staffMembers: any[]
}
import { checkBirthdayBenefit, redeemBirthdayBenefit } from '@/app/actions/growth'

export function BookingWizard({ barberiaId, services, staffMembers }: Props) {
    const router = useRouter()

    // State
    const [step, setStep] = useState(1)
    const [selectedService, setSelectedService] = useState<any>(null)
    const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [availableSlots, setAvailableSlots] = useState<any[]>([])
    const [selectedSlot, setSelectedSlot] = useState<any>(null)
    const [loadingSlots, setLoadingSlots] = useState(false)
    const [isBooking, setIsBooking] = useState(false)
    const [isBirthdayEligible, setIsBirthdayEligible] = useState(false)
    const [redeemBirthday, setRedeemBirthday] = useState(false)

    // Check birthday on mount
    useEffect(() => {
        checkBirthdayBenefit().then(res => setIsBirthdayEligible(res.eligible))
    }, [])

    // Fetch slots when date/staff/service changes
    useEffect(() => {
        if (step === 3 && selectedDate && selectedService) {
            setLoadingSlots(true)
            setAvailableSlots([])

            const fetchSlots = async () => {
                const slots = await getAvailableSlots(barberiaId, selectedDate, selectedService.duration)

                // Filter by specific staff if selected (and not 'any')
                let filtered = slots
                if (selectedStaffId && selectedStaffId !== 'any') {
                    filtered = slots.filter((s: any) => s.staff_id === selectedStaffId)
                }

                setAvailableSlots(filtered)
                setLoadingSlots(false)
            }

            fetchSlots()
        }
    }, [step, selectedDate, selectedService, selectedStaffId, barberiaId])

    const handleNext = () => {
        setStep(prev => prev + 1)
    }

    const handleBack = () => {
        setStep(prev => prev - 1)
    }

    // --- RENDER STEPS ---

    return (
        <div className="pb-24">
            {/* Progress Bar */}
            <div className="flex gap-2 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? 'bg-black' : 'bg-gray-100'}`} />
                ))}
            </div>

            <div className="mb-4">
                <h2 className="text-2xl font-bold">
                    {step === 1 && 'Elige un servicio'}
                    {step === 2 && 'Selecciona profesional'}
                    {step === 3 && 'Fecha y Hora'}
                    {step === 4 && 'Confirmar Reserva'}
                </h2>
                <p className="text-gray-500 text-sm">
                    {step === 1 && '¿Qué te gustaría hacerte hoy?'}
                    {step === 2 && 'Elige a tu barbero de confianza'}
                    {step === 3 && 'Busca un espacio disponible'}
                    {step === 4 && 'Revisa los detalles finales'}
                </p>
            </div>

            {/* STEP 1: SERVICE */}
            {step === 1 && (
                <ServiceSelector
                    services={services}
                    selectedId={selectedService?.id}
                    onSelect={(svc) => {
                        setSelectedService(svc)
                        // Auto advance
                        setTimeout(() => setStep(2), 200)
                    }}
                />
            )}

            {/* STEP 2: STAFF */}
            {step === 2 && (
                <StaffSelector
                    staffMembers={staffMembers}
                    selectedId={selectedStaffId}
                    onSelect={(id) => {
                        setSelectedStaffId(id)
                        setTimeout(() => setStep(3), 200)
                    }}
                />
            )}

            {/* STEP 3: DATE & TIME */}
            {step === 3 && (
                <div className="space-y-6">
                    <BookingCalendar
                        selectedDate={selectedDate}
                        onSelect={setSelectedDate}
                    />

                    <div>
                        <h3 className="font-bold mb-3">Horarios Disponibles</h3>
                        {loadingSlots ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                            </div>
                        ) : !selectedDate ? (
                            <p className="text-gray-500 text-sm">Selecciona una fecha arriba.</p>
                        ) : availableSlots.length === 0 ? (
                            <p className="text-gray-500 text-sm">No hay horarios disponibles para esta fecha.</p>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {/* Unique slots logic: grouping by time? Or listing all options? 
                       If 'any' staff, we might see same time multiple times. 
                       Let's dedup times for display if 'any' is selected, OR show staff name.
                       Mobile first -> Compact grid.
                   */}
                                {availableSlots.map((slot, idx) => (
                                    <button
                                        key={`${slot.slot_time}-${slot.staff_id}`}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`py-2 px-1 rounded-lg border text-sm font-medium flex flex-col items-center ${selectedSlot === slot
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-gray-900 border-gray-200'
                                            }`}
                                    >
                                        <span>{slot.slot_time.substring(0, 5)}</span>
                                        {selectedStaffId === 'any' && (
                                            <span className="text-[10px] opacity-70 truncate w-full text-center">{slot.staff_name.split(' ')[0]}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* STEP 4: CONFIRM */}
            {step === 4 && (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
                    <div className="flex justify-between border-b pb-4">
                        <span className="text-gray-500">Servicio</span>
                        <span className="font-bold">{selectedService?.name}</span>
                    </div>
                    <div className="flex justify-between border-b pb-4">
                        <span className="text-gray-500">Profesional</span>
                        <span className="font-bold">
                            {selectedStaffId === 'any'
                                ? selectedSlot?.staff_name
                                : staffMembers.find(s => s.id === selectedStaffId)?.name}
                        </span>
                    </div>
                    <div className="flex justify-between border-b pb-4">
                        <span className="text-gray-500">Fecha</span>
                        <span className="font-bold">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between border-b pb-4">
                        <span className="text-gray-500">Hora</span>
                        <span className="font-bold">{selectedSlot?.slot_time.substring(0, 5)}</span>
                    </div>
                    <div className="flex justify-between text-lg pt-2">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">${redeemBirthday ? 0 : selectedService?.price.toLocaleString()}</span>
                    </div>
                    {isBirthdayEligible && (
                        <div className="bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-lg flex justify-between items-center cursor-pointer" onClick={() => setRedeemBirthday(!redeemBirthday)}>
                            <div className="flex gap-2 items-center">
                                <span className="text-2xl">🎂</span>
                                <div>
                                    <p className="font-bold text-sm">¡Feliz Cumpleaños!</p>
                                    <p className="text-xs">Tienes un corte gratis disponible.</p>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${redeemBirthday ? 'bg-white text-pink-500' : ''}`}>
                                {redeemBirthday && '✓'}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Footer Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between items-center max-w-[414px] mx-auto z-20">
                {step > 1 && (
                    <button onClick={handleBack} className="text-gray-500 font-medium px-4">
                        Atrás
                    </button>
                )}

                {step === 3 && selectedSlot && (
                    <button onClick={() => setStep(4)} className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg ml-auto">
                        Continuar
                    </button>
                )}

                {step === 4 && (
                    <button
                        onClick={async () => {
                            if (isBooking) return
                            setIsBooking(true)

                            const finalPrice = redeemBirthday ? 0 : selectedService.price

                            // If Birthday Free, bypass Payment
                            if (redeemBirthday) {
                                const res = await createBooking(
                                    barberiaId,
                                    selectedStaffId === 'any' ? selectedSlot.staff_id : selectedStaffId,
                                    selectedService.id,
                                    selectedDate!,
                                    selectedSlot.slot_time,
                                    0 // Free
                                )
                                if (res.success) {
                                    await redeemBirthdayBenefit(barberiaId)
                                    alert('¡Regalo de cumpleaños canjeado! Reserva confirmada.')
                                    router.push('/home')
                                } else {
                                    alert(res.error)
                                    setIsBooking(false)
                                }
                                return
                            }

                            const res = await initiateBookingPayment(
                                barberiaId,
                                selectedStaffId === 'any' ? selectedSlot.staff_id : selectedStaffId,
                                selectedService.id,
                                selectedDate!,
                                selectedSlot.slot_time,
                                finalPrice
                            )

                            if (res.error) {
                                alert(res.error)
                                setIsBooking(false)
                            } else if (res.success && res.paymentData) {
                                // Redirect to Wompi
                                const { publicKey, currency, amountInCents, reference, signature, redirectUrl } = res.paymentData
                                const wompiUrl = `https://checkout.wompi.co/p/?public-key=${publicKey}&currency=${currency}&amount-in-cents=${amountInCents}&reference=${reference}&signature-integrity=${signature}&redirect-url=${encodeURIComponent(redirectUrl)}`
                                window.location.href = wompiUrl
                            }
                        }}
                        disabled={isBooking}
                        className="bg-black text-white px-8 py-3 rounded-full font-bold shadow-lg w-full disabled:opacity-50 flex justify-center"
                    >
                        {isBooking ? 'Iniciando Pago...' : 'Ir a Pagar'}
                    </button>
                )}
            </div>
        </div>
    )
}
