import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, date, presenterIds } = await request.json()

  const { data: meeting, error } = await supabase
    .from('meetings')
    .insert({ title, date, created_by: user.id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (presenterIds?.length) {
    await supabase.from('meeting_presenters').insert(
      presenterIds.map((uid: string) => ({ meeting_id: meeting.id, user_id: uid }))
    )
  }

  return NextResponse.json({ meeting })
}
