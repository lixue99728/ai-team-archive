import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: meeting_id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await request.formData()
  const type = formData.get('type') as string
  const title = formData.get('title') as string

  let materialData: any = { meeting_id, user_id: user.id, title, type }

  if (type === 'link') {
    materialData.url = formData.get('url') as string
  } else if (type === 'md') {
    materialData.content = formData.get('content') as string
  } else {
    const file = formData.get('file') as File
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const path = `${meeting_id}/${user.id}/${Date.now()}-${file.name}`
    const { error: uploadError } = await admin.storage.from('materials').upload(path, file)
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })
    materialData.url = path
    materialData.mime_type = file.type
    materialData.file_size = file.size
  }

  const { data, error } = await supabase.from('meeting_materials').insert(materialData).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ material: data })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: meeting_id } = await params
  const { searchParams } = new URL(request.url)
  const material_id = searchParams.get('material_id')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: material } = await supabase.from('meeting_materials').select('*').eq('id', material_id!).single()

  if (material?.type === 'file' && material.url) {
    const admin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    await admin.storage.from('materials').remove([material.url])
  }

  await supabase.from('meeting_materials').delete().eq('id', material_id!).eq('user_id', user.id)
  return NextResponse.json({ success: true })
}
