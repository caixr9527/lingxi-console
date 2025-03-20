import { ref } from 'vue'
import { getWebApp, getWebAppConversations, stopWebAppChat, webAppChat } from '@/services/web-app'
import type { WebAppChatRequest } from '@/models/web-app'

export const useGetWebApp = () => {
  const loading = ref(false)
  const web_app = ref<Record<string, any>>({})

  const loadWebApp = async (token: string) => {
    try {
      loading.value = true
      const resp = await getWebApp(token)
      web_app.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, web_app, loadWebApp }
}

export const useWebAppChat = () => {
  const loading = ref(false)

  const handleWebAppChat = async (
    token: string,
    req: WebAppChatRequest,
    onData: (event_response: Record<string, any>) => void,
  ) => {
    try {
      loading.value = true
      await webAppChat(token, req, onData)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleWebAppChat }
}

export const useStopWebAppChat = () => {
  const loading = ref(false)

  const handleStopWebAppChat = async (token: string, task_id: string) => {
    try {
      loading.value = true
      await stopWebAppChat(token, task_id)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleStopWebAppChat }
}

export const useGetAppConversations = () => {
  const loading = ref(false)
  const pinned_conversations = ref<Record<string, any>[]>([])
  const unpinned_conversations = ref<Record<string, any>[]>([])

  const loadWebAppConversations = async (token: string) => {
    try {
      loading.value = true
      const [pinned_resp, unpinned_resp] = await Promise.all([
        getWebAppConversations(token, true),
        getWebAppConversations(token, false),
      ])

      pinned_conversations.value = pinned_resp.data
      unpinned_conversations.value = unpinned_resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, pinned_conversations, unpinned_conversations, loadWebAppConversations }
}
