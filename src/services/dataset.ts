import { get, post } from '@/utils/request'
import {
  type CreateDatasetRequest,
  type GetDatasetResponse,
  type GetDatasetsWithPageResp,
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
