'use client'
import { useState } from 'react'
import type { Meeting } from '@/types'

interface Suggestion {
  focus: string
  topics: string[]
  reasoning: string
}

export default function AiSuggestion({ meeting, isAdmin, onUpdate }: {
  meeting: Meeting
  isAdmin: boolean
  onUpdate: () => void
}) {
  const [loading, setLoading] = useState(false)
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null)
  const [error, setError] = useState('')
  const [reasoningOpen, setReasoningOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)

  const savedSuggestion = meeting.next_direction ? (() => {
    try { return JSON.parse(meeting.next_direction) }
    catch { return { focus: meeting.next_direction, topics: [], reasoning: '' } }
  })() : null

  async function generate() {
    setLoading(true)
    setError('')
    const res = await fetch(`/api/meetings/${meeting.id}/ai-suggest`, { method: 'POST' })
    const data = await res.json()
    if (data.error) { setError(data.error); setLoading(false); return }
    setSuggestion(data.suggestion)
    setLoading(false)
  }

  async function confirm() {
    if (!suggestion) return
    setConfirming(true)
    await fetch(`/api/meetings/${meeting.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        next_direction: JSON.stringify(suggestion),
        next_direction_confirmed: true
      })
    })
    setConfirming(false)
    setSuggestion(null)
    onUpdate()
  }

  const displaySuggestion = suggestion || (meeting.next_direction_confirmed ? savedSuggestion : null)

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">下次方向建议</h2>
        {isAdmin && (
          <button onClick={generate} disabled={loading}
            className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50">
            {loading ? 'AI 分析中...' : 'AI 生成建议'}
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

      {displaySuggestion && (
        <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 space-y-4">
          {meeting.next_direction_confirmed && !suggestion && (
            <span className="inline-flex text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">已确认</span>
          )}

          <div>
            <p className="text-sm font-medium text-purple-900 mb-1">聚焦方向</p>
            <p className="text-gray-900">{displaySuggestion.focus}</p>
          </div>

          {displaySuggestion.topics?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-purple-900 mb-2">建议话题</p>
              <ul className="space-y-1">
                {displaySuggestion.topics.map((t: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-purple-400 mt-0.5">•</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {displaySuggestion.reasoning && (
            <div>
              <button onClick={() => setReasoningOpen(!reasoningOpen)}
                className="text-sm text-purple-600 hover:text-purple-800">
                {reasoningOpen ? '收起建议依据' : '查看建议依据'}
              </button>
              {reasoningOpen && (
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{displaySuggestion.reasoning}</p>
              )}
            </div>
          )}

          {isAdmin && suggestion && (
            <button onClick={confirm} disabled={confirming}
              className="w-full bg-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50">
              {confirming ? '确认中...' : '确认此方向'}
            </button>
          )}
        </div>
      )}

      {!displaySuggestion && !loading && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center text-gray-400 text-sm">
          {isAdmin ? '点击"AI 生成建议"，AI 将分析本次会议内容并给出下次方向建议' : '管理员尚未生成下次方向建议'}
        </div>
      )}
    </section>
  )
}
