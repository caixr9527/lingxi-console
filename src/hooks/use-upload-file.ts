import { ref } from 'vue'
import { uploadFile, uploadImage } from '@/services/upload-file'

export const useUploadImage = () => {
  const loading = ref(false)
  const image_url = ref<string>('')

  const handleUploadImage = async (image: File) => {
    try {
      loading.value = true
      const resp = await uploadImage(image)
      image_url.value = resp.data.image_url
    } finally {
      loading.value = false
    }
  }

  return { loading, image_url, handleUploadImage }
}

export const useUploadFile = () => {
  const loading = ref(false)
  const upload_file = ref<Record<string, any>>({})

  const handleUploadFile = async (file: File) => {
    try {
      loading.value = true
      const resp = await uploadFile(file)
      upload_file.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, upload_file, handleUploadFile }
}
