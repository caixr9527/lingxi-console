import { type BasePaginatorResponse, type BaseResponse } from '@/models/base'

export type GetDatasetsWithPageResp = BasePaginatorResponse<{
  id: string
  name: string
  icon: string
  description: string
  document_count: number
  character_count: number
  related_app_count: number
  updated_at: number
  created_at: number
}>

export type CreateDatasetRequest = {
  name: string
  icon: string
  description: string
}

export type UpdateDatasetRequest = {
  name: string
  icon: string
  description: string
}

export type GetDatasetResponse = BaseResponse<{
  id: string
  icon: string
  name: string
  description: string
  document_count: number
  hit_count: number
  related_app_count: number
  character_count: number
  updated_at: number
  created_at: number
}>
