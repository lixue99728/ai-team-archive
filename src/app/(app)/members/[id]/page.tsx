import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: member }, { data: presenterRows }, { data: materials }] = await Promise.all([
    supabase.from('users').select('*').eq('id', id).single(),
    supabase.from('meeting_presenters')
      .select('meeting_id, meetings(id, title, date)')
      .eq('user_id', id),
    supabase.from('meeting_materials').select('*').eq('user_id', id).order('created_at', { ascending: false }),
  ])

  if (!member) notFound()

  const meetings = presenterRows?.map((r: any) => r.meetings).filter(Boolean) || []
  meetings.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const materialsByMeeting: Record<string, any[]> = {}
  materials?.forEach(m => {
    if (!materialsByMeeting[m.meeting_id]) materialsByMeeting[m.meeting_id] = []
    materialsByMeeting[m.meeting_id].push(m)
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-lg">
          {member.name[0]}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{member.name}</h1>
          <p className="text-sm text-gray-500">累计分享 {meetings.length} 次</p>
        </div>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">参与的会议</h2>
        <div className="space-y-4">
          {meetings.map((meeting: any) => (
            <div key={meeting.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <Link href={`/meetings/${meeting.id}`}
                className="font-medium text-gray-900 hover:text-blue-600">
                {meeting.title}
              </Link>
              <p className="text-sm text-gray-500 mt-0.5">
                {new Date(meeting.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
              {materialsByMeeting[meeting.id]?.length > 0 && (
                <div className="mt-3 space-y-1">
                  {materialsByMeeting[meeting.id].map((m: any) => (
                    <div key={m.id} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                        {m.type === 'link' ? '链接' : m.type === 'md' ? 'MD' : '文件'}
                      </span>
                      {m.title}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          {meetings.length === 0 && (
            <p className="text-gray-400 text-sm">暂无参与记录</p>
          )}
        </div>
      </section>
    </div>
  )
}
