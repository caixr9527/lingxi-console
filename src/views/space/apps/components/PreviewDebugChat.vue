<script setup lang="ts">
import { nextTick, onMounted, ref, type PropType } from 'vue'
import { useDeleteDebugConversation, useGetDebugConversationMessageWithPage } from '@/hooks/use-app'
// @ts-ignore
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useAccountStore } from '@/stores/account'
import { useRoute } from 'vue-router'
import HumanMessage from './HumanMessage.vue'
import AiMessage from './AiMessage.vue'
import { Message } from '@arco-design/web-vue'
import { useDebugChat } from '@/hooks/use-app'
import { QueueEvent } from '@/config'

const props = defineProps({
  app: { type: Object, default: {}, required: true },
  opening_statement: { type: String, default: '', required: true },
  opening_questions: { type: Array as PropType<string[]>, default: [], required: true },
})
const route = useRoute()
const accountStore = useAccountStore()
const { loading: deleteDebugConversationLoading, handleDeleteDebugConversation } =
  useDeleteDebugConversation()
const {
  loading: getDebugConversationMessagesWithPageLoading,
  messages,
  paginator,
  loadDebugConversationMessages,
} = useGetDebugConversationMessageWithPage()
const query = ref('')
const message_id = ref('')
const task_id = ref('')
const suggested_questions = ref<string[]>([])
const scroller = ref<any>(null)
const scrollHeight = ref(0)
const { loading: debugChatLoading, handleDebugChat } = useDebugChat()

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
  // 5.1 检测是否录入了query，如果没有则结束
  if (query.value.trim() === '') {
    Message.warning('用户提问不能为空')
    return
  }

  // 5.2 检测上次提问是否结束，如果没结束不能发起新提问
  if (debugChatLoading.value) {
    Message.warning('上一次提问还未结束，请稍等')
    return
  }

  // 5.3 满足条件，处理正式提问的前置工作，涵盖：清空建议问题、删除消息id、任务id
  suggested_questions.value = []
  message_id.value = ''
  task_id.value = ''

  // 5.4 往消息列表中添加基础人类消息
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

  // 5.5 初始化推理过程数据，并清空输入数据
  let position = 0
  const humanQuery = query.value
  query.value = ''

  // 5.6 调用hooks发起请求
  await handleDebugChat(props.app?.id, humanQuery, (event_response) => {
    // 5.7 提取流式事件响应数据以及事件名称
    const event = event_response?.event
    const data = event_response?.data
    const event_id = data?.id
    let agent_thoughts = messages.value[0].agent_thoughts

    // 5.8 初始化数据检测与赋值
    if (message_id.value === '' && data?.message_id) {
      task_id.value = data?.task_id
      message_id.value = data?.message_id
      messages.value[0].id = data?.message_id
      messages.value[0].conversation_id = data?.conversation_id
    }

    // 5.9 循环处理得到的事件，记录除ping之外的事件
    if (event !== QueueEvent.ping) {
      // 5.10 除了agent_message数据为叠加，其他均为覆盖
      if (event === QueueEvent.agentMessage) {
        // 5.11 获取数据索引并检测是否存在
        const agent_thought_idx = agent_thoughts.findIndex((item) => item?.id === event_id)

        // 5.12 数据不存在则添加
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
          // 5.13 存在数据则叠加
          agent_thoughts[agent_thought_idx] = {
            ...agent_thoughts[agent_thought_idx],
            thought: agent_thoughts[agent_thought_idx]?.thought + data?.thought,
            latency: data?.latency,
          }
        }

        // 5.14 更新/添加answer答案
        messages.value[0].answer += data?.thought
      } else {
        // 5.15 处理其他类型的事件，直接填充覆盖数据
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

      // 5.16 更新agent_thoughts
      messages.value[0].agent_thoughts = agent_thoughts

      scroller.value.scrollToBottom()
    }
  })

  // 5.7 判断是否开启建议问题生成，如果开启了则发起api请求获取数据
  if (props.suggested_after_answer.enable) {
    await handleGenerateSuggestedQuestions(message_id.value)
    setTimeout(() => scroller.value && scroller.value.scrollToBottom(), 100)
  }
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
  <!-- 历史对话列表 -->
  <div v-if="messages.length > 0" class="flex flex-col px-6 h-[calc(100vh-238px)]">
    <dynamic-scroller
      ref="scroller"
      :items="messages.slice().reverse()"
      :min-item-size="1"
      @scroll="handleScroll"
      class="h-full scrollbar-w-none"
    >
      <template v-slot="{ item, index, active }">
        <dynamic-scroller-item :item="item" :active="active" :data-index="item.id">
          <div class="flex flex-col gap-6 py-6">
            <!-- 人类消息 -->
            <human-message :query="item.query" :account="accountStore.account" />
            <!-- AI消息 -->
            <ai-message
              :agent_thoughts="item.agent_thoughts"
              :answer="item.answer"
              :app="props.app"
              :loading="item.id === message_id && debugChatLoading"
            />
          </div>
        </dynamic-scroller-item>
      </template>
    </dynamic-scroller>
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
        @click="
          async () => {
            query = opening_question
            await handleSubmit()
          }
        "
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
            await handleDeleteDebugConversation(props.app?.id)
            await loadDebugConversationMessages(props.app?.id, true)
          }
        "
      >
        <template #icon>
          <icon-empty :size="16" />
        </template>
      </a-button>
      <!-- 输入框组件 -->
      <div class="h-[50px] flex items-center gap-2 px-4 flex-1 border border-gray-200 rounded-full">
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
  <!-- 停止对话按钮 -->
</template>

<style scoped></style>
