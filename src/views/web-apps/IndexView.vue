<script setup lang="ts">
// @ts-ignore
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { cloneDeep } from 'lodash'
import { Message } from '@arco-design/web-vue'
import { useAccountStore } from '@/stores/account'
import {
  useGetAppConversations,
  useGetWebApp,
  useStopWebAppChat,
  useWebAppChat,
} from '@/hooks/use-web-app'
import {
  useDeleteConversation,
  useGetConversationMessagesWithPage,
  useUpdateConversationIsPinned,
} from '@/hooks/use-conversation'
import UpdateNameModal from './components/UpdateNameModal.vue'
import AiMessage from '@/components/AiMessage.vue'
import HumanMessage from '@/components/HumanMessage.vue'
import { useGenerateSuggestedQuestions } from '@/hooks/use-ai'
import { QueueEvent } from '@/config'

const route = useRoute()
const updateConversationNameModalVisible = ref(false)
const updateConversationNameId = ref('')
const newConversation = ref<any>(null)
const selectedConversation = ref('')
const query = ref('')
const message_id = ref('')
const task_id = ref('')
const scroller = ref<any>(null)
const scrollHeight = ref(0)
const accountStore = useAccountStore()
const { loading: getWebAppLoading, web_app, loadWebApp } = useGetWebApp()
const {
  loading: getWebAppConversationsLoading,
  pinned_conversations,
  unpinned_conversations,
  loadWebAppConversations,
} = useGetAppConversations()
const { handleDeleteConversation } = useDeleteConversation()
const { messages, loadConversationMessagesWithPage } = useGetConversationMessagesWithPage()
const { handleUpdateConversationIsPinned } = useUpdateConversationIsPinned()
const { loading: webAppChatLoading, handleWebAppChat } = useWebAppChat()
const { loading: stopWebAppChatLoading, handleStopWebAppChat } = useStopWebAppChat()
const { suggested_questions, handleGenerateSuggestedQuestions } = useGenerateSuggestedQuestions()

const conversation = computed(() => {
  if (selectedConversation.value === 'new_conversation') {
    return newConversation.value
  } else if (selectedConversation.value !== '') {
    let item = pinned_conversations.value.find((item) => item.id === selectedConversation.value)
    if (item) {
      return item
    }
    return unpinned_conversations.value.find((item) => item.id === selectedConversation.value)
  }
  return ''
})

const saveScrollHeight = () => {
  scrollHeight.value = scroller.value.$el.scrollHeight
}

const changeIsPinned = async (idx: number, origin_is_pinned: boolean) => {
  const conversation = origin_is_pinned
    ? pinned_conversations.value[idx]
    : unpinned_conversations.value[idx]

  await handleUpdateConversationIsPinned(conversation.id, !origin_is_pinned, () => {
    if (origin_is_pinned) {
      pinned_conversations.value.splice(idx, 1)
      unpinned_conversations.value.push(conversation)
    } else {
      unpinned_conversations.value.splice(idx, 1)
      pinned_conversations.value.push(conversation)
    }
  })
}

const updateName = (idx: number, origin_is_pinned: boolean) => {
  const conversation = origin_is_pinned
    ? pinned_conversations.value[idx]
    : unpinned_conversations.value[idx]

  updateConversationNameId.value = conversation.id
  updateConversationNameModalVisible.value = true
}

const successUpdateNameCallback = (conversation_id: string, conversation_name: string) => {
  let idx = pinned_conversations.value.findIndex((item) => item.id === conversation_id)

  if (idx !== -1) {
    pinned_conversations.value[idx]['name'] = conversation_name
  } else {
    idx = unpinned_conversations.value.findIndex((item) => item.id === conversation_id)
    if (idx !== -1) unpinned_conversations.value[idx]['name'] = conversation_name
  }
}

const deleteConversation = async (idx: number, origin_is_pinned: boolean) => {
  const conversation = origin_is_pinned
    ? pinned_conversations.value[idx]
    : unpinned_conversations.value[idx]

  handleDeleteConversation(conversation.id, () => {
    if (origin_is_pinned) {
      pinned_conversations.value.splice(idx, 1)
    } else {
      unpinned_conversations.value.splice(idx, 1)
    }
  })
}

const addConversation = () => {
  selectedConversation.value = 'new_conversation'

  if (!newConversation.value) {
    newConversation.value = {
      id: '',
      name: 'New Conversation',
      summary: '',
      created_at: 0,
    }
  }
}

const restoreScrollPosition = () => {
  scroller.value.$el.scrollTop = scroller.value.$el.scrollHeight - scrollHeight.value
}

const handleScroll = async (event: UIEvent) => {
  const { scrollTop } = event.target as HTMLElement
  if (scrollTop <= 0 && !webAppChatLoading.value) {
    saveScrollHeight()
    await loadConversationMessagesWithPage(conversation.value.id, false)
    restoreScrollPosition()
  }
}

const handleSubmit = async () => {
  if (query.value.trim() === '') {
    Message.warning('用户提问不能为空')
    return
  }

  if (webAppChatLoading.value) {
    Message.warning('上一次提问还未结束，请稍等')
    return
  }

  suggested_questions.value = []
  message_id.value = ''
  task_id.value = ''
  const selectedConversationTmp = cloneDeep(selectedConversation.value)

  messages.value.unshift({
    id: '',
    conversation_id: '',
    query: query.value,
    answer: '',
    total_token_count: 0,
    latency: 0,
    agent_thoughts: [],
    created_at: 0,
  })

  let position = 0
  const humanQuery = query.value
  query.value = ''

  const req = {
    conversation_id:
      selectedConversation.value === 'new_conversation' ? '' : selectedConversation.value,
    query: humanQuery,
  }
  await handleWebAppChat(String(route.params?.token), req, (event_response) => {
    const event = event_response?.event
    const data = event_response?.data
    const event_id = data?.id
    let agent_thoughts = messages.value[0].agent_thoughts

    if (message_id.value === '' && data?.message_id) {
      task_id.value = data?.task_id
      message_id.value = data?.message_id
      messages.value[0].id = data?.message_id
      messages.value[0].conversation_id = data?.conversation_id
    }

    if (event !== QueueEvent.ping) {
      if (event === QueueEvent.agentMessage) {
        const agent_thought_idx = agent_thoughts.findIndex((item) => item?.id === event_id)

        if (agent_thought_idx === -1) {
          position += 1
          agent_thoughts.push({
            id: event_id,
            position: position,
            event: data?.event,
            thought: data?.thought,
            observation: data?.observation,
            tool: data?.tool,
            tool_input: data?.tool_input,
            latency: data?.latency,
            created_at: 0,
          })
        } else {
          agent_thoughts[agent_thought_idx] = {
            ...agent_thoughts[agent_thought_idx],
            thought: agent_thoughts[agent_thought_idx]?.thought + data?.thought,
            latency: data?.latency,
          }
        }

        messages.value[0].answer += data?.thought
        messages.value[0].latency = data?.latency
        messages.value[0].total_token_count = data?.total_token_count
      } else {
        position += 1
        agent_thoughts.push({
          id: event_id,
          position: position,
          event: data?.event,
          thought: data?.thought,
          observation: data?.observation,
          tool: data?.tool,
          tool_input: data?.tool_input,
          latency: data?.latency,
          created_at: 0,
        })
      }

      messages.value[0].agent_thoughts = agent_thoughts

      scroller.value.scrollToBottom()
    }
  })

  if (messages.value.length > 0) {
    if (selectedConversationTmp === 'new_conversation') {
      unpinned_conversations.value.unshift({
        id: messages.value[0].conversation_id,
        name: 'New Conversation',
        summary: '',
        created_at: messages.value[0].created_at,
      })
      newConversation.value = null
      if (selectedConversation.value === 'new_conversation') {
        selectedConversation.value = messages.value[0].conversation_id
      }
    }
    if (web_app.value?.app_config?.suggested_after_answer.enable) {
      await handleGenerateSuggestedQuestions(message_id.value)
      setTimeout(() => scroller.value && scroller.value.scrollToBottom(), 100)
    }
  }
}

const changeConversation = async (conversation_id: string) => {
  await handleStop()

  selectedConversation.value = conversation_id
}

const handleStop = async () => {
  if (task_id.value === '' || !webAppChatLoading.value) return

  await handleStopWebAppChat(String(route.params?.token), task_id.value)
}

const handleSubmitQuestion = async (question: string) => {
  query.value = question

  await handleSubmit()
}

watch(
  () => selectedConversation.value,
  async (newValue) => {
    if (newValue === 'new_conversation') {
      messages.value = []
    } else if (newValue !== '') {
      await loadConversationMessagesWithPage(newValue, true)
    }
  },
  { immediate: true },
)

onMounted(async () => {
  const token = String(route.params?.token)
  await Promise.all([loadWebApp(token), loadWebAppConversations(token)])
  addConversation()
})
</script>

<template>
  <div class="flex min-h-screen h-full">
    <!-- 左侧会话记录 -->
    <div class="w-[240px] flex-shrink-0 border-r border-gray-200 p-4 flex flex-col bg-white">
      <!-- 顶部应用信息 -->
      <div class="flex items-center gap-3 mb-8 flex-shrink-0">
        <a-avatar :size="32" shape="square" :image-url="web_app?.icon" class="flex-shrink-0" />
        <div class="flex-1 text-base font-semibold line-clamp-1 break-all text-gray-700">
          <a-skeleton :loading="getWebAppLoading" animation>
            <a-skeleton-line :rows="1" :line-height="32" :line-spacing="4" />
          </a-skeleton>
          {{ web_app?.name }}
        </div>
      </div>
      <!-- 新增会话 -->
      <a-button type="primary" long class="rounded-lg mb-6 flex-shrink-0" @click="addConversation">
        <template #icon>
          <icon-edit />
        </template>
        新增会话
      </a-button>
      <!-- 会话列表 -->
      <div class="flex-1 overflow-scroll scrollbar-w-none">
        <!-- 置顶会话 -->
        <div class="mb-4">
          <div class="text-gray-700 font-semibold mb-2">置顶会话</div>
          <!-- 空白骨架屏 -->
          <a-skeleton :loading="getWebAppConversationsLoading" animation>
            <a-skeleton-line :rows="2" :line-height="32" :line-spacing="4" />
          </a-skeleton>
          <!-- 会话列表 -->
          <div class="flex flex-col gap-1">
            <div
              v-for="(conversation, idx) in pinned_conversations"
              :key="conversation.id"
              @click="() => changeConversation(conversation.id)"
              :class="`group flex items-center gap-1 h-8 leading-8 pl-3 pr-1 text-gray-700 rounded-lg cursor-pointer ${selectedConversation === conversation.id ? 'bg-blue-50 !text-blue-700' : ''} hover:bg-blue-50 hover:text-blue-700`"
            >
              <icon-message class="flex-shrink-0" />
              <div class="flex-1 line-clamp-1 break-all">{{ conversation.name }}</div>
              <a-dropdown position="br">
                <a-button
                  size="mini"
                  type="text"
                  class="!text-inherit !bg-transparent invisible group-hover:visible"
                >
                  <template #icon>
                    <icon-more />
                  </template>
                </a-button>
                <template #content>
                  <a-doption @click="() => changeIsPinned(idx, true)">取消置顶</a-doption>
                  <a-doption @click="() => updateName(idx, true)">重命名</a-doption>
                  <a-doption class="text-red-700" @click="() => deleteConversation(idx, true)">
                    删除
                  </a-doption>
                </template>
              </a-dropdown>
            </div>
          </div>
          <!-- 空会话列表 -->
          <a-empty v-if="!getWebAppConversationsLoading && pinned_conversations.length === 0">
            <template #image>
              <icon-empty :size="36" />
            </template>
            暂无置顶会话
          </a-empty>
        </div>
        <!-- 对话列表 -->
        <div class="mb-4">
          <div class="text-gray-700 font-semibold mb-2">对话列表</div>
          <!-- 空白骨架屏 -->
          <a-skeleton :loading="getWebAppConversationsLoading" animation>
            <a-skeleton-line :rows="2" :line-height="32" :line-spacing="4" />
          </a-skeleton>
          <!-- 会话列表 -->
          <div class="flex flex-col gap-1">
            <div
              v-if="newConversation"
              :class="`group flex items-center gap-1 h-8 leading-8 pl-3 pr-1 text-gray-700 rounded-lg cursor-pointer ${selectedConversation === 'new_conversation' ? 'bg-blue-50 !text-blue-700' : ''} hover:bg-blue-50 hover:text-blue-700`"
              @click="() => changeConversation('new_conversation')"
            >
              <icon-message class="flex-shrink-0" />
              <div class="flex-1 line-clamp-1 break-all">{{ newConversation.name }}</div>
            </div>
            <div
              v-for="(conversation, idx) in unpinned_conversations"
              :key="conversation.id"
              @click="() => changeConversation(conversation.id)"
              :class="`group flex items-center gap-1 h-8 leading-8 pl-3 pr-1 text-gray-700 rounded-lg cursor-pointer ${selectedConversation === conversation.id ? 'bg-blue-50 !text-blue-700' : ''} hover:bg-blue-50 hover:text-blue-700`"
            >
              <icon-message class="flex-shrink-0" />
              <div class="flex-1 line-clamp-1 break-all">{{ conversation.name }}</div>
              <a-dropdown position="br">
                <a-button
                  size="mini"
                  type="text"
                  class="!text-inherit !bg-transparent invisible group-hover:visible"
                >
                  <template #icon>
                    <icon-more />
                  </template>
                </a-button>
                <template #content>
                  <a-doption @click="() => changeIsPinned(idx, false)">置顶会话</a-doption>
                  <a-doption @click="() => updateName(idx, false)"> 重命名</a-doption>
                  <a-doption class="text-red-700" @click="() => deleteConversation(idx, false)">
                    删除
                  </a-doption>
                </template>
              </a-dropdown>
            </div>
          </div>
          <!-- 空会话列表 -->
          <a-empty
            v-if="
              !newConversation &&
              !getWebAppConversationsLoading &&
              unpinned_conversations.length === 0
            "
          >
            <template #image>
              <icon-empty :size="36" />
            </template>
            暂无会话列表
          </a-empty>
        </div>
      </div>
    </div>
    <!-- 右侧对话窗口 -->
    <div class="flex-1 min-h-screen bg-white">
      <!-- 顶部会话名称 -->
      <div class="h-16 leading-[64px] text-base font-semibold px-6 border-b">
        {{ conversation?.name }}
      </div>
      <!-- 底部对话消息列表 -->
      <div
        v-if="messages.length > 0"
        class="flex flex-col px-6 w-[600px] mx-auto h-[calc(100vh-170px)]"
      >
        <dynamic-scroller
          ref="scroller"
          :items="messages.slice().reverse()"
          :min-item-size="1"
          @scroll="handleScroll"
          class="h-full scrollbar-w-none"
        >
          <template v-slot="{ item, active }">
            <dynamic-scroller-item :item="item" :active="active" :data-index="item.id">
              <div class="flex flex-col gap-6 py-6">
                <human-message :query="item.query" :account="accountStore.account" />
                <ai-message
                  :agent_thoughts="item.agent_thoughts"
                  :answer="item.answer"
                  :app="{ name: web_app.name, icon: web_app.icon }"
                  :suggested_questions="item.id === message_id ? suggested_questions : []"
                  :loading="item.id === message_id && webAppChatLoading"
                  :latency="item.latency"
                  :total_token_count="item.total_token_count"
                  @select-suggested-question="handleSubmitQuestion"
                  message_class="max-w-[513px]"
                />
              </div>
            </dynamic-scroller-item>
          </template>
        </dynamic-scroller>
        <!-- 停止调试会话 -->
        <div v-if="task_id && webAppChatLoading" class="h-[50px] flex items-center justify-center">
          <a-button :loading="stopWebAppChatLoading" class="rounded-lg px-2" @click="handleStop">
            <template #icon>
              <icon-poweroff />
            </template>
            停止响应
          </a-button>
        </div>
      </div>
      <!-- 对话列表为空时展示的对话开场白 -->
      <div
        v-else
        class="flex flex-col p-6 gap-2 items-center justify-center w-[600px] mx-auto h-[calc(100%-170px)] min-h-[calc(100vh-170px)]"
      >
        <!-- 应用图标与名称 -->
        <div class="flex flex-col items-center gap-2">
          <a-avatar :size="48" shape="square" class="rounded-lg" :image-url="web_app?.icon" />
          <div class="text-lg text-gray-700">{{ web_app?.name }}</div>
        </div>
        <!-- 对话开场白 -->
        <div
          v-if="web_app?.app_config?.opening_statement"
          class="bg-gray-100 w-full px-4 py-3 rounded-lg text-gray-700"
        >
          {{ web_app?.app_config?.opening_statement }}
        </div>
        <!-- 开场白建议问题 -->
        <div class="flex items-center flex-wrap gap-2 w-full">
          <div
            v-for="(opening_question, idx) in web_app?.app_config?.opening_questions.filter(
              (item: any) => item.trim() !== '',
            )"
            :key="idx"
            class="px-4 py-1.5 border rounded-lg text-gray-700 cursor-pointer hover:bg-gray-50"
            @click="async () => await handleSubmitQuestion(opening_question)"
          >
            {{ opening_question }}
          </div>
        </div>
      </div>
      <!-- 对话输入框 -->
      <div class="w-[600px] mx-auto flex flex-col flex-shrink-0">
        <!-- 顶部输入框 -->
        <div class="px-6 flex items-center gap-4">
          <!-- 输入框组件 -->
          <div
            class="h-[50px] flex items-center gap-2 px-4 flex-1 border border-gray-200 rounded-full"
          >
            <input
              v-model="query"
              type="text"
              class="flex-1 outline-0"
              @keyup.enter="handleSubmit"
              :placeholder="`给 &quot;${web_app?.name ?? '&quot;聊天机器人&quot;'}&quot; 发送消息`"
            />
            <a-button
              :loading="webAppChatLoading"
              type="text"
              shape="circle"
              class="!text-gray-700"
              @click="handleSubmit"
            >
              <template #icon>
                <icon-send :size="16" />
              </template>
            </a-button>
          </div>
        </div>
        <!-- 底部提示信息 -->
        <div class="text-center text-gray-500 text-xs py-4">
          内容由AI生成，无法确保真实准确，仅供参考。
        </div>
      </div>
    </div>
    <!-- 修改会话名字模态窗 -->
    <update-name-modal
      v-model:visible="updateConversationNameModalVisible"
      v-model:conversation_id="updateConversationNameId"
      :success_callback="successUpdateNameCallback"
    />
  </div>
</template>

<style scoped></style>
