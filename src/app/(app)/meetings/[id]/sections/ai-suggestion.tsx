'use client'
import { useState } from 'react'
import type { Meeting } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react'

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
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-indigo-500 rounded-full" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h2 className="font-semibold text-gray-900">下次方向建议</h2>
          </div>
        </div>
        {isAdmin && (
          <Button
            onClick={generate}
            disabled={loading}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white h-7 text-xs gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {loading ? 'AI 分析中...' : 'AI 生成建议'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        {displaySuggestion && (
          <div className="space-y-4">
            {meeting.next_direction_confirmed && !suggestion && (
              <Badge className="bg-indigo-100 text-indigo-700 border-0 hover:bg-indigo-100">
                已确认
              </Badge>
            )}

            <div>
              <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-1.5">聚焦方向</p>
              <p className="text-gray-900 font-medium">{displaySuggestion.focus}</p>
            </div>

            {displaySuggestion.topics?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide mb-2">建议话题</p>
                <ul className="space-y-1.5">
                  {displaySuggestion.topics.map((t: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {displaySuggestion.reasoning && (
              <div>
                <button
                  onClick={() => setReasoningOpen(!reasoningOpen)}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
                >
                  {reasoningOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {reasoningOpen ? '收起建议依据' : '查看建议依据'}
                </button>
                {reasoningOpen && (
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">{displaySuggestion.reasoning}</p>
                )}
              </div>
            )}

            {isAdmin && suggestion && (
              <Button
                onClick={confirm}
                disabled={confirming}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {confirming ? '确认中...' : '确认此方向'}
              </Button>
            )}
          </div>
        )}

        {!displaySuggestion && !loading && (
          <div className="text-center py-6 text-gray-400 text-sm">
            {isAdmin ? '点击"AI 生成建议"，AI 将分析本次会议内容并给出下次方向建议' : '管理员尚未生成下次方向建议'}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
