import { createClient } from '@/lib/supabase/server'
import { BarberCard } from './BarberCard'

export async function BarberList() {
    const supabase = await createClient()

    // Strict RLS fetch - 'Public can view barberias' policy handles visibility
    const { data: barberias, error } = await supabase
        .from('barberias')
        .select('id, name, address, image_url, verified')
        .limit(10)

    if (error) {
        console.error('Error fetching barberias:', error)
        return <p className="text-red-500 text-center py-4">Error cargando barberías.</p>
    }

    if (!barberias || barberias.length === 0) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>No se encontraron barberías disponibles.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <h2 className="font-bold text-lg px-1">Barberías Destacadas</h2>
            <div className="grid grid-cols-1 gap-4">
                {barberias.map((barberia) => (
                    <BarberCard key={barberia.id} barberia={barberia} />
                ))}
            </div>
        </div>
    )
}
