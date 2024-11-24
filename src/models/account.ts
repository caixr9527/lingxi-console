import type { BaseResponse } from './base'

export type GetCurrentUserResponse = BaseResponse<{
  id: string
  name: string
  email: string
  avatar: string
  last_login_ip: string
  last_login_at: number
  created_at: number
}>
