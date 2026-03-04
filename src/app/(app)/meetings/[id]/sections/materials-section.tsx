'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { MeetingMaterial, User } from '@/types'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const PDF_TYPE = 'application/pdf'

function MaterialItem({ material, canDelete, onDelete }: {
  material: MeetingMaterial
  canDelete: boolean
  onDelete: () => void
}) {
  const [expanded, setExpanded] = useState(false)
  const [signedUrl, setSignedUrl] = useState('')

  async function openFile() {
    const res = await fetch(`/api/materials/${material.id}/url`)
    const { url } = await res.json()
    setSignedUrl(url)
    if (!IMAGE_TYPES.includes(material.mime_type || '') && material.mime_type !== PDF_TYPE) {
      window.open(url, '_blank')
    } else {
      setExpanded(true)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full shrink-0">
            {material.type === 'link' ? '链接' : material.type === 'md' ? 'MD' : '文件'}
          </span>
          <span className="text-sm text-gray-900 truncate">{material.title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0 ml-2">
          {material.type === 'link' && (
            <a href={material.url!} target="_blank" rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800">打开</a>
          )}
          {material.type === 'md' && (
            <button onClick={() => setExpanded(!expanded)}
              className="text-xs text-blue-600 hover:text-blue-800">{expanded ? '收起' : '预览'}</button>
          )}
          {material.type === 'file' && (
            <button onClick={openFile} className="text-xs text-blue-600 hover:text-blue-800">查看/下载</button>
          )}
          {canDelete && (
            <button onClick={onDelete} className="text-xs text-red-500 hover:text-red-700">删除</button>
          )}
        </div>
      </div>

      {expanded && material.type === 'md' && (
        <div className="mt-3 pt-3 border-t border-gray-100 prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{material.content || ''}</ReactMarkdown>
        </div>
      )}
      {expanded && material.type === 'file' && signedUrl && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          {IMAGE_TYPES.includes(material.mime_type || '') && (
            <img src={signedUrl} alt={material.title} className="max-w-full rounded" />
          )}
          {material.mime_type === PDF_TYPE && (
            <iframe src={signedUrl} className="w-full h-96 rounded" />
          )}
        </div>
      )}
    </div>
  )
}

function AddMaterialForm({ meetingId, onAdd }: { meetingId: string; onAdd: () => void }) {
  const [type, setType] = useState<'link' | 'file' | 'md'>('link')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [content, setContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    fd.append('type', type)
    fd.append('title', title || (type === 'link' ? url : file?.name || 'MD 内容'))
    if (type === 'link') fd.append('url', url)
    if (type === 'md') fd.append('content', content)
    if (type === 'file' && file) fd.append('file', file)

    await fetch(`/api/meetings/${meetingId}/materials`, { method: 'POST', body: fd })
    setLoading(false)
    setOpen(false)
    setTitle(''); setUrl(''); setContent(''); setFile(null)
    onAdd()
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="text-sm text-blue-600 hover:text-blue-800">+ 添加资料</button>
  )

  return (
    <form onSubmit={submit} className="border border-blue-200 rounded-lg p-4 space-y-3 bg-blue-50">
      <div className="flex gap-2">
        {(['link', 'file', 'md'] as const).map(t => (
          <button key={t} type="button" onClick={() => setType(t)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              type === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-300'
            }`}>
            {t === 'link' ? '链接' : t === 'file' ? '文件' : 'MD'}
          </button>
        ))}
      </div>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="标题（可选）"
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      {type === 'link' && (
        <input type="url" value={url} onChange={e => setUrl(e.target.value)} required placeholder="https://..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      )}
      {type === 'md' && (
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={6} required placeholder="粘贴 Markdown 内容..."
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
      )}
      {type === 'file' && (
        <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} required
          className="w-full text-sm text-gray-600" />
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? '上传中...' : '添加'}
        </button>
        <button type="button" onClick={() => setOpen(false)}
          className="text-gray-600 px-4 py-1.5 rounded-lg text-sm hover:bg-gray-100">取消</button>
      </div>
    </form>
  )
}

export default function MaterialsSection({ meetingId, materials, presenters, currentUser, onUpdate }: {
  meetingId: string
  materials: MeetingMaterial[]
  presenters: User[]
  currentUser: User | null
  onUpdate: () => void
}) {
  async function deleteMaterial(id: string) {
    if (!confirm('确认删除？')) return
    await fetch(`/api/meetings/${meetingId}/materials?material_id=${id}`, { method: 'DELETE' })
    onUpdate()
  }

  return (
    <section>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">成员分享</h2>
      <div className="space-y-4">
        {presenters.map(presenter => {
          const presenterMaterials = materials.filter(m => m.user_id === presenter.id)
          const isMe = currentUser?.id === presenter.id

          return (
            <div key={presenter.id} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{presenter.name}</h3>
                {isMe && <AddMaterialForm meetingId={meetingId} onAdd={onUpdate} />}
              </div>
              <div className="space-y-2">
                {presenterMaterials.map(m => (
                  <MaterialItem key={m.id} material={m} canDelete={isMe}
                    onDelete={() => deleteMaterial(m.id)} />
                ))}
                {presenterMaterials.length === 0 && (
                  <p className="text-sm text-gray-400 italic">暂未上传资料</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
