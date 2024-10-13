import { get, post } from '@/utils/request'
import type {
  GetApiToolProvidersWithPageResponse,
  CreateApiToolProviderRequest,
  UpdateApiToolProviderRequest,
  GetApiToolProviderResponse,
} from '@/models/api-tool'
import type { BaseResponse } from '@/models/base'

export const getApiToolProvidersWithPage = (
  current_page: number = 1,
  page_size: number = 20,
  search_word: string = '',
) => {
  return get<GetApiToolProvidersWithPageResponse>('/api-tools', {
    params: { current_page, page_size, search_word },
  })
}

export const validateOpenAPISchema = (openapi_schema: string) => {
  return post<BaseResponse<any>>('/api-tools/validate-openapi-schema', {
    body: { openapi_schema },
  })
}

export const createApiToolProvider = (req: CreateApiToolProviderRequest) => {
  return post<BaseResponse<any>>('/api-tools', { body: req })
}

export const deleteApiToolProvider = (provider_id: string) => {
  return post<BaseResponse<any>>(`/api-tools/${provider_id}/delete`)
}

export const updateApiToolProvider = (provider_id: string, req: UpdateApiToolProviderRequest) => {
  return post<BaseResponse<any>>(`/api-tools/${provider_id}`, { body: req })
}

export const getApiToolProvider = (provider_id: string) => {
  return get<BaseResponse<GetApiToolProviderResponse>>(`/api-tools/${provider_id}`)
}
