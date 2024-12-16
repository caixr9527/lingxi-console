import { type BasePaginatorResponse, type BaseResponse } from '@/models/base'

export type GetApiToolProvidersWithPageResponse = BasePaginatorResponse<{
  id: string
  name: string
  icon: string
  description: string
  headers: Array<any>
  tools: Array<any>
  created_at: number
}>

export type CreateApiToolProviderRequest = {
  name: string
  icon: string
  openapi_schema: string
  headers: Array<any>
}

export type UpdateApiToolProviderRequest = {
  name: string
  icon: string
  openapi_schema: string
  headers: Array<any>
}

export type GetApiToolProviderResponse = BaseResponse<{
  id: string
  name: string
  icon: string
  openapi_schema: string
  headers: Array<any>
  created_at: number
}>

// 获取自定义API工具详情
export type GetApiToolResponse = BaseResponse<{
  id: string
  name: string
  description: string
  provider: {
    id: string
    name: string
    icon: string
    headers: { key: string; value: string }[]
    description: string
  }
  inputs: {
    type: string
    name: string
    required: boolean
    description: string
  }[]
}>
