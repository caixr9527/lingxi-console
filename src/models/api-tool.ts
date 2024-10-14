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
