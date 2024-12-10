import type { BaseResponse } from '@/models/base'
import { ssePost, post } from '@/utils/request'

export const optimizePrompt = (
  prompt: string,
  onData: (event_response: Record<string, any>) => void,
) => {
  return ssePost(
    `/ai/optimize-prompt`,
    {
      body: { prompt },
    },
    onData,
  )
}

export const generateSuggestedQuestions = (message_id: string) => {
  return post<BaseResponse<string[]>>(`/ai/suggested-questions`, {
    body: { message_id },
  })
}
