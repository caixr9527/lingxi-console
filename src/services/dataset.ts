import { get, post } from '@/utils/request'
import {
  type CreateDatasetRequest,
  type CreateDocumentsRequest,
  type CreateDocumentsResponse,
  type GetDatasetQueriesResponse,
  type GetDatasetResponse,
  type GetDatasetsWithPageResp,
  type GetDocumentResponse,
  type GetDocumentStatusResponse,
  type GetDocumentsWithPageRequest,
  type GetDocumentsWithPageResponse,
  type HitRequest,
  type HitResponse,
  type UpdateDatasetRequest,
} from '@/models/dataset'
import type { BaseResponse } from '@/models/base'

export const getDatasetsWithPage = (
  current_page: number = 1,
  page_size: number = 20,
  search_word: string = '',
) => {
  return get<GetDatasetsWithPageResp>(`/datasets`, {
    params: { current_page, page_size, search_word },
  })
}

export const createDataset = (req: CreateDatasetRequest) => {
  return post<BaseResponse<any>>(`/datasets`, {
    body: req,
  })
}

export const updateDataset = (dataset_id: string, req: UpdateDatasetRequest) => {
  return post<BaseResponse<any>>(`/datasets/${dataset_id}`, {
    body: req,
  })
}

export const deleteDataset = (dataset_id: string) => {
  return post<BaseResponse<any>>(`/datasets/${dataset_id}/delete`)
}

export const getDataset = (dataset_id: string) => {
  return get<GetDatasetResponse>(`/datasets/${dataset_id}`)
}

export const getDocumentsWithPage = (
  dataset_id: string,
  req: GetDocumentsWithPageRequest = {
    current_page: 1,
    page_size: 20,
    search_word: '',
  },
) => {
  return get<GetDocumentsWithPageResponse>(`/datasets/${dataset_id}/documents`, {
    params: req,
  })
}

export const getDocument = (dataset_id: string, document_id: string) => {
  return get<GetDocumentResponse>(`/datasets/${dataset_id}/documents/${document_id}`)
}

export const updateDocumentEnabled = (
  dataset_id: string,
  document_id: string,
  enabled: boolean,
) => {
  return post<BaseResponse<any>>(`/datasets/${dataset_id}/documents/${document_id}/enabled`, {
    body: { enabled },
  })
}

export const deleteDocument = (dataset_id: string, document_id: string) => {
  return post<BaseResponse<any>>(`/datasets/${dataset_id}/documents/${document_id}/delete`)
}

export const updateDocumentName = (dataset_id: string, document_id: string, name: string) => {
  return post<BaseResponse<any>>(`/datasets/${dataset_id}/documents/${document_id}/name`, {
    body: { name },
  })
}

export const hit = (dataset_id: string, req: HitRequest) => {
  return post<HitResponse>(`/datasets/${dataset_id}/hit`, {
    body: req,
  })
}

export const getDatasetQueries = (dataset_id: string) => {
  return get<GetDatasetQueriesResponse>(`/datasets/${dataset_id}/queries`)
}

export const createDocuments = (dataset_id: string, req: CreateDocumentsRequest) => {
  return post<CreateDocumentsResponse>(`/datasets/${dataset_id}/documents`, {
    body: req,
  })
}

export const getDocumentStatus = (dataset_id: string, batch: string) => {
  return get<GetDocumentStatusResponse>(`/datasets/${dataset_id}/documents/batch/${batch}`)
}
