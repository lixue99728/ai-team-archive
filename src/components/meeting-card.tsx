import Link from 'next/link'
import type { Meeting, User } from '@/types'

interface Props {
  meeting: Meeting
  presenters: User[]
}

export default function MeetingCard({ meeting, presenters }: Props) {
  return (
    <Link href={`/meetings/${meeting.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">{meeting.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(meeting.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {meeting.next_direction_confirmed && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">已规划下次</span>
        )}
      </div>
      {presenters.length > 0 && (
        <div className="flex gap-2 mt-3">
          {presenters.map(p => (
            <span key={p.id} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {p.name}
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
