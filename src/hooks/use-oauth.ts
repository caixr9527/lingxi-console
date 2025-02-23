import { ref } from 'vue'
import { authorize, provider } from '@/services/oauth'
import { Message } from '@arco-design/web-vue'

export const useProvider = () => {
  const loading = ref(false)
  const redirect_url = ref('')

  const handleProvider = async (provider_name: string) => {
    try {
      loading.value = true
      const resp = await provider(provider_name)
      redirect_url.value = resp.data.redirect_url
    } finally {
      loading.value = false
    }
  }

  return { loading, redirect_url, handleProvider }
}

export const useAuthorize = () => {
  const loading = ref(false)
  const authorization = ref<Record<string, any>>({})

  const handleAuthorize = async (provider_name: string, code: string) => {
    try {
      loading.value = true
      const resp = await authorize(provider_name, code)
      Message.success('登录成功，正在跳转')
      authorization.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, authorization, handleAuthorize }
}
