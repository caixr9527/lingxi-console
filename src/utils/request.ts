import { apiPrefix, httpCode } from '@/config'
import { Message, Tr } from '@arco-design/web-vue'
const TIME_OUT = 60 * 1000
const baseFetchOptions = {
  method: 'GET',
  mode: 'cors',
  credentals: 'include',
  headers: new Headers({
    'Content-Type': 'application/json',
  }),
  redirect: 'follow',
}

type FetchOptionType = Omit<RequestInit, 'body'> & {
  params?: Record<string, any>
  body?: BodyInit | Record<string, any> | null
}

const baseFetch = <T>(url: string, fetchOption: FetchOptionType): Promise<T> => {
  const options: typeof baseFetchOptions & FetchOptionType = Object.assign(
    {},
    baseFetchOptions,
    fetchOption,
  )
  let urlWithPrefix = `${apiPrefix}${url.startsWith('/') ? url : `/${url}`}`
  const { method, params, body } = options
  if (method === 'GET' && params) {
    const paramsArray: string[] = []
    Object.keys(params).forEach((key) => {
      paramsArray.push(`${key}=${encodeURIComponent(params[key])}`)
    })
    if (urlWithPrefix.search(/\?/) === -1) {
      urlWithPrefix += `?${paramsArray.join('&')}`
    } else {
      urlWithPrefix += `&${paramsArray.join('&')}`
    }
    delete options.params
  }
  if (body) {
    options.body = JSON.stringify(body)
  }
  return Promise.race([
    new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject('接口超时')
      }, TIME_OUT)
    }),
    new Promise((resolve, reject) => {
      globalThis
        .fetch(urlWithPrefix, options as RequestInit)
        .then(async (res) => {
          const json = await res.json()
          if (json.code === httpCode.success) {
            resolve(json)
          } else {
            Message.error(json.message)
            reject(new Error(json.message))
          }
        })
        .catch((err) => {
          Message.error(err.message)
          reject(err)
        })
    }),
  ]) as Promise<T>
}

export const request = <T>(url: string, options = {}) => {
  return baseFetch<T>(url, options)
}

export const get = <T>(url: string, options = {}) => {
  return request<T>(url, Object.assign({}, options, { method: 'GET' }))
}

export const post = <T>(url: string, options = {}) => {
  return request<T>(url, Object.assign({}, options, { method: 'POST' }))
}

export const ssePost = async (
  url: string,
  fetchOptions: FetchOptionType,
  onData: (data: { [key: string]: any }) => void,
) => {
  const options = Object.assign({}, baseFetchOptions, { method: 'POST' }, fetchOptions)
  const urlWithPrefix = `${apiPrefix}${url.startsWith('/') ? url : `/${url}`}`
  const { body } = fetchOptions
  if (body) options.body = JSON.stringify(body)
  //   globalThis.fetch(urlWithPrefix, options as RequestInit).then((response) => {
  //     return handleStream(response, onData)
  //   })
  const response = await globalThis.fetch(urlWithPrefix, options as RequestInit)
  return handleStream(response, onData)
}

const handleStream = (response: Response, onData: (data: { [key: string]: any }) => void) => {
  // 检测网络请求
  if (!response.ok) throw new Error('网络请求失败')
  // 构建reader和decoder
  const reader = response.body?.getReader()
  const decoder = new TextDecoder('utf-8')
  let buffer = ''
  const read = () => {
    let hasError = false
    reader?.read().then((result: any) => {
      if (result.done) return
      buffer += decoder.decode(result.value, { stream: true })
      const lines = buffer.split('\n')
      let event = ''
      let data = ''
      try {
        lines.forEach((line) => {
          line = line.trim()
          if (line.startsWith('event:')) {
            event = line.slice(6).trim()
          } else if (line.startsWith('data:')) {
            data = line.slice(5).trim()
          }
          if (line === '') {
            if (event !== '' && data !== '') {
              onData({
                event: event,
                data: JSON.parse(data),
              })
              event = ''
              data = ''
            }
          }
        })
        buffer = lines.pop() || ''
      } catch (e) {
        hasError = true
      }

      if (!hasError) read()
    })
  }

  read()
}
