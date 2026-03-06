'use client'
import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Paperclip, Upload, X, Plus } from 'lucide-react'
import MaterialDrawer from '@/components/material-drawer'
import type { MeetingMaterial, User } from '@/types'

// ── 类型判断工具 ──────────────────────────────────────────
function detectType(text: string): 'link' | 'md' {
  return /^https?:\/\//i.test(text.trim()) ? 'link' : 'md'
}

// ── 队列条目类型 ──────────────────────────────────────────
type QueueItem =
  | { kind: 'file'; file: File; title: string }
  | { kind: 'text'; text: string; title: string }

// ── 批量上传表单 ──────────────────────────────────────────
function AddMaterialForm({ meetingId, onAdd }: { meetingId: string; onAdd: () => void }) {
  const [open, setOpen] = useState(false)
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [textInput, setTextInput] = useState('')
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | File[]) {
    const items: QueueItem[] = Array.from(files).map(f => ({
      kind: 'file' as const, file: f, title: f.name
    }))
    setQueue(prev => [...prev, ...items])
  }

  function addText() {
    const t = textInput.trim()
    if (!t) return
    setQueue(prev => [...prev, { kind: 'text' as const, text: t, title: '' }])
    setTextInput('')
  }

  function removeItem(idx: number) {
    setQueue(prev => prev.filter((_, i) => i !== idx))
  }

  function updateTitle(idx: number, title: string) {
    setQueue(prev => prev.map((item, i) => i === idx ? { ...item, title } : item))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files)
  }

  async function submitAll() {
    if (!queue.length) return
    setUploading(true)

    await Promise.allSettled(queue.map(item => {
      const fd = new FormData()
      if (item.kind === 'file') {
        fd.append('type', 'file')
        fd.append('title', item.title || item.file.name)
        fd.append('file', item.file)
      } else {
        const type = detectType(item.text)
        fd.append('type', type)
        fd.append('title', item.title || (type === 'link' ? item.text.slice(0, 40) : '文本内容'))
        if (type === 'link') fd.append('url', item.text)
        else fd.append('content', item.text)
      }
      return fetch(`/api/meetings/${meetingId}/materials`, { method: 'POST', body: fd })
    }))

    setUploading(false)
    setQueue([])
    setOpen(false)
    onAdd()
  }

  if (!open) return (
    <Button variant="ghost" size="sm" onClick={() => setOpen(true)} className="text-blue-600 h-7 px-2">
      + 添加资料
    </Button>
  )

  return (
    <div className="border border-blue-200 rounded-lg p-4 space-y-3 bg-blue-50">
      {/* 拖拽区域 */}
      <div
        onDrop={handleDrop}
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragging ? 'border-blue-400 bg-blue-100' : 'border-gray-300 hover:border-blue-400 hover:bg-white'
        }`}
      >
        <Upload className="w-4 h-4 mx-auto mb-1 text-gray-400" />
        <p className="text-xs text-gray-500">拖拽文件到此，或点击选择文件（可多选）</p>
        <input ref={fileInputRef} type="file" multiple className="hidden"
          onChange={e => e.target.files && addFiles(e.target.files)} />
      </div>

      {/* 文本/链接输入 */}
      <div className="flex gap-2">
        <textarea
          value={textInput}
          onChange={e => setTextInput(e.target.value)}
          placeholder="粘贴链接或 Markdown 内容..."
          rows={2}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
        />
        <button onClick={addText}
          className="self-end p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* 队列列表 */}
      {queue.length > 0 && (
        <div className="space-y-2">
          {queue.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
                {item.kind === 'file' ? '文件' : detectType(item.text) === 'link' ? '链接' : 'MD'}
              </span>
              <input
                type="text"
                value={item.title}
                onChange={e => updateTitle(idx, e.target.value)}
                placeholder={item.kind === 'file' ? item.file.name : '标题（可选）'}
                className="flex-1 text-sm border-none outline-none bg-transparent text-gray-800 placeholder-gray-400 min-w-0"
              />
              <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-500 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex gap-2">
        <Button type="button" size="sm" disabled={uploading || queue.length === 0} onClick={submitAll}>
          {uploading ? '上传中...' : `全部上传（${queue.length}）`}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => { setOpen(false); setQueue([]) }}>
          取消
        </Button>
      </div>
    </div>
  )
}

// ── 资料列表项 ────────────────────────────────────────────
function MaterialItem({ material, canDelete, onDelete, onOpen }: {
  material: MeetingMaterial
  canDelete: boolean
  onDelete: () => void
  onOpen: (m: MeetingMaterial) => void
}) {
  const typeLabel = material.type === 'link' ? '链接' : material.type === 'md' ? 'MD' : '文件'
  return (
    <div
      onClick={() => onOpen(material)}
      className="border border-gray-100 rounded-lg p-3 bg-gray-50/50 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-between"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">{typeLabel}</span>
        <span className="text-sm text-gray-900 truncate">{material.title}</span>
      </div>
      {canDelete && (
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="text-xs text-red-500 hover:text-red-700 shrink-0 ml-2"
        >
          删除
        </button>
      )}
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────────
export default function MaterialsSection({ meetingId, materials, presenters, currentUser, onUpdate }: {
  meetingId: string
  materials: MeetingMaterial[]
  presenters: User[]
  currentUser: User | null
  onUpdate: () => void
}) {
  const [drawerMaterial, setDrawerMaterial] = useState<MeetingMaterial | null>(null)

  const openDrawer = useCallback((m: MeetingMaterial) => setDrawerMaterial(m), [])
  const closeDrawer = useCallback(() => setDrawerMaterial(null), [])

  async function deleteMaterial(id: string) {
    if (!confirm('确认删除？')) return
    await fetch(`/api/meetings/${meetingId}/materials?material_id=${id}`, { method: 'DELETE' })
    onUpdate()
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 bg-blue-500 rounded-full" />
            <div className="flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-gray-500" />
              <h2 className="font-semibold text-gray-900">成员分享</h2>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {presenters.map(presenter => {
              const presenterMaterials = materials.filter(m => m.user_id === presenter.id)
              const isMe = currentUser?.id === presenter.id
              return (
                <div key={presenter.id} className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 text-sm">{presenter.name}</h3>
                    {isMe && <AddMaterialForm meetingId={meetingId} onAdd={onUpdate} />}
                  </div>
                  <div className="space-y-2">
                    {presenterMaterials.map(m => (
                      <MaterialItem key={m.id} material={m} canDelete={isMe}
                        onDelete={() => deleteMaterial(m.id)} onOpen={openDrawer} />
                    ))}
                    {presenterMaterials.length === 0 && (
                      <p className="text-sm text-gray-400 italic">暂未上传资料</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <MaterialDrawer material={drawerMaterial} onClose={closeDrawer} />
    </>
  )
}
