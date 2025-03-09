import { ssePost, upload } from '@/utils/request'
import type { BaseResponse } from '@/models/base'

// 语音转文本输入接口
export const audioToText = (file: Blob) => {
  const formData = new FormData()
  formData.append('file', file, 'recording.wav')

  return upload<BaseResponse<{ text: string }>>(`/audio/audio-to-text`, {
    data: formData,
  })
}

// 消息转语音服务接口
export const messageToAudio = (
  message_id: string,
  onData: (event_response: Record<string, any>) => void,
) => {
  return ssePost(`/audio/message-to-audio`, { body: { message_id } }, onData)
}
