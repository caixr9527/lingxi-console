import { ref } from 'vue'
import type { GetBuiltinAppCategoriesResponse, GetBuiltinAppsResponse } from '@/models/builtin-app'
import {
  addBuiltinAppToSpace,
  getBuiltinAppCategories,
  getBuiltinApps,
} from '@/services/builtin-app'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'

export const useGetBuiltinAppCategories = () => {
  const loading = ref(false)
  const categories = ref<GetBuiltinAppCategoriesResponse['data']>([])

  const loadBuiltinAppCategories = async () => {
    try {
      loading.value = true
      const resp = await getBuiltinAppCategories()
      categories.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, categories, loadBuiltinAppCategories }
}

export const useGetBuiltinApps = () => {
  const loading = ref(false)
  const apps = ref<GetBuiltinAppsResponse['data']>([])

  const loadBuiltinApps = async () => {
    try {
      loading.value = true
      const resp = await getBuiltinApps()
      apps.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, apps, loadBuiltinApps }
}

export const useAddBuiltinAppToSpace = () => {
  const router = useRouter()
  const loading = ref(false)

  const handleAddBuiltinAppToSpace = async (builtin_app_id: string) => {
    try {
      loading.value = true
      const resp = await addBuiltinAppToSpace(builtin_app_id)
      Message.success('将Agent模板添加到工作区成功')
      await router.push({
        name: 'space-apps-detail',
        params: { app_id: resp.data.id },
      })
    } finally {
      loading.value = false
    }
  }

  return { loading, handleAddBuiltinAppToSpace }
}
