import { get } from '@/utils/request'
import {
  type GetCategoriesResponse,
  type GetBuiltinToolsResponse,
  type GetBuiltinToolResponse,
} from '@/models/builtin-tool'

export const getCategories = () => {
  return get<GetCategoriesResponse>('/builtin-tools/categories')
}

export const getBuiltinTools = () => {
  return get<GetBuiltinToolsResponse>('/builtin-tools')
}

// 获取内置工具详情
export const getBuiltinTool = (provider_name: string, tool_name: string) => {
  return get<GetBuiltinToolResponse>(`/builtin-tools/${provider_name}/tools/${tool_name}`)
}
