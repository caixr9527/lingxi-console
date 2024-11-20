import type { UploadFileResponse, UploadImageResponse } from '@/models/upload-file'
import { upload } from '@/utils/request'

export const uploadImage = (image: File) => {
  const formData = new FormData()
  formData.append('file', image)
  return upload<UploadImageResponse>(`/upload-files/image`, {
    data: formData,
  })
}

export const uploadFile = (file: File) => {
  const formData = new FormData()
  formData.append('file', file)
  return upload<UploadFileResponse>(`/upload-files/file`, {
    data: formData,
  })
}
