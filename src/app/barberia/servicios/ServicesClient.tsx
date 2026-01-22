'use client'

import { useState } from 'react'
import { upsertService } from '@/app/actions/owner'
import { useRouter } from 'next/navigation'

// We will fetch services in a server component wrapper or here via useEffect if we stick to client for simple updates.
// Let's use Server Component wrapper pattern for list, and client for modal? 
// For now, let's put the List in the Page (Server) and Interactive in Client.

export default function ServicesPage({ services, barberiaId }: { services: any[], barberiaId: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [currentService, setCurrentService] = useState<any>(null)

    // Form State
    const [formData, setFormData] = useState({ name: '', price: 0, duration: 30, category: 'General' })

    const handleEdit = (svc: any) => {
        setCurrentService(svc)
        setFormData({ name: svc.name, price: svc.price, duration: svc.duration, category: svc.category })
        setIsEditing(true)
    }

    const handleNew = () => {
        setCurrentService(null)
        setFormData({ name: '', price: 0, duration: 30, category: 'General' })
        setIsEditing(true)
    }

    const handleSave = async () => {
        const res = await upsertService(currentService?.id, { ...formData, barberia_id: barberiaId })
        if (res.error) alert(res.error)
        else {
            setIsEditing(false)
            // Reload happens via server action revalidatePath, but current page might need refresh if it's strict SPA logic. 
            // In Next.js, revalidatePath usually updates generic server components.
        }
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen pb-20">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Mis Servicios</h1>
                <button onClick={handleNew} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">
                    + Nuevo
                </button>
            </header>

            <div className="space-y-3">
                {services.map(svc => (
                    <div key={svc.id} onClick={() => handleEdit(svc)} className="bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center cursor-pointer">
                        <div>
                            <h3 className="font-bold">{svc.name}</h3>
                            <p className="text-gray-500 text-xs">{svc.duration} min • {svc.category}</p>
                        </div>
                        <span className="font-bold text-sm bg-gray-50 px-2 py-1 rounded border">
                            ${svc.price.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            {/* Simple Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                        <h2 className="font-bold text-lg">{currentService ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>

                        <div>
                            <label className="text-xs font-bold text-gray-500">Nombre</label>
                            <input className="w-full border p-2 rounded-lg mt-1" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                        </div>
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500">Precio</label>
                                <input type="number" className="w-full border p-2 rounded-lg mt-1" value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-bold text-gray-500">Duración (min)</label>
                                <input type="number" className="w-full border p-2 rounded-lg mt-1" value={formData.duration} onChange={e => setFormData({ ...formData, duration: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Categoría</label>
                            <select className="w-full border p-2 rounded-lg mt-1" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                <option>Corte</option>
                                <option>Barba</option>
                                <option>Combo</option>
                                <option>Color</option>
                                <option>Otro</option>
                            </select>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 py-3 rounded-xl font-bold">Cancelar</button>
                            <button onClick={handleSave} className="flex-1 bg-black text-white py-3 rounded-xl font-bold">Guardar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
