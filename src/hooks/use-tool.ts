import { reactive, ref } from 'vue'
import { getApiTool, getApiToolProvidersWithPage } from '@/services/api-tool'
import { type GetApiToolProvidersWithPageResponse } from '@/models/api-tool'

export const useGetApiTool = () => {
  // 1.定义hooks所需数据
  const loading = ref(false)
  const api_tool = reactive<Record<string, any>>({})

  // 2.定义加载函数
  const loadApiTool = async (provider_id: string, tool_name: string) => {
    try {
      loading.value = true
      const resp = await getApiTool(provider_id, tool_name)
      const data = resp.data

      Object.assign(api_tool, data)
    } finally {
      loading.value = false
    }
  }

  return { loading, api_tool, loadApiTool }
}

export const useGetApiToolProvidersWithPage = () => {
  // 1.定义hooks所需数据
  const loading = ref(false)
  const api_tool_providers = reactive<GetApiToolProvidersWithPageResponse['data']['list']>([])
  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }
  const paginator = reactive({ ...defaultPaginator })

  // 2.定义加载数据函数
  const loadApiToolProviders = async (init: boolean = false) => {
    // 2.1 判断是否是初始化，如果是的话则先初始化分页器
    if (init) {
      Object.assign(paginator, { ...defaultPaginator })
    } else if (paginator.current_page > paginator.total_page) {
      return
    }

    // 2.2 加载更多数据并更新数据状态
    try {
      // 2.3 调用接口获取响应数据
      loading.value = true
      const resp = await getApiToolProvidersWithPage(
        paginator.current_page,
        paginator.page_size,
        '',
      )
      const data = resp.data

      // 2.4 更新分页器
      updatePaginator(data)

      // 2.5 判断是否存在更多数据
      if (paginator.current_page <= paginator.total_page) {
        paginator.current_page += 1
      }

      // 2.6 追加或者是覆盖数据
      if (init) {
        api_tool_providers.splice(0, api_tool_providers.length, ...data.list)
      } else {
        api_tool_providers.push(...data.list)
      }
    } finally {
      loading.value = false
    }
  }

  // 3.定义更新分页器函数
  const updatePaginator = (data: any) => {
    paginator.current_page = data.paginator.current_page
    paginator.page_size = data.paginator.page_size
    paginator.total_page = data.paginator.total_page
    paginator.total_record = data.paginator.total_record
  }

  return { loading, api_tool_providers, paginator, loadApiToolProviders }
}
