'use client'

import Image from 'next/image'

interface Staff {
    id: string
    name: string
    role: string
    image_url: string | null
}

interface Props {
    staffMembers: Staff[]
    selectedId: string | null
    onSelect: (staffId: string) => void
}

export function StaffSelector({ staffMembers, selectedId, onSelect }: Props) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {/* Option: Any Professional */}
            <button
                onClick={() => onSelect('any')}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedId === 'any'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-gray-900 border-gray-100'
                    }`}
            >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${selectedId === 'any' ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                    ?
                </div>
                <div className="text-left">
                    <p className="font-bold text-sm">Cualquiera</p>
                    <p className={`text-xs ${selectedId === 'any' ? 'text-gray-400' : 'text-gray-500'}`}>
                        Disponibilidad
                    </p>
                </div>
            </button>

            {staffMembers.map((staff) => (
                <button
                    key={staff.id}
                    onClick={() => onSelect(staff.id)}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedId === staff.id
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-gray-900 border-gray-100'
                        }`}
                >
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                        {staff.image_url ? (
                            <Image src={staff.image_url} alt={staff.name} fill className="object-cover" />
                        ) : (
                            <div className="flex items-center justify-center h-full text-xs font-bold bg-gray-300 text-gray-600">
                                {staff.name[0]}
                            </div>
                        )}
                    </div>
                    <div className="text-left min-w-0">
                        <p className="font-bold text-sm truncate">{staff.name}</p>
                        <p className={`text-xs truncate ${selectedId === staff.id ? 'text-gray-400' : 'text-gray-500'}`}>
                            {staff.role}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    )
}
