import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('users').select('*').order('name')
  return NextResponse.json({ users: data || [] })
}
