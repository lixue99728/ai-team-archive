'use client'
import { useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { X, Copy, Check, ExternalLink, Download } from 'lucide-react'
import type { MeetingMaterial } from '@/types'

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const VIDEO_TYPES = ['video/mp4', 'video/quicktime']
const PDF_TYPE = 'application/pdf'

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button onClick={handleCopy}
      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-100">
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? '已复制' : '复制'}
    </button>
  )
}

function DrawerContent({ material }: { material: MeetingMaterial }) {
  const [fileUrl, setFileUrl] = useState('')

  useEffect(() => {
    if (material.type === 'file') {
      fetch(`/api/materials/${material.id}/url`)
        .then(r => r.json())
        .then(d => setFileUrl(d.url || ''))
    }
  }, [material.id, material.type])

  if (material.type === 'link') {
    return (
      <div className="flex flex-col gap-3 p-4">
        <p className="text-sm text-gray-600 break-all">{material.url}</p>
        <div className="flex gap-2">
          <a href={material.url!} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800">
            <ExternalLink className="w-4 h-4" /> 在新标签页打开
          </a>
          <CopyButton text={material.url!} />
        </div>
      </div>
    )
  }

  if (material.type === 'md') {
    return (
      <div className="p-4">
        <div className="prose prose-sm max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{material.content || ''}</ReactMarkdown>
        </div>
      </div>
    )
  }

  // file type
  if (!fileUrl) {
    return <div className="p-4 text-sm text-gray-400">加载中...</div>
  }

  if (IMAGE_TYPES.includes(material.mime_type || '')) {
    return (
      <div className="p-4 flex justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fileUrl} alt={material.title} className="max-w-full rounded" />
      </div>
    )
  }

  if (VIDEO_TYPES.includes(material.mime_type || '')) {
    return (
      <div className="p-4">
        <video src={fileUrl} controls className="w-full rounded" />
      </div>
    )
  }

  if (material.mime_type === PDF_TYPE) {
    return (
      <div className="p-4 h-full">
        <iframe src={fileUrl} className="w-full h-[calc(100vh-120px)] rounded"
          sandbox="allow-scripts allow-same-origin" title={material.title} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-sm text-gray-600">{material.title}</p>
      <a href={fileUrl} download={material.title}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800">
        <Download className="w-4 h-4" /> 下载文件
      </a>
    </div>
  )
}

export default function MaterialDrawer({ material, onClose }: {
  material: MeetingMaterial | null
  onClose: () => void
}) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (material) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [material, onClose])

  if (!material) return null

  const isMd = material.type === 'md'

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      {/* drawer */}
      <div className="relative w-full max-w-[480px] bg-white shadow-xl flex flex-col h-full overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
          <h3 className="font-medium text-gray-900 text-sm truncate flex-1 mr-2">{material.title}</h3>
          <div className="flex items-center gap-1 shrink-0">
            {isMd && <CopyButton text={material.content || ''} />}
            <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 text-gray-500">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* content */}
        <div className="flex-1 overflow-y-auto">
          <DrawerContent material={material} />
        </div>
      </div>
    </div>
  )
}
