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

export type HitRequest = {
  retrieval_strategy: string
  k: number
  query: string
  score: number
}

export type HitResponse = BaseResponse<
  Array<{
    id: string
    document: {
      id: string
      name: string
      extension: string
      mime_type: string
    }
    dataset_id: string
    score: number
    position: number
    keywords: string[]
    character_count: number
    token_count: number
    hit_count: number
    enabled: boolean
    disabled_at: number
    status: string
    error: string
    updated_at: number
    created_at: number
  }>
>

export type GetDatasetQueriesResponse = BaseResponse<
  Array<{
    id: string
    query: string
    source: string
    dataset_id: string
    created_at: number
  }>
>

export type CreateDocumentsRequest = {
  upload_file_ids: string[]
  process_type: string
  rule: {
    pre_process_rules: {
      id: string
      enabled: boolean
    }[]
    segment: {
      separators: string[]
      chunk_size: number
      chunk_overlap: number
    }
  }
}

export type CreateDocumentsResponse = BaseResponse<{
  batch: string
  documents: {
    id: string
    name: string
    status: string
    created_at: number
  }[]
}>

export type GetDocumentStatusResponse = BaseResponse<
  Array<{
    id: string
    name: string
    size: number
    extension: string
    mime_type: string
    position: number
    segment_count: number
    completed_segment_count: number
    status: string
    error: string
    processing_started_at: number
    parsing_completed_at: number
    splitting_completed_at: number
    indexing_completed_at: number
    completed_at: number
    stopped_at: number
    created_at: number
  }>
>
