import { type BaseResponse } from '@/models/base'

// 分类
export type GetCategoriesResponse = BaseResponse<
  Array<{
    category: string
    icon: string
    name: string
  }>
>

export type GetBuiltinToolsResponse = BaseResponse<
  Array<{
    background: string
    category: string
    created_at: number
    description: string
    label: string
    name: string
    tools: Array<any>
  }>
>
