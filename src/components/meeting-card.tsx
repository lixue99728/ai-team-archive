import Link from 'next/link'
import type { Meeting, User } from '@/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CalendarDays } from 'lucide-react'

interface Props {
  meeting: Meeting
  presenters: User[]
}

export default function MeetingCard({ meeting, presenters }: Props) {
  return (
    <Link href={`/meetings/${meeting.id}`} className="block group">
      <Card className="border-l-4 border-l-blue-500 transition-all duration-150 group-hover:shadow-md group-hover:translate-x-0.5">
        <CardContent className="py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {meeting.title}
              </h3>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                <CalendarDays className="w-3.5 h-3.5 shrink-0" />
                <span>
                  {new Date(meeting.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
            </div>
            {meeting.next_direction_confirmed && (
              <Badge variant="success" className="shrink-0 mt-0.5">
                已规划下次
              </Badge>
            )}
          </div>
          {presenters.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {presenters.map(p => (
                <Badge key={p.id} variant="outline" className="text-xs font-normal">
                  {p.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
