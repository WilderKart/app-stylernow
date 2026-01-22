'use client'

import { useState } from 'react'
import { upsertStaff } from '@/app/actions/owner'
import Image from 'next/image'

// For simple badges. 
function BarberBadge({ level }: { level: string }) {
    if (!level) return null
    if (level === 'PRO') return (
        <span className="bg-yellow-100 text-yellow-800 text-[10px] px-2 py-0.5 rounded border border-yellow-200 font-bold flex items-center gap-1">
            <span>🛡️</span> PRO
        </span>
    )
    if (level === 'EXPERT') return (
        <span className="bg-amber-100 text-amber-900 text-[10px] px-2 py-0.5 rounded border border-amber-300 font-bold flex items-center gap-1 shadow-sm">
            <span>⭐</span> EXPERT
        </span>
    )
    if (level === 'MASTER') return (
        <span className="bg-black text-yellow-400 text-[10px] px-2 py-0.5 rounded border border-yellow-500 font-bold flex items-center gap-1 shadow-md ring-1 ring-yellow-500/50">
            <span>👑</span> MASTER
        </span>
    )
    return null
}

export default function TeamClient({ staffMembers, barberiaId }: { staffMembers: any[], barberiaId: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [current, setCurrent] = useState<any>(null)
    const [name, setName] = useState('')
    const [role, setRole] = useState('')
    const [level, setLevel] = useState('PRO')

    const handleEdit = (s: any) => {
        setCurrent(s)
        setName(s.name)
        setRole(s.role)
        setLevel(s.level || 'PRO')
        setIsEditing(true)
    }

    const handleNew = () => {
        setCurrent(null)
        setName('')
        setRole('Barber')
        setLevel('PRO')
        setIsEditing(true)
    }

    const handleSave = async () => {
        const res = await upsertStaff(current?.id, {
            name, role, level, barberia_id: barberiaId, is_active: true
        })

        if (res.error) alert(res.error)
        else setIsEditing(false)
    }

    return (
        <div className="p-4 bg-gray-50 min-h-screen pb-20">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-xl font-bold">Mi Equipo</h1>
                <button onClick={handleNew} className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold">
                    + Nuevo
                </button>
            </header>

            <div className="grid grid-cols-2 gap-3">
                {staffMembers.map(s => (
                    <div key={s.id} onClick={() => handleEdit(s)} className={`bg-white p-3 rounded-xl border border-gray-100 relative group overflow-hidden ${s.level === 'MASTER' ? 'ring-1 ring-yellow-400' : ''}`}>
                        <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 relative">
                            {s.image_url && <Image src={s.image_url} alt={s.name} fill className="object-cover rounded-full" />}
                        </div>
                        <div className="text-center">
                            <h3 className="font-bold text-sm truncate">{s.name}</h3>
                            <p className="text-gray-500 text-xs truncate mb-2">{s.role}</p>

                            <div className="flex justify-center">
                                <BarberBadge level={s.level} />
                            </div>

                            <div className="grid grid-cols-2 gap-1 mt-3 border-t pt-2">
                                <div className="text-center">
                                    <span className="block text-xs font-bold">{s.services_completed || 0}</span>
                                    <span className="block text-[9px] text-gray-400">Svcs</span>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xs font-bold">⭐ {s.rating || 5.0}</span>
                                    <span className="block text-[9px] text-gray-400">Rate</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {isEditing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl space-y-4">
                        <h2 className="font-bold text-lg">{current ? 'Editar Staff' : 'Nuevo Miembro'}</h2>

                        <div>
                            <label className="text-xs font-bold text-gray-500">Nombre</label>
                            <input className="w-full border p-2 rounded-lg mt-1" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Rol</label>
                            <input className="w-full border p-2 rounded-lg mt-1" value={role} onChange={e => setRole(e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-gray-500">Nivel (Gamification)</label>
                            <select className="w-full border p-2 rounded-lg mt-1" value={level} onChange={e => setLevel(e.target.value)}>
                                <option value="PRO">PRO (Base)</option>
                                <option value="EXPERT">EXPERT (Mid)</option>
                                <option value="MASTER">MASTER (Top)</option>
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
