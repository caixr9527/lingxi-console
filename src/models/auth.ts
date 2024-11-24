import type { BaseResponse } from './base'

export type PasswordLoginResponse = BaseResponse<{
  access_token: string
  expire_at: number
}>
