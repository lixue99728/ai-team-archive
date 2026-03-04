'use client'
import { useState } from 'react'
import type { Meeting } from '@/types'

export default function MeetingSummary({ meeting, isAdmin, onUpdate }: {
  meeting: Meeting
  isAdmin: boolean
  onUpdate: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [text, setText] = useState(meeting.summary || '')
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    await fetch(`/api/meetings/${meeting.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: text })
    })
    setSaving(false)
    setEditing(false)
    onUpdate()
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">会议总结</h2>
        {isAdmin && !editing && (
          <button onClick={() => setEditing(true)}
            className="text-sm text-blue-600 hover:text-blue-800">
            {meeting.summary ? '编辑' : '添加总结'}
          </button>
        )}
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea value={text} onChange={e => setText(e.target.value)} rows={10}
            placeholder="粘贴腾讯会议 AI 总结..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex gap-2">
            <button onClick={save} disabled={saving}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
            <button onClick={() => { setEditing(false); setText(meeting.summary || '') }}
              className="text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-100">
              取消
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {meeting.summary ? (
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{meeting.summary}</p>
          ) : (
            <p className="text-sm text-gray-400 italic">暂无总结</p>
          )}
        </div>
      )}
    </section>
  )
}
