import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import MeetingCard from '@/components/meeting-card'
import StatsPanel from '@/components/stats-panel'
import type { User } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: meetings }, { data: allUsers }, { data: presenters }] = await Promise.all([
    supabase.from('users').select('*').eq('id', user!.id).single(),
    supabase.from('meetings').select('*').order('date', { ascending: false }),
    supabase.from('users').select('*').order('name'),
    supabase.from('meeting_presenters').select('meeting_id, user_id, users(id, name, avatar_url, role, created_at)')
  ])

  const presentersMap: Record<string, User[]> = {}
  const shareCounts: Record<string, number> = {}

  presenters?.forEach((p: any) => {
    if (!presentersMap[p.meeting_id]) presentersMap[p.meeting_id] = []
    if (p.users) {
      presentersMap[p.meeting_id].push(p.users)
      shareCounts[p.user_id] = (shareCounts[p.user_id] || 0) + 1
    }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">会议记录</h1>
          <p className="text-sm text-gray-500 mt-1">团队知识共享与回顾</p>
        </div>
        {profile?.role === 'admin' && (
          <Link href="/meetings/new"
            className="inline-flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <span className="text-base leading-none">+</span>
            新建会议
          </Link>
        )}
      </div>

      <StatsPanel
        meetingCount={meetings?.length || 0}
        users={allUsers || []}
        shareCounts={shareCounts}
      />

      <div className="space-y-3">
        {meetings?.map(meeting => (
          <MeetingCard
            key={meeting.id}
            meeting={meeting}
            presenters={presentersMap[meeting.id] || []}
          />
        ))}
        {(!meetings || meetings.length === 0) && (
          <div className="text-center text-gray-400 py-16 border border-dashed border-gray-200 rounded-xl">
            还没有会议记录
          </div>
        )}
      </div>
    </div>
  )
}
