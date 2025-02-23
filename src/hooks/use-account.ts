import { ref } from 'vue'
import { getCurrentUser, updateAvatar, updateName, updatePassword } from '@/services/account'
import { Message } from '@arco-design/web-vue'

export const useGetCurrentUser = () => {
  const loading = ref(false)
  const current_user = ref<Record<string, any>>({})

  const loadCurrentUser = async () => {
    try {
      loading.value = true
      const resp = await getCurrentUser()
      current_user.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, current_user, loadCurrentUser }
}

export const useUpdateAvatar = () => {
  const loading = ref(false)

  const handleUpdateAvatar = async (avatar: string) => {
    try {
      loading.value = true
      const resp = await updateAvatar(avatar)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateAvatar }
}

export const useUpdateName = () => {
  const loading = ref(false)

  const handleUpdateName = async (name: string) => {
    try {
      loading.value = true
      await updateName(name)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateName }
}

export const useUpdatePassword = () => {
  const loading = ref(false)

  const handleUpdatePassword = async (password: string) => {
    try {
      loading.value = true
      const resp = await updatePassword(password)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdatePassword }
}
