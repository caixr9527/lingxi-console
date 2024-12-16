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

// 获取指定内置插件详情
export type GetBuiltinToolResponse = BaseResponse<{
  name: string
  label: string
  description: string
  provider: {
    name: string
    label: string
    category: string
    background: string
    description: string
  }
  params: {
    name: string
    label: string
    type: string
    required: boolean
    default: any
    min: number
    max: number
    options: { value: string; label: string }[]
  }[]
  inputs: {
    type: string
    name: string
    required: boolean
    description: string
  }[]
  created_at: number
}>
