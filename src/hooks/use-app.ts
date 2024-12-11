import { cancelPublish, getApp, publish } from '@/services/app'
import { Message, Modal } from '@arco-design/web-vue'
import { onMounted, reactive, ref } from 'vue'

export const useGetApp = (app_id: string) => {
  const loading = ref(false)
  const app = reactive<Record<string, any>>({})

  const loadApp = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await getApp(app_id)
      const data = resp.data
      Object.assign(app, { ...data })
    } finally {
      loading.value = false
    }
  }
  onMounted(async () => {
    await loadApp(app_id)
  })
  return { loading, app, loadApp }
}

export const usePublish = () => {
  const loading = ref(false)
  const handlePublish = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await publish(app_id)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }
  return { loading, handlePublish }
}

export const useCancelPublish = () => {
  const loading = ref(false)

  const handleCancelPublish = async (app_id: string, callback?: () => void) => {
    Modal.warning({
      title: '要取消发布该Agent应用吗?',
      content:
        '取消发布后，WebApp以及发布的社交平台均无法使用该Agent，如需更新WebApp地址，请使用地址重新生成功能',
      hideCancel: false,
      onOk: async () => {
        try {
          loading.value = true
          const resp = await cancelPublish(app_id)
          Message.success(resp.message)
        } finally {
          loading.value = false
          callback && callback()
        }
      },
    })
  }

  return { loading, handleCancelPublish }
}
