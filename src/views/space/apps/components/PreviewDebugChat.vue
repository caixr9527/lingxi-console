<script setup lang="ts">
// @ts-ignore
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { nextTick, onMounted, type PropType, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  useDebugChat,
  useDeleteDebugConversation,
  useGetDebugConversationMessagesWithPage,
  useStopDebugChat,
} from '@/hooks/use-app'
import { useGenerateSuggestedQuestions } from '@/hooks/use-ai'
import { useAccountStore } from '@/stores/account'
import HumanMessage from './HumanMessage.vue'
import AiMessage from './AiMessage.vue'
import { Message } from '@arco-design/web-vue'
import { QueueEvent } from '@/config'

const route = useRoute()
const props = defineProps({
  app: {
    type: Object,
    default: () => {
      return {}
    },
    required: true,
  },
  suggested_after_answer: {
    type: Object as PropType<{ enable: boolean }>,
    default: () => {
      return { enable: true }
    },
    required: true,
  },
  opening_statement: { type: String, default: '', required: true },
  opening_questions: { type: Array as PropType<string[]>, default: () => [], required: true },
})
const query = ref('')
const message_id = ref('')
const task_id = ref('')
const scroller = ref<any>(null)
const scrollHeight = ref(0)
const accountStore = useAccountStore()
const { loading: deleteDebugConversationLoading, handleDeleteDebugConversation } =
  useDeleteDebugConversation()
const {
  loading: getDebugConversationMessagesWithPageLoading,
  messages,
  loadDebugConversationMessages,
} = useGetDebugConversationMessagesWithPage()
const { loading: debugChatLoading, handleDebugChat } = useDebugChat()
const { loading: stopDebugChatLoading, handleStopDebugChat } = useStopDebugChat()
const { suggested_questions, handleGenerateSuggestedQuestions } = useGenerateSuggestedQuestions()
const saveScrollHeight = () => {
  scrollHeight.value = scroller.value.$el.scrollHeight
}

const restoreScrollPosition = () => {
  scroller.value.$el.scrollTop = scroller.value.$el.scrollHeight - scrollHeight.value
}

const handleScroll = async (event: UIEvent) => {
  const { scrollTop } = event.target as HTMLElement
  if (scrollTop <= 0 && !getDebugConversationMessagesWithPageLoading.value) {
    saveScrollHeight()
    await loadDebugConversationMessages(String(route.params?.app_id), false)
    restoreScrollPosition()
  }
}

const handleSubmit = async () => {
  if (query.value.trim() === '') {
    Message.warning('用户提问不能为空')
    return
  }

  if (debugChatLoading.value) {
    Message.warning('上一次提问还未结束，请稍等')
    return
  }

  suggested_questions.value = []
  message_id.value = ''
  task_id.value = ''

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

  await handleDebugChat(props.app?.id, humanQuery, (event_response) => {
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
      } else if (event === QueueEvent.error) {
        messages.value[0].answer = data?.observation
      } else if (event === QueueEvent.timeout) {
        messages.value[0].answer = '当前Agent执行已超时，无法得到答案，请重试'
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

  if (props.suggested_after_answer.enable && message_id.value) {
    await handleGenerateSuggestedQuestions(message_id.value)
    setTimeout(() => scroller.value && scroller.value.scrollToBottom(), 100)
  }
}

const handleStop = async () => {
  if (task_id.value === '' || !debugChatLoading.value) return
  await handleStopDebugChat(props.app?.id, task_id.value)
}

const handleSubmitQuestion = async (question: string) => {
  query.value = question
  await handleSubmit()
}

onMounted(async () => {
  await loadDebugConversationMessages(String(route.params?.app_id), true)
  await nextTick(() => {
    // 确保在视图更新完成后执行滚动操作
    if (scroller.value) {
      scroller.value.scrollToBottom()
    }
  })
})
</script>

<template>
  <div class="">
    <!-- 历史对话列表 -->
    <div v-if="messages.length > 0" class="flex flex-col px-6 h-[calc(100vh-238px)]">
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
                :app="props.app"
                :suggested_questions="item.id === message_id ? suggested_questions : []"
                :loading="item.id === message_id && debugChatLoading"
                :latency="item.latency"
                :total_token_count="item.total_token_count"
                @select-suggested-question="handleSubmitQuestion"
                message_class="max-w-[calc(100%-65px)]"
              />
            </div>
          </dynamic-scroller-item>
        </template>
      </dynamic-scroller>
      <!-- 停止调试会话 -->
      <div v-if="task_id && debugChatLoading" class="h-[50px] flex items-center justify-center">
        <a-button :loading="stopDebugChatLoading" class="rounded-lg px-2" @click="handleStop">
          <template #icon>
            <icon-poweroff />
          </template>
          停止响应
        </a-button>
      </div>
    </div>
    <!-- 对话列表为空时展示的对话开场白 -->
    <div v-else class="flex flex-col p-6 gap-2 items-center justify-center h-[calc(100vh-238px)]">
      <!-- 应用图标与名称 -->
      <div class="flex flex-col items-center gap-2">
        <a-avatar :size="48" shape="square" class="rounded-lg" :image-url="props.app?.icon" />
        <div class="text-lg text-gray-700">{{ props.app?.name }}</div>
      </div>
      <!-- 对话开场白 -->
      <div
        v-if="props.opening_statement"
        class="bg-gray-100 w-full px-4 py-3 rounded-lg text-gray-700"
      >
        {{ props.opening_statement }}
      </div>
      <!-- 开场白建议问题 -->
      <div class="flex items-center flex-wrap gap-2 w-full">
        <div
          v-for="(opening_question, idx) in props.opening_questions.filter(
            (item) => item.trim() !== '',
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
    <div class="w-full flex flex-col flex-shrink-0">
      <!-- 顶部输入框 -->
      <div class="px-6 flex items-center gap-4">
        <!-- 清除按钮 -->
        <a-button
          :loading="deleteDebugConversationLoading"
          class="flex-shrink-0 !text-gray-700"
          type="text"
          shape="circle"
          @click="
            async () => {
              // 1.先调用停止响应接口
              await handleStop()

              // 2.调用api接口清空会话
              await handleDeleteDebugConversation(props.app?.id)

              // 3.重新获取数据
              await loadDebugConversationMessages(props.app?.id, true)
            }
          "
        >
          <template #icon>
            <icon-empty :size="16" />
          </template>
        </a-button>
        <!-- 输入框组件 -->
        <div
          class="h-[50px] flex items-center gap-2 px-4 flex-1 border border-gray-200 rounded-full"
        >
          <input v-model="query" type="text" class="flex-1 outline-0" @keyup.enter="handleSubmit" />
          <a-button
            :loading="debugChatLoading"
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
    <!-- 停止会话按钮 -->
  </div>
</template>

<style scoped></style>
