import { onMounted, reactive, ref } from 'vue'
import { getBuiltinTool, getBuiltinTools, getCategories } from '@/services/builtin-tool'

export const useGetCategories = () => {
  // 1.定义自定义hooks所需数据
  const loading = ref(false)
  const categories = reactive<Record<string, any>[]>([])

  // 2.定义加载数据函数
  const loadCategories = async () => {
    try {
      loading.value = true
      const resp = await getCategories()
      const data = resp.data

      categories.splice(0, categories.length, ...data)
    } finally {
      loading.value = false
    }
  }

  // 3.页面DOM加载完毕后执行
  onMounted(async () => await loadCategories())

  return { loading, categories, loadCategories }
}

export const useGetBuiltinTool = () => {
  // 1.定义hooks所需数据
  const loading = ref(false)
  const builtin_tool = reactive<Record<string, any>>({})

  // 2.定义加载函数
  const loadBuiltinTool = async (provider_name: string, tool_name: string) => {
    try {
      loading.value = true
      const resp = await getBuiltinTool(provider_name, tool_name)
      const data = resp.data

      Object.assign(builtin_tool, data)
    } finally {
      loading.value = false
    }
  }

  return { loading, builtin_tool, loadBuiltinTool }
}

export const useGetBuiltinTools = () => {
  // 1.定义自定义hooks所需数据
  const loading = ref(false)
  const builtin_tools = reactive<Record<string, any>[]>([])

  // 2.定义加载数据函数
  const loadBuiltinTools = async () => {
    try {
      loading.value = true
      const resp = await getBuiltinTools()
      const data = resp.data

      builtin_tools.splice(0, builtin_tools.length, ...data)
    } finally {
      loading.value = false
    }
  }

  return { loading, builtin_tools, loadBuiltinTools }
}
