'use client'
import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const dotBg = {
  backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
  backgroundSize: '24px 24px'
}

export default function InviteForm({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [valid, setValid] = useState<boolean | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch(`/api/invites/validate?token=${token}`)
      .then(r => r.json())
      .then(d => setValid(d.valid))
      .catch(() => setValid(false))
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/invites/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, name, email, password })
    })
    const data = await res.json()
    if (data.error) {
      setError(data.error)
      setLoading(false)
      return
    }
    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError) {
      setError('注册成功，但自动登录失败，请前往登录页手动登录')
      setLoading(false)
      return
    }
    router.push('/')
  }

  if (valid === null) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={dotBg}>
      <p className="text-gray-500 text-sm">验证中...</p>
    </div>
  )

  if (!valid) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={dotBg}>
      <Card className="w-full max-w-md shadow-xl text-center p-8">
        <p className="text-red-500 font-medium">邀请链接无效或已过期</p>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4" style={dotBg}>
      <Card className="w-full max-w-md shadow-xl border-gray-200">
        <CardHeader className="text-center pb-2 pt-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-md">
              <Bot className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">加入 AI 小队</h1>
          <p className="text-sm text-gray-500 mt-1">完成注册后即可访问团队内容</p>
        </CardHeader>
        <CardContent className="pb-8 pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">姓名</Label>
              <Input id="name" type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="your@email.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">密码</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full mt-2">
              {loading ? '注册中...' : '完成注册'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
