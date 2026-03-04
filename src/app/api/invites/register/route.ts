import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { token, name, email, password } = await request.json()

  const adminSupabase = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: invite } = await adminSupabase
    .from('invites')
    .select('*')
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!invite) return NextResponse.json({ error: '邀请链接无效或已过期' }, { status: 400 })

  const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
    email, password, email_confirm: true
  })
  if (authError) return NextResponse.json({ error: authError.message }, { status: 400 })

  await adminSupabase.from('users').insert({
    id: authData.user.id, name, role: 'member'
  })

  await adminSupabase.from('invites').update({
    used_by: authData.user.id,
    used_at: new Date().toISOString()
  }).eq('id', invite.id)

  return NextResponse.json({ success: true })
}
