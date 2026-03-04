import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: material } = await supabase.from('meeting_materials').select('url').eq('id', id).single()
  if (!material?.url) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await admin.storage.from('materials').createSignedUrl(material.url, 3600)
  return NextResponse.json({ url: data?.signedUrl })
}
