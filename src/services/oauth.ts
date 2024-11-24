import type { AuthorizeResponse, ProviderResponse } from '@/models/oauth'
import { get, post } from '@/utils/request'

export const provider = (provider_name: string) => {
  return get<ProviderResponse>(`/oauth/${provider_name}`)
}

export const authorize = (provider_name: string, code: string) => {
  return post<AuthorizeResponse>(`/oauth/authorize/${provider_name}`, {
    body: { code },
  })
}
