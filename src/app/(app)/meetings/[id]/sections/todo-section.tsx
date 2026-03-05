'use client'
import { useState } from 'react'
import type { Todo, User } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckSquare, Check } from 'lucide-react'

export default function TodoSection({ meetingId, todos: initialTodos, allUsers, currentUser, onUpdate }: {
  meetingId: string
  todos: Todo[]
  allUsers: User[]
  currentUser: User | null
  onUpdate: () => void
}) {
  const [todos, setTodos] = useState(initialTodos)
  const [content, setContent] = useState('')
  const [assigneeId, setAssigneeId] = useState('')
  const [adding, setAdding] = useState(false)

  async function addTodo(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return
    setAdding(true)
    const res = await fetch(`/api/meetings/${meetingId}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, assignee_id: assigneeId || null })
    })
    const data = await res.json()
    setTodos(prev => [...prev, data.todo])
    setContent('')
    setAssigneeId('')
    setAdding(false)
  }

  async function toggleDone(todo: Todo) {
    const res = await fetch(`/api/meetings/${meetingId}/todos?todo_id=${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ done: !todo.done })
    })
    const data = await res.json()
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, done: data.todo.done } : t))
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-blue-500 rounded-full" />
          <div className="flex items-center gap-1.5">
            <CheckSquare className="w-4 h-4 text-gray-500" />
            <h2 className="font-semibold text-gray-900">本次 Todo</h2>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {todos.map(todo => (
            <div key={todo.id}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <button
                onClick={() => toggleDone(todo)}
                className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                  todo.done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                {todo.done && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${todo.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {todo.content}
                </p>
                {todo.assignee && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    负责人：{(todo.assignee as any).name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={addTodo} className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          <Input
            type="text"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="添加待办事项..."
            required
          />
          <div className="flex items-center gap-2">
            <select
              value={assigneeId}
              onChange={e => setAssigneeId(e.target.value)}
              className="border border-input bg-background rounded-md px-2 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">不指派</option>
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <Button type="submit" disabled={adding || !content.trim()} size="sm">
              {adding ? '添加中...' : '添加'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
