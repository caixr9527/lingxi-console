import { ref } from 'vue'
import {
  createApiToolProvider,
  deleteApiToolProvider,
  getApiTool,
  getApiToolProvider,
  getApiToolProvidersWithPage,
  updateApiToolProvider,
  validateOpenAPISchema,
} from '@/services/api-tool'
import { Message, Modal } from '@arco-design/web-vue'
import type { CreateApiToolProviderRequest, UpdateApiToolProviderRequest } from '@/models/api-tool'

export const useGetApiToolProvider = () => {
  const loading = ref(false)
  const api_tool_provider = ref<Record<string, any>>({})

  const loadApiToolProvider = async (provider_id: string) => {
    try {
      loading.value = true
      const resp = await getApiToolProvider(provider_id)
      api_tool_provider.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, api_tool_provider, loadApiToolProvider }
}

export const useGetApiTool = () => {
  const loading = ref(false)
  const api_tool = ref<Record<string, any>>({})

  const loadApiTool = async (provider_id: string, tool_name: string) => {
    try {
      loading.value = true
      const resp = await getApiTool(provider_id, tool_name)
      api_tool.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, api_tool, loadApiTool }
}

export const useGetApiToolProvidersWithPage = () => {
  const loading = ref(false)
  const api_tool_providers = ref<Record<string, any>>([])
  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }
  const paginator = ref(defaultPaginator)

  const loadApiToolProviders = async (init: boolean = false, search_word: string = '') => {
    if (init) {
      paginator.value = defaultPaginator
      Object.assign(paginator, { ...defaultPaginator })
    } else if (paginator.value.current_page > paginator.value.total_page) {
      return
    }

    try {
      loading.value = true
      const resp = await getApiToolProvidersWithPage(
        paginator.value.current_page,
        paginator.value.page_size,
        search_word,
      )
      const data = resp.data

      paginator.value = data.paginator

      if (paginator.value.current_page <= paginator.value.total_page) {
        paginator.value.current_page += 1
      }

      if (init) {
        api_tool_providers.value = data.list
      } else {
        api_tool_providers.value.push(...data.list)
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, api_tool_providers, paginator, loadApiToolProviders }
}

export const useDeleteApiToolProvider = () => {
  const handleDelete = (provider_id: string, success_callback?: () => void) => {
    Modal.warning({
      title: '删除这个工具?',
      content: '删除工具是不可逆的。AI应用将无法再访问您的工具',
      hideCancel: false,
      onOk: async () => {
        try {
          const resp = await deleteApiToolProvider(provider_id)
          Message.success(resp.message)
        } finally {
          success_callback && success_callback()
        }
      },
    })
  }

  return { handleDelete }
}

export const useUpdateApiToolProvider = () => {
  const loading = ref(false)

  const handleUpdateApiToolProvider = async (
    provider_id: string,
    req: UpdateApiToolProviderRequest,
  ) => {
    try {
      loading.value = true
      const resp = await updateApiToolProvider(provider_id, req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateApiToolProvider }
}

export const useCreateApiToolProvider = () => {
  const loading = ref(false)

  const handleCreateApiToolProvider = async (req: CreateApiToolProviderRequest) => {
    try {
      loading.value = true
      const resp = await createApiToolProvider(req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleCreateApiToolProvider }
}

export const useValidateOpenAPISchema = () => {
  const loading = ref(false)

  const handleValidateOpenAPISchema = async (openapi_schema: string) => {
    try {
      loading.value = true
      const resp = await validateOpenAPISchema(openapi_schema)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleValidateOpenAPISchema }
}
