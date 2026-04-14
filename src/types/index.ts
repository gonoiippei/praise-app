export interface Member {
  id: string
  name: string
  slack_user_id?: string | null
  created_at: string
}

export interface Praise {
  id: string
  member_id: string
  message: string
  source: 'web' | 'slack'
  created_at: string
  group_id: string | null
  is_primary: boolean
  members?: Member
}
