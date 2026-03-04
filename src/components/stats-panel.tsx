import type { User } from '@/types'

interface Props {
  meetingCount: number
  users: User[]
  shareCounts: Record<string, number>
}

export default function StatsPanel({ meetingCount, users, shareCounts }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-gray-900">{meetingCount}</p>
          <p className="text-sm text-gray-500 mt-1">累计会议</p>
        </div>
        {users.map(user => (
          <div key={user.id} className="text-center">
            <p className="text-3xl font-bold text-blue-600">{shareCounts[user.id] || 0}</p>
            <p className="text-sm text-gray-500 mt-1">{user.name} 分享次数</p>
          </div>
        ))}
      </div>
    </div>
  )
}
