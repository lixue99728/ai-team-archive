'use client'
import { useState, useEffect } from 'react'

export default function AdminInvitesPage() {
  const [invites, setInvites] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [newToken, setNewToken] = useState('')

  async function loadInvites() {
    const res = await fetch('/api/admin/invites')
    const data = await res.json()
    setInvites(data.invites || [])
  }

  useEffect(() => { loadInvites() }, [])

  async function generateInvite() {
    setLoading(true)
    const res = await fetch('/api/admin/invites', { method: 'POST' })
    const data = await res.json()
    setNewToken(`${window.location.origin}/invite/${data.token}`)
    await loadInvites()
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">邀请管理</h1>
        <button onClick={generateInvite} disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {loading ? '生成中...' : '生成邀请链接'}
        </button>
      </div>

      {newToken && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">新邀请链接（7天有效）：</p>
          <div className="flex items-center gap-2">
            <code className="text-xs text-blue-800 flex-1 break-all">{newToken}</code>
            <button onClick={() => { navigator.clipboard.writeText(newToken); alert('已复制') }}
              className="text-xs text-blue-600 hover:text-blue-800 whitespace-nowrap">复制</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">创建时间</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">过期时间</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">状态</th>
              <th className="text-left px-4 py-3 text-gray-600 font-medium">使用者</th>
            </tr>
          </thead>
          <tbody>
            {invites.map(invite => (
              <tr key={invite.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-3 text-gray-700">{new Date(invite.created_at).toLocaleDateString('zh-CN')}</td>
                <td className="px-4 py-3 text-gray-700">{new Date(invite.expires_at).toLocaleDateString('zh-CN')}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    invite.used_at ? 'bg-gray-100 text-gray-600' : 'bg-green-100 text-green-700'
                  }`}>
                    {invite.used_at ? '已使用' : '未使用'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{invite.used_by_user?.name || '—'}</td>
              </tr>
            ))}
            {invites.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">暂无邀请记录</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
