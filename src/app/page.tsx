import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RootPage() {
  const supabase = await createClient()

  // 1. Check Session
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Check Role / Context
  // We check if the user is an owner of a barberia to send them to their dashboard
  const { data: barberia } = await supabase
    .from('barberias')
    .select('id')
    .eq('owner_id', user.id)
    .single()

  if (barberia) {
    redirect('/barberia')
  }

  // 3. Default to Client Home
  redirect('/home')
}
