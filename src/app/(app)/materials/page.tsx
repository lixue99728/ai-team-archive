'use client'
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search } from 'lucide-react'
import MaterialDrawer from '@/components/material-drawer'
import type { MeetingMaterial } from '@/types'

type MaterialWithContext = MeetingMaterial & {
  users: { id: string; name: string } | null
  meetings: { id: string; title: string; date: string } | null
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<MaterialWithContext[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [drawerMaterial, setDrawerMaterial] = useState<MeetingMaterial | null>(null)

  useEffect(() => {
    fetch('/api/materials')
      .then(r => r.json())
      .then(d => setMaterials(d.materials || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return materials
    return materials.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.users?.name?.toLowerCase().includes(q)
    )
  }, [materials, query])

  const typeLabel = (type: string) =>
    type === 'link' ? '链接' : type === 'md' ? 'MD' : '文件'

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">资料记录</h1>

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="搜索资料标题或分享者姓名..."
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="text-sm text-gray-400 p-6 text-center">加载中...</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-gray-400 p-6 text-center">暂无资料</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">资料标题</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-14">类型</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-20">分享者</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500">所属会议</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 w-28">日期</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m, i) => (
                <tr key={m.id}
                  className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${i === filtered.length - 1 ? 'border-none' : ''}`}
                  onClick={() => setDrawerMaterial(m)}
                >
                  <td className="px-4 py-3 text-gray-900 font-medium">{m.title}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {typeLabel(m.type)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{m.users?.name}</td>
                  <td className="px-4 py-3">
                    <Link href={`/meetings/${m.meetings?.id}`}
                      onClick={e => e.stopPropagation()}
                      className="text-blue-600 hover:text-blue-800">
                      {m.meetings?.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {m.meetings?.date
                      ? new Date(m.meetings.date).toLocaleDateString('zh-CN', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <MaterialDrawer material={drawerMaterial} onClose={() => setDrawerMaterial(null)} />
    </div>
  )
}
