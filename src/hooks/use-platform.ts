import { ref } from 'vue'
import { getWechatConfig, updateWechatConfig } from '@/services/platform'
import type { UpdateWechatConfigRequest } from '@/models/platform'
import { Message } from '@arco-design/web-vue'

export const useGetWechatConfig = () => {
  const loading = ref(false)
  const wechat_config = ref<Record<string, any>>({})

  const loadWechatConfig = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await getWechatConfig(app_id)
      wechat_config.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, wechat_config, loadWechatConfig }
}

export const useUpdateWechatConfig = () => {
  const loading = ref(false)

  const handleUpdateWechatConfig = async (app_id: string, req: UpdateWechatConfigRequest) => {
    try {
      loading.value = true
      const resp = await updateWechatConfig(app_id, req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateWechatConfig }
}
