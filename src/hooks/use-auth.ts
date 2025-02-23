import { ref } from 'vue'
import { logout, passwordLogin } from '@/services/auth'
import { Message } from '@arco-design/web-vue'

export const useLogout = () => {
  const loading = ref(false)

  const handleLogout = async () => {
    try {
      loading.value = true
      const resp = await logout()
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleLogout }
}

export const usePasswordLogin = () => {
  const loading = ref(false)
  const authorization = ref<Record<string, any>>({})

  const handlePasswordLogin = async (email: string, password: string) => {
    try {
      loading.value = true
      const resp = await passwordLogin(email, password)
      authorization.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, authorization, handlePasswordLogin }
}
