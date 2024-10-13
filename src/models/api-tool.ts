import { type BasePaginatorResponse } from '@/models/base'

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

export type GetApiToolProviderResponse = {
  icon: string
  id: string
  name: string
  openapi_schema: string
  headers: Array<any>
  created_at: number
}
