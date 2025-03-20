import { ref } from 'vue'
import type { GetConversationMessagesWithPageResponse } from '@/models/conversation'
import {
  deleteConversation,
  deleteMessage,
  getConversationMessages,
  getConversationName,
  updateConversationIsPinned,
  updateConversationName,
} from '@/services/conversation'
import { Message, Modal } from '@arco-design/web-vue'

export const useGetConversationMessagesWithPage = () => {
  const loading = ref(false)
  const messages = ref<GetConversationMessagesWithPageResponse['data']['list']>([])
  const created_at = ref(0)
  const defaultPaginator = {
    current_page: 1,
    page_size: 5,
    total_page: 0,
    total_record: 0,
  }
  const paginator = ref({ ...defaultPaginator })

  const loadConversationMessagesWithPage = async (
    conversation_id: string,
    init: boolean = false,
  ) => {
    if (init) {
      paginator.value = { ...defaultPaginator }
      created_at.value = 0
    } else if (paginator.value.current_page > paginator.value.total_page) {
      return
    }

    try {
      loading.value = true
      const resp = await getConversationMessages(conversation_id, {
        current_page: paginator.value.current_page,
        page_size: paginator.value.page_size,
        created_at: created_at.value,
      })
      const data = resp.data

      paginator.value = data.paginator

      if (paginator.value.current_page <= paginator.value.total_page) {
        paginator.value.current_page += 1
      }

      if (init) {
        messages.value = data.list
      } else {
        messages.value.push(...data.list)
        created_at.value = data.list[0]?.created_at ?? 0
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, messages, paginator, loadConversationMessagesWithPage }
}

export const useDeleteConversation = () => {
  const handleDeleteConversation = (conversation_id: string, success_callback?: () => void) => {
    Modal.warning({
      title: '要删除该会话么?',
      content: '删除会话信息后，删除会话后，该会话下的所有聊天记录将被永远删除，无法找回。',
      hideCancel: false,
      onOk: async () => {
        const resp = await deleteConversation(conversation_id)
        Message.success(resp.message)

        success_callback && success_callback()
      },
    })
  }

  return { handleDeleteConversation }
}

export const useDeleteMessage = () => {
  const loading = ref(false)

  const handleDeleteMessage = async (conversation_id: string, message_id: string) => {
    try {
      loading.value = true
      await deleteMessage(conversation_id, message_id)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleDeleteMessage }
}

export const useGetConversationName = () => {
  const loading = ref(false)
  const name = ref<string>('')

  const loadConversationName = async (conversation_id: string) => {
    try {
      loading.value = true
      const resp = await getConversationName(conversation_id)
      name.value = resp.data.name
    } finally {
      loading.value = false
    }
  }

  return { loading, name, loadConversationName }
}

export const useUpdateConversationName = () => {
  const loading = ref(false)

  const handleUpdateConversationName = async (conversation_id: string, name: string) => {
    try {
      loading.value = true
      const resp = await updateConversationName(conversation_id, name)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateConversationName }
}

export const useUpdateConversationIsPinned = () => {
  const loading = ref(false)

  const handleUpdateConversationIsPinned = async (
    conversation_id: string,
    is_pinned: boolean = false,
    success_callback?: () => void,
  ) => {
    try {
      loading.value = true
      const resp = await updateConversationIsPinned(conversation_id, is_pinned)
      Message.success(resp.message)
      success_callback && success_callback()
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateConversationIsPinned }
}
