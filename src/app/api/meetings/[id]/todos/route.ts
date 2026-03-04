import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: meeting_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, assignee_id } = await request.json()
  const { data, error } = await supabase.from('todos').insert({
    meeting_id, content, assignee_id: assignee_id || null, created_by: user.id
  }).select('*, assignee:users!todos_assignee_id_fkey(*)').single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ todo: data })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: meeting_id } = await params
  const { searchParams } = new URL(request.url)
  const todo_id = searchParams.get('todo_id')
  const supabase = await createClient()

  const body = await request.json()
  const { data, error } = await supabase.from('todos').update(body).eq('id', todo_id!).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ todo: data })
}
