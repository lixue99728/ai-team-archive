'use client'
import { useState } from 'react'
import type { Meeting } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { FileText } from 'lucide-react'

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
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-blue-500 rounded-full" />
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">会议总结</h2>
          </div>
        </div>
        {isAdmin && !editing && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="text-blue-600 hover:text-blue-700 h-7">
            {meeting.summary ? '编辑' : '添加总结'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-3">
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              rows={10}
              placeholder="粘贴腾讯会议 AI 总结..."
              className="text-sm resize-none"
            />
            <div className="flex gap-2">
              <Button onClick={save} disabled={saving} size="sm">
                {saving ? '保存中...' : '保存'}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { setEditing(false); setText(meeting.summary || '') }}>
                取消
              </Button>
            </div>
          </div>
        ) : (
          <div className="min-h-16">
            {meeting.summary ? (
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{meeting.summary}</p>
            ) : (
              <p className="text-sm text-gray-400 italic">暂无总结</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
