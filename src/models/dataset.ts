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

export type GetDocumentsWithPageRequest = {
  current_page: number
  page_size: number
  search_word: string
}

export type GetDocumentsWithPageResponse = BasePaginatorResponse<{
  id: string
  name: string
  charatcter_count: number
  hit_count: number
  position: number
  enabled: boolean
  disabled_at: number
  status: string
  error: string
  update_at: number
  created_at: number
}>

export type GetDocumentResponse = BaseResponse<{
  id: string
  dataset_id: string
  name: string
  segment_count: number
  character_count: number
  hit_count: number
  position: number
  enabled: boolean
  disabled_at: number
  status: string
  error: string
  updated_at: number
  created_at: number
}>
