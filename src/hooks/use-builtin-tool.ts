import { ref } from 'vue'
import { getBuiltinTool, getBuiltinTools, getCategories } from '@/services/builtin-tool'

export const useGetCategories = () => {
  const loading = ref(false)
  const categories = ref<Record<string, any>>([])

  const loadCategories = async () => {
    try {
      loading.value = true
      const resp = await getCategories()
      categories.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, categories, loadCategories }
}

export const useGetBuiltinTool = () => {
  const loading = ref(false)
  const builtin_tool = ref<Record<string, any>>({})

  const loadBuiltinTool = async (provider_name: string, tool_name: string) => {
    try {
      loading.value = true
      const resp = await getBuiltinTool(provider_name, tool_name)
      builtin_tool.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, builtin_tool, loadBuiltinTool }
}

export const useGetBuiltinTools = () => {
  const loading = ref(false)
  const builtin_tools = ref<Record<string, any>>([])

  const loadBuiltinTools = async () => {
    try {
      loading.value = true
      const resp = await getBuiltinTools()
      builtin_tools.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, builtin_tools, loadBuiltinTools }
}
