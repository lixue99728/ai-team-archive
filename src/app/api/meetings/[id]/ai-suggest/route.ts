import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const AI_API_URL = process.env.INTERNAL_AI_API_URL!

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [{ data: meeting }, { data: materials }, { data: todos }, { data: presenters }] = await Promise.all([
    supabase.from('meetings').select('*').eq('id', id).single(),
    supabase.from('meeting_materials').select('*, user:users(name)').eq('meeting_id', id),
    supabase.from('todos').select('*, assignee:users!todos_assignee_id_fkey(name)').eq('meeting_id', id),
    supabase.from('meeting_presenters').select('users(name)').eq('meeting_id', id),
  ])

  const presenterNames = presenters?.map((p: any) => p.users?.name).filter(Boolean).join('、')
  let context = `会议标题：${meeting.title}\n会议日期：${meeting.date}\n本次分享成员：${presenterNames}\n\n`

  if (meeting.summary) context += `## 会议总结\n${meeting.summary}\n\n`

  if (materials?.length) {
    context += `## 成员分享资料\n`
    materials.forEach((m: any) => {
      context += `- ${m.user?.name}：《${m.title}》`
      if (m.type === 'md' && m.content) context += `\n内容：${m.content.slice(0, 500)}${m.content.length > 500 ? '...' : ''}`
      if (m.type === 'link') context += `（链接）`
      if (m.type === 'file') context += `（文件：${m.mime_type}）`
      context += '\n'
    })
    context += '\n'
  }

  if (todos?.length) {
    context += `## 本次待办事项\n`
    todos.forEach((t: any) => {
      context += `- [${t.done ? '完成' : '待完成'}] ${t.content}${t.assignee ? `（负责人：${t.assignee.name}）` : ''}\n`
    })
  }

  const userPrompt = `你是一个 AI 小队的助理，帮助分析会议内容并为下次会议提供方向建议。

以下是本次会议的完整内容：

${context}

请根据以上内容，为下一次 AI 小队分享会议提供方向建议。
要求：
1. 建议要具体、可执行，结合本次分享的实际内容和待办情况
2. 聚焦方向用 1-2 句话概括
3. 给出 2-4 个具体建议话题
4. 简要说明建议依据

请严格以 JSON 格式返回，不要有其他文字：
{
  "focus": "下次会议建议聚焦的方向",
  "topics": ["建议话题1", "建议话题2"],
  "reasoning": "建议依据"
}`

  const aiRes = await fetch(AI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: userPrompt,
      model: 'gpt-4o',
      temperature: 0,
      max_output_tokens: 1024,
    }),
  })

  const aiData = await aiRes.json()

  if (aiData.code !== 0) {
    return NextResponse.json({ error: 'AI 接口调用失败，请重试' }, { status: 500 })
  }

  const text: string = aiData.data?.content || ''

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const suggestion = JSON.parse(jsonMatch?.[0] || text)
    return NextResponse.json({ suggestion })
  } catch {
    return NextResponse.json({ error: 'AI 返回格式异常，请重试' }, { status: 500 })
  }
}
