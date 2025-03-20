import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import type { BasePaginatorRequest } from '@/models/base'
import {
  type CreateApiKeyRequest,
  type GetApiKeysWithPageResponse,
  type UpdateApiKeyRequest,
} from '@/models/api-key'
import {
  createApiKey,
  deleteApiKey,
  getApiKeysWithPage,
  updateApiKey,
  updateApiKeyIsActive,
} from '@/services/api-key'

export const useGetApiKeysWithPage = () => {
  const loading = ref(false)
  const api_keys = ref<GetApiKeysWithPageResponse['data']['list']>([])
  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }
  const paginator = ref({ ...defaultPaginator })

  const loadApiKeys = async (
    init: boolean = false,
    req: BasePaginatorRequest = {
      current_page: 1,
      page_size: 20,
    },
  ) => {
    if (!init && paginator.value.current_page > paginator.value.total_page) {
      return
    }

    try {
      loading.value = true
      const resp = await getApiKeysWithPage(req)
      const data = resp.data

      paginator.value = data.paginator

      api_keys.value = data.list
    } finally {
      loading.value = false
    }
  }

  return { loading, api_keys, paginator, loadApiKeys }
}

export const useDeleteApiKey = () => {
  const handleDeleteApiKey = (api_key_id: string, callback?: () => void) => {
    Modal.warning({
      title: '要删除该API秘钥吗?',
      content:
        '删除秘钥后，无法使用该秘钥访问 LLMOps 个人空间中的所有 Agent，并且无法恢复，如果临时关闭请使用禁用功能。',
      hideCancel: false,
      onOk: async () => {
        try {
          const resp = await deleteApiKey(api_key_id)
          Message.success(resp.message)
        } finally {
          callback && callback()
        }
      },
    })
  }

  return { handleDeleteApiKey }
}

export const useUpdateApiKey = () => {
  const loading = ref(false)

  const handleUpdateApiKey = async (api_key_id: string, req: UpdateApiKeyRequest) => {
    try {
      loading.value = true
      const resp = await updateApiKey(api_key_id, req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateApiKey }
}

export const useUpdateApiKeyIsActive = () => {
  const loading = ref(false)

  const handleUpdateApiKeyIsActive = async (
    api_key_id: string,
    is_active: boolean,
    callback?: () => void,
  ) => {
    try {
      loading.value = true
      const resp = await updateApiKeyIsActive(api_key_id, is_active)
      Message.success(resp.message)
    } finally {
      loading.value = false
      callback && callback()
    }
  }

  return { loading, handleUpdateApiKeyIsActive }
}

export const useCreateApiKey = () => {
  const loading = ref(false)

  const handleCreateApiKey = async (req: CreateApiKeyRequest) => {
    try {
      loading.value = true
      const resp = await createApiKey(req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleCreateApiKey }
}
