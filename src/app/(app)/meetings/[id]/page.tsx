'use client'
import { useState, useEffect, use } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@/types'
import MeetingSummary from './sections/meeting-summary'
import MaterialsSection from './sections/materials-section'
import TodoSection from './sections/todo-section'
import AiSuggestion from './sections/ai-suggestion'

export default function MeetingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const [meetingRes, profileRes] = await Promise.all([
        fetch(`/api/meetings/${id}`).then(r => r.json()),
        fetch('/api/users/me').then(r => r.json()),
      ])
      setData(meetingRes)
      setCurrentUser(profileRes.user)
    }
    load()
  }, [id])

  if (!data) return <div className="text-center py-20 text-gray-500">加载中...</div>

  const isAdmin = currentUser?.role === 'admin'
  const { meeting, presenters, materials, todos, allUsers } = data

  function reload() {
    fetch(`/api/meetings/${id}`).then(r => r.json()).then(setData)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{meeting.title}</h1>
        <p className="text-gray-500 mt-1">
          {new Date(meeting.date).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        <div className="flex gap-2 mt-3">
          {presenters.map((p: User) => (
            <a key={p.id} href={`/members/${p.id}`}
              className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full hover:bg-blue-100">
              {p.name}
            </a>
          ))}
        </div>
      </div>

      <MeetingSummary meeting={meeting} isAdmin={isAdmin} onUpdate={reload} />
      <MaterialsSection meetingId={id} materials={materials} presenters={presenters} currentUser={currentUser} onUpdate={reload} />
      <TodoSection meetingId={id} todos={todos} allUsers={allUsers} currentUser={currentUser} onUpdate={reload} />
      <AiSuggestion meeting={meeting} isAdmin={isAdmin} onUpdate={reload} />
    </div>
  )
}
