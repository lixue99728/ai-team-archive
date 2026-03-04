export type UserRole = 'admin' | 'member'
export type MaterialType = 'link' | 'file' | 'md'

export interface User {
  id: string
  name: string
  avatar_url: string | null
  role: UserRole
  created_at: string
}

export interface Meeting {
  id: string
  title: string
  date: string
  summary: string | null
  next_direction: string | null
  next_direction_confirmed: boolean
  created_by: string
  created_at: string
  presenters?: User[]
}

export interface MeetingMaterial {
  id: string
  meeting_id: string
  user_id: string
  title: string
  type: MaterialType
  url: string | null
  content: string | null
  mime_type: string | null
  file_size: number | null
  created_at: string
}

export interface Todo {
  id: string
  meeting_id: string
  content: string
  assignee_id: string | null
  done: boolean
  created_by: string
  created_at: string
  assignee?: User
}

export interface Invite {
  id: string
  token: string
  created_by: string
  used_by: string | null
  used_at: string | null
  expires_at: string
  created_at: string
}
