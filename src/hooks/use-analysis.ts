import { ref } from 'vue'
import { getAppAnalysis } from '@/services/analysis'

export const useGetAppAnalysis = () => {
  const loading = ref(false)
  const app_analysis = ref<Record<string, any>>({})

  const loadAppAnalysis = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await getAppAnalysis(app_id)

      app_analysis.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, app_analysis, loadAppAnalysis }
}
