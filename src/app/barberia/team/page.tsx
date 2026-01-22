import { createClient } from '@/lib/supabase/server'
import TeamClient from './TeamClient'

export default async function TeamPageServer() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return <div>No autorizado</div>

    const { data: barberia } = await supabase.from('barberias').select('id').eq('owner_id', user.id).single()
    if (!barberia) return <div>No tienes barbería registrada.</div>

    const { data: staff } = await supabase.from('staff').select('*').eq('barberia_id', barberia.id).order('level', { ascending: false }) // Show MASTERS first? Or by name?

    return <TeamClient staffMembers={staff || []} barberiaId={barberia.id} />
}
