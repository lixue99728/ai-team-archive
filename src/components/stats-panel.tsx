import type { User } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { CalendarDays, Mic } from 'lucide-react'

interface Props {
  meetingCount: number
  users: User[]
  shareCounts: Record<string, number>
}

export default function StatsPanel({ meetingCount, users, shareCounts }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
      <Card>
        <CardContent className="pt-5 pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <CalendarDays className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{meetingCount}</p>
              <p className="text-xs text-gray-500 mt-0.5">累计会议</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {users.map(user => (
        <Card key={user.id}>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Mic className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{shareCounts[user.id] || 0}</p>
                <p className="text-xs text-gray-500 mt-0.5">{user.name} 分享</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
