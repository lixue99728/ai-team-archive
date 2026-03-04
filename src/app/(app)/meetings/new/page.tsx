'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'

export default function NewMeetingPage() {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [users, setUsers] = useState<User[]>([])
  const [selectedPresenters, setSelectedPresenters] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/users').then(r => r.json()).then(d => setUsers(d.users || []))
  }, [])

  function togglePresenter(id: string) {
    setSelectedPresenters(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, date, presenterIds: selectedPresenters })
    })
    const data = await res.json()
    if (data.meeting) router.push(`/meetings/${data.meeting.id}`)
    else setLoading(false)
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">新建会议</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">会议标题</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} required
            placeholder="例：第 3 次 AI 小队分享会"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">会议日期</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">本次分享成员</label>
          <div className="flex flex-wrap gap-2">
            {users.map(user => (
              <button key={user.id} type="button" onClick={() => togglePresenter(user.id)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  selectedPresenters.includes(user.id)
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {user.name}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading || !title}
          className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? '创建中...' : '创建会议'}
        </button>
      </form>
    </div>
  )
}
