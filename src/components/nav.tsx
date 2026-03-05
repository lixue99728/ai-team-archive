'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'
import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export default function Nav({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('signOut error:', error)
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-gray-900 hover:text-blue-600 transition-colors">
          <Bot className="w-5 h-5 text-blue-600" />
          AI 小队
        </Link>
        <div className="flex items-center gap-1">
          {user?.role === 'admin' && (
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/invites" className="text-gray-600">邀请管理</Link>
            </Button>
          )}
          {user?.id && (
            <Button variant="ghost" size="sm" className="p-1.5" asChild>
              <Link href={`/members/${user.id}`}>
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-semibold">
                    {user.name?.slice(0, 1)?.toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={signOut} className="text-gray-500">
            退出
          </Button>
        </div>
      </div>
    </nav>
  )
}
