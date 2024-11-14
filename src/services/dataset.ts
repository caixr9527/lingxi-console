import { get } from '@/utils/request'
import { type GetDatasetsWithPageResp } from '@/models/dataset'

export const getDatasetsWithPage = (
  current_page: number = 1,
  page_size: number = 20,
  search_word: string = '',
) => {
  return get<GetDatasetsWithPageResp>(`/datasets`, {
    params: { current_page, page_size, search_word },
  })
}
