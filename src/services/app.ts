import type { DebugAppResponse } from '@/models/app'
import { post } from '@/utils/request'

export const debugApp = (app_id: string, query: string) => {
  return post<DebugAppResponse>(`/apps/${app_id}/debug`, {
    body: { query },
  })
}
