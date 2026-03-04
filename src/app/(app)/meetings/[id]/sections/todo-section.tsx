'use client'
import { useState } from 'react'
import type { Todo, User } from '@/types'

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
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">本次 Todo</h2>
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        {todos.map(todo => (
          <div key={todo.id} className="flex items-start gap-3">
            <button onClick={() => toggleDone(todo)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                todo.done ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-gray-400'
              }`}>
              {todo.done && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${todo.done ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {todo.content}
              </p>
              {todo.assignee && (
                <p className="text-xs text-gray-500 mt-0.5">负责人：{(todo.assignee as any).name}</p>
              )}
            </div>
          </div>
        ))}

        <form onSubmit={addTodo} className="pt-2 border-t border-gray-100 space-y-2">
          <input type="text" value={content} onChange={e => setContent(e.target.value)}
            placeholder="添加待办事项..." required
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <div className="flex items-center gap-2">
            <select value={assigneeId} onChange={e => setAssigneeId(e.target.value)}
              className="border border-gray-200 rounded-lg px-2 py-1.5 text-sm text-gray-600 focus:outline-none">
              <option value="">不指派</option>
              {allUsers.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
            <button type="submit" disabled={adding || !content.trim()}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {adding ? '添加中...' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
