'use client'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User } from '@/types'

export default function Nav({ user }: { user: User | null }) {
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold text-gray-900">AI 小队</Link>
        <div className="flex items-center gap-4">
          {user?.role === 'admin' && (
            <Link href="/admin/invites" className="text-sm text-gray-600 hover:text-gray-900">
              邀请管理
            </Link>
          )}
          <Link href={`/members/${user?.id}`} className="text-sm text-gray-600 hover:text-gray-900">
            {user?.name}
          </Link>
          <button onClick={signOut} className="text-sm text-gray-500 hover:text-gray-700">
            退出
          </button>
        </div>
      </div>
    </nav>
  )
}
