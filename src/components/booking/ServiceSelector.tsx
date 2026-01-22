'use client'

interface Service {
    id: string
    name: string
    price: number
    duration: number
    category: string
}

interface Props {
    services: Service[]
    selectedId: string | null
    onSelect: (service: Service) => void
}

export function ServiceSelector({ services, selectedId, onSelect }: Props) {
    return (
        <div className="space-y-3">
            {services.map((service) => (
                <button
                    key={service.id}
                    onClick={() => onSelect(service)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${selectedId === service.id
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-white text-gray-900 border-gray-100 hover:border-gray-200'
                        }`}
                >
                    <div>
                        <h4 className="font-bold">{service.name}</h4>
                        <p className={`text-sm ${selectedId === service.id ? 'text-gray-300' : 'text-gray-500'}`}>
                            {service.duration} min
                        </p>
                    </div>
                    <span className="font-bold">
                        ${service.price.toLocaleString()}
                    </span>
                </button>
            ))}
        </div>
    )
}
