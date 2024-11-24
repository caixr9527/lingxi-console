import { type PasswordLoginResponse } from '@/models/auth'
import { type BaseResponse } from '@/models/base'
import { post } from '@/utils/request'

export const passwordLogin = (email: string, password: string) => {
  return post<PasswordLoginResponse>(`/auth/password-login`, {
    body: {
      email,
      password,
    },
  })
}

export const logout = () => {
  return post<BaseResponse<any>>(`/auth/logout`)
}
