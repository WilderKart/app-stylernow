import { createClient } from '@/lib/supabase/server'
import ServicesClient from './ServicesClient'

export default async function ServicesPageServer() {
    const supabase = await createClient()

    // Get my barberia ID
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>No autorizado</div>

    const { data: barberia } = await supabase.from('barberias').select('id').eq('owner_id', user.id).single()

    if (!barberia) return <div>No tienes barbería registrada.</div>

    const { data: services } = await supabase.from('services').select('*').eq('barberia_id', barberia.id).order('name')

    return <ServicesClient services={services || []} barberiaId={barberia.id} />
}
