import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: meeting }, { data: presenters }, { data: materials }, { data: todos }, { data: allUsers }] =
    await Promise.all([
      supabase.from('meetings').select('*').eq('id', id).single(),
      supabase.from('meeting_presenters').select('user_id, users(*)').eq('meeting_id', id),
      supabase.from('meeting_materials').select('*').eq('meeting_id', id).order('created_at'),
      supabase.from('todos').select('*, assignee:users!todos_assignee_id_fkey(*)').eq('meeting_id', id).order('created_at'),
      supabase.from('users').select('*').order('name'),
    ])

  return NextResponse.json({
    meeting,
    presenters: presenters?.map((p: any) => p.users) || [],
    materials: materials || [],
    todos: todos || [],
    allUsers: allUsers || [],
  })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase.from('meetings').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ meeting: data })
}
