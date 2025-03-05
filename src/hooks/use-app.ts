import { ref } from 'vue'
import {
  cancelPublish,
  copyApp,
  createApp,
  debugChat,
  deleteApp,
  deleteDebugConversation,
  fallbackHistoryToDraft,
  getApp,
  getAppsWithPage,
  getDebugConversationMessagesWithPage,
  getDebugConversationSummary,
  getDraftAppConfig,
  getPublishedConfig,
  getPublishHistoriesWithPage,
  publish,
  regenerateWebAppToken,
  stopDebugChat,
  updateApp,
  updateDebugConversationSummary,
  updateDraftAppConfig,
} from '@/services/app'
import { Message, Modal } from '@arco-design/web-vue'
import type {
  CreateAppRequest,
  GetAppsWithPageResponse,
  GetDebugConversationMessagesWithPageResponse,
  UpdateAppRequest,
  UpdateDraftAppConfigRequest,
} from '@/models/app'
import { useRouter } from 'vue-router'

export const useGetApp = () => {
  const loading = ref(false)
  const app = ref<Record<string, any>>({})

  const loadApp = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await getApp(app_id)
      app.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, app, loadApp }
}

export const useGetAppsWithPage = () => {
  const loading = ref(false)
  const apps = ref<GetAppsWithPageResponse['data']['list']>([])
  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }
  const paginator = ref({ ...defaultPaginator })

  const loadApps = async (init: boolean = false, search_word: string = '') => {
    if (init) {
      paginator.value = defaultPaginator
    } else if (paginator.value.current_page > paginator.value.total_page) {
      return
    }

    try {
      loading.value = true
      const resp = await getAppsWithPage({
        current_page: paginator.value.current_page,
        page_size: paginator.value.page_size,
        search_word: search_word,
      })
      const data = resp.data

      paginator.value = data.paginator

      if (paginator.value.current_page <= paginator.value.total_page) {
        paginator.value.current_page += 1
      }

      if (init) {
        apps.value = data.list
      } else {
        apps.value.push(...data.list)
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, apps, paginator, loadApps }
}

export const useCreateApp = () => {
  const router = useRouter()
  const loading = ref(false)

  const handleCreateApp = async (req: CreateAppRequest) => {
    try {
      loading.value = true
      const resp = await createApp(req)
      Message.success('新增Agent应用成功')
      await router.push({
        name: 'space-apps-detail',
        params: { app_id: resp.data.id },
      })
    } finally {
      loading.value = false
    }
  }

  return { loading, handleCreateApp }
}

export const useUpdateApp = () => {
  const loading = ref(false)

  const handleUpdateApp = async (app_id: string, req: UpdateAppRequest) => {
    try {
      loading.value = true
      const resp = await updateApp(app_id, req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateApp }
}

export const useCopyApp = () => {
  const router = useRouter()
  const loading = ref(false)

  const handleCopyApp = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await copyApp(app_id)

      Message.success('创建应用副本成功')
      await router.push({ name: 'space-apps-detail', params: { app_id: resp.data.id } })
    } finally {
      loading.value = false
    }
  }

  return { loading, handleCopyApp }
}

export const useDeleteApp = () => {
  const handleDeleteApp = async (app_id: string, callback?: () => void) => {
    Modal.warning({
      title: '要删除该应用吗?',
      content:
        '删除应用后，发布的WebApp、开放API以及关联的社交媒体平台均无法使用该Agent应用，如果需要暂停应用，可使用取消发布功能。',
      hideCancel: false,
      onOk: async () => {
        try {
          const resp = await deleteApp(app_id)
          Message.success(resp.message)
        } finally {
          callback && callback()
        }
      },
    })
  }

  return { handleDeleteApp }
}

export const usePublish = () => {
  const loading = ref(false)
  const handlePublish = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await publish(app_id)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }
  return { loading, handlePublish }
}

export const useCancelPublish = () => {
  const loading = ref(false)

  const handleCancelPublish = async (app_id: string, callback?: () => void) => {
    Modal.warning({
      title: '要取消发布该Agent应用吗?',
      content:
        '取消发布后，WebApp以及发布的社交平台均无法使用该Agent，如需更新WebApp地址，请使用地址重新生成功能',
      hideCancel: false,
      onOk: async () => {
        try {
          loading.value = true
          const resp = await cancelPublish(app_id)
          Message.success(resp.message)
        } finally {
          loading.value = false
          callback && callback()
        }
      },
    })
  }

  return { loading, handleCancelPublish }
}

export const useGetPublishHistoriesWithPage = () => {
  const loading = ref(false)
  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }
  const publishHistories = ref<Record<string, any>[]>([])
  const paginator = ref(defaultPaginator)

  const loadPublishHistories = async (app_id: string, init: boolean = false) => {
    try {
      if (init) {
        paginator.value = defaultPaginator
      } else if (paginator.value.current_page > paginator.value.total_page) {
        return
      }
      loading.value = true
      const resp = await getPublishHistoriesWithPage(app_id, {
        current_page: paginator.value.current_page,
        page_size: paginator.value.page_size,
      })
      const data = resp.data

      paginator.value = data.paginator

      if (paginator.value.current_page <= paginator.value.total_page) {
        paginator.value.current_page += 1
      }

      if (init) {
        publishHistories.value = data.list
      } else {
        publishHistories.value.push(...data.list)
      }
    } finally {
      loading.value = false
    }
  }
  return { loading, publishHistories, paginator, loadPublishHistories }
}

export const useFallbackHistoryToDraft = () => {
  const loading = ref(false)

  const handleFallbackHistoryToDraft = async (
    app_id: string,
    app_config_version_id: string,
    callback?: () => void,
  ) => {
    try {
      loading.value = true
      const resp = await fallbackHistoryToDraft(app_id, app_config_version_id)
      Message.success(resp.message)
    } finally {
      loading.value = false
      callback && callback()
    }
  }
  return { loading, handleFallbackHistoryToDraft }
}

export const useGetDraftAppConfig = () => {
  const loading = ref(false)
  const draftAppConfigForm = ref<Record<string, any>>({})

  const loadDraftAppConfig = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await getDraftAppConfig(app_id)
      const data = resp.data

      draftAppConfigForm.value = {
        dialog_round: data.dialog_round,
        model_config: data.model_config,
        preset_prompt: data.preset_prompt,
        long_term_memory: data.long_term_memory,
        opening_statement: data.opening_statement,
        opening_questions: data.opening_questions,
        suggested_after_answer: data.suggested_after_answer,
        review_config: data.review_config,
        datasets: data.datasets,
        retrieval_config: data.retrieval_config,
        tools: data.tools,
        workflows: data.workflows,
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, draftAppConfigForm, loadDraftAppConfig }
}

export const useUpdateDraftAppConfig = () => {
  const loading = ref(false)

  const handleUpdateDraftAppConfig = async (
    app_id: string,
    draft_app_config: UpdateDraftAppConfigRequest,
  ) => {
    try {
      loading.value = true
      const resp = await updateDraftAppConfig(app_id, draft_app_config)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateDraftAppConfig }
}

export const useGetDebugConversationSummary = () => {
  const loading = ref(false)
  const debug_conversation_summary = ref('')

  const loadDebugConversationSummary = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await getDebugConversationSummary(app_id)
      const data = resp.data

      debug_conversation_summary.value = data.summary
    } finally {
      loading.value = false
    }
  }

  return { loading, debug_conversation_summary, loadDebugConversationSummary }
}

export const useUpdateDebugConversationSummary = () => {
  const loading = ref(false)

  const handleUpdateDebugConversationSummary = async (app_id: string, summary: string) => {
    try {
      loading.value = true
      const resp = await updateDebugConversationSummary(app_id, summary)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateDebugConversationSummary }
}

export const useDeleteDebugConversation = () => {
  const loading = ref(false)

  const handleDeleteDebugConversation = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await deleteDebugConversation(app_id)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleDeleteDebugConversation }
}

export const useGetDebugConversationMessagesWithPage = () => {
  const loading = ref(false)
  const messages = ref<GetDebugConversationMessagesWithPageResponse['data']['list']>([])
  const created_at = ref(0)
  const defaultPaginator = {
    current_page: 1,
    page_size: 5,
    total_page: 0,
    total_record: 0,
  }
  const paginator = ref({ ...defaultPaginator })

  const loadDebugConversationMessages = async (app_id: string, init: boolean = false) => {
    if (init) {
      paginator.value = { ...defaultPaginator }
      created_at.value = 0
    } else if (paginator.value.current_page > paginator.value.total_page) {
      return
    }

    try {
      loading.value = true
      const resp = await getDebugConversationMessagesWithPage(app_id, {
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

  return { loading, messages, paginator, loadDebugConversationMessages }
}

export const useDebugChat = () => {
  const loading = ref(false)

  const handleDebugChat = async (
    app_id: string,
    query: string,
    image_urls: string[] = [],
    onData: (event_response: Record<string, any>) => void,
  ) => {
    try {
      loading.value = true
      await debugChat(app_id, query, image_urls, onData)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleDebugChat }
}

export const useStopDebugChat = () => {
  const loading = ref(false)

  const handleStopDebugChat = async (app_id: string, task_id: string) => {
    try {
      loading.value = true
      await stopDebugChat(app_id, task_id)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleStopDebugChat }
}

export const useGetPublishedConfig = () => {
  const loading = ref(false)
  const published_config = ref<Record<string, any>>({})

  const loadPublishedConfig = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await getPublishedConfig(app_id)
      published_config.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, published_config, loadPublishedConfig }
}

export const useRegenerateWebAppToken = () => {
  const loading = ref(false)
  const token = ref<string>('')

  const handleRegenerateWebAppToken = async (app_id: string) => {
    try {
      loading.value = true
      const resp = await regenerateWebAppToken(app_id)
      Message.success('重新生成WebApp访问链接成功')
      token.value = resp.data.token
    } finally {
      loading.value = false
    }
  }

  return { loading, token, handleRegenerateWebAppToken }
}
