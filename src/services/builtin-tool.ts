import { get } from '@/utils/request'
import { type GetCategoriesResponse, type GetBuiltinToolsResponse } from '@/models/builtin-tool'

export const getCategories = () => {
  return get<GetCategoriesResponse>('/builtin-tools/categories')
}

export const getBuiltinTools = () => {
  return get<GetBuiltinToolsResponse>('/builtin-tools')
}
