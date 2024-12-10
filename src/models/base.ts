export type BaseResponse<T> = {
  code: string
  message: string
  data: T
}

export type BasePaginatorRequest = { current_page: number; page_size: number }

export type BasePaginatorResponse<T> = BaseResponse<{
  list: Array<T>
  paginator: {
    total_page: number
    total_record: number
    current_page: number
    page_size: number
  }
}>
