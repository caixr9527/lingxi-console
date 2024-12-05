import type { DebugAppResponse } from '@/models/app'
import { post, ssePost } from '@/utils/request'

export const debugApp = (
  app_id: string,
  query: string,
  onData: (event_response: { [key: string]: any }) => void,
) => {
  return ssePost(
    `/apps/${app_id}/conversations`,
    {
      body: { query },
    },
    onData,
  )
}
