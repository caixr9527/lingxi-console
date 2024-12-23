<script setup lang="ts">
import { nextTick, onMounted, ref, type PropType } from 'vue'
import { useDeleteDebugConversation, useGetDebugConversationMessageWithPage } from '@/hooks/use-app'
// @ts-ignore
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { useAccountStore } from '@/stores/account'
import { useRoute } from 'vue-router'
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
const scroller = ref<any>(null)
const scrollHeight = ref(0)

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
            <div class="flex gap-2">
              <!-- 左侧头像 -->
              <a-avatar
                :size="30"
                shape="circle"
                class="flex-shrink-0"
                :image-url="accountStore.account.avatar"
              />
              <!-- 右侧昵称与消息 -->
              <div class="flex flex-col gap-2">
                <!-- 账号昵称 -->
                <div class="text-gray-700 font-bold">{{ accountStore.account.name }}</div>
                <!-- 人类消息 -->
                <div class="bg-blue-700 border border-blue-900 text-white px-4 py-3 rounded-2xl">
                  {{ item.query }}
                </div>
              </div>
            </div>
            <!-- AI消息 -->
            <div class="flex gap-2">
              <!-- 左侧图标 -->
              <a-avatar
                :size="30"
                shape="circle"
                class="flex-shrink-0"
                :image-url="props.app?.icon"
              />
              <!-- 右侧昵称与消息 -->
              <div class="flex flex-col gap-2">
                <!-- 应用名称 -->
                <div class="text-gray-700 font-bold">{{ props.app?.name }}</div>
                <!-- todo:推理步骤 -->
                <!-- AI消息 -->
                <div class="bg-gray-100 border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl">
                  {{ item.answer }}
                </div>
              </div>
            </div>
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
        <input type="text" class="flex-1 outline-0" />
        <a-button type="text" shape="circle" class="!text-gray-700">
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
