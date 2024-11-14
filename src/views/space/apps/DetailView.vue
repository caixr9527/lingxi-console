<template>
  <div class="min-h-screen">
    <header class="flex items-center h-[74px] gb-gray-100 border-b border-gray-200 px-4">
      顶部导航
    </header>
    <div class="flex flex-row h-[calc(100vh-74px)]">
      <!-- 左侧的编排 -->
      <div class="w-2/3 bg-gray-50 h-full">
        <header class="flex items-center h-16 border-b border-gray-200 px-7 text-xl text-gray-70">
          应用编排
        </header>
        <div class="flex flex-row h-[calc(100%-64px)]">
          <div class="flex-1 border-r border-gray-200 p-6">人设与回复逻辑</div>
          <div class="flex-1 p-6">应用能力</div>
        </div>
      </div>
      <!-- 右侧调试与预览 -->
      <div class="flex flex-col w-1/3 bg-white h-full">
        <!-- 调试与预览 -->
        <header
          class="flex flex-shrink-0 items-center h-16 px-4 text-xl bg-white border-b border-gray-200 shadow-sm"
        >
          调试与预览
        </header>
        <!-- 调试对话界面 -->
        <div class="h-full min-h-0 px-6 py-7 overflow-x-hidden overflow-y-scroll scrollbar-w-none">
          <!-- 人类消息 -->
          <div class="flex flex-row gap-2 mb-6" v-for="message in messages" :key="message.content">
            <!-- 头像 -->
            <a-avatar
              v-if="message.role === 'human'"
              :style="{ backgroundColor: '#3370ff' }"
              :size="30"
              class="flex-shrink-0"
            >
              蔡
            </a-avatar>
            <a-avatar
              v-else
              :style="{ backgroundColor: '#00d0b6' }"
              :size="30"
              class="flex-shrink-0"
            >
              <icon-apps />
            </a-avatar>
            <!-- 实际消息 -->
            <div class="flex flex-col gap-2">
              <div class="font-semibold text-gray-700">
                {{ message.role === 'human' ? '用户' : '聊天机器人' }}
              </div>
              <div
                v-if="message.role === 'human'"
                class="max-w-max bg-blue-700 text-white border border-blue-800 px-4 py-3 rounded-2xl leading-5"
              >
                {{ message.content }}
              </div>
              <div
                v-else
                class="max-w-max bg-gray-100 text-gray-900 border border-gray-200 px-4 py-3 rounded-2xl leading-5"
              >
                {{ message.content }}
                <div v-if="isLoading" class="cursor"></div>
              </div>
            </div>
          </div>
          <!-- 没有数据时 -->
          <div
            v-if="!messages.length"
            class="mt-[200px] flex flex-col items-center justify-center gap-2"
          >
            <a-avatar :size="70" shape="square" :style="{ backgroundColor: '#00d0b6' }">
              <icon-apps />
            </a-avatar>
            <div class="text-2xl font-semibold text-gray-900 mt-2">聊天机器人</div>
          </div>
        </div>
        <!-- 调试对话输入框 -->
        <div class="w-full flex-shrink-0 flex flex-col">
          <!-- 顶部输入框 -->
          <div class="px-6 flex items-center gap-4">
            <!-- 清除消息历史 -->
            <a-button class="flex-shrink-0" type="text" shape="circle" @click="clearMessages">
              <template #icon>
                <icon-empty size="16" :style="{ color: '#374151' }" />
              </template>
            </a-button>
            <!-- 输入框组件 -->
            <div
              class="h-[50px] flex items-center gap-2 px-4 flex-1 border border-gary-200 rounded-full"
            >
              <input type="text" class="flex-1 outline-0" v-model="query" @keyup.enter="send" />
              <a-button type="text" shape="circle">
                <template #icon>
                  <icon-plus-circle size="16" :style="{ color: '#374151' }" />
                </template>
              </a-button>

              <a-button type="text" shape="circle" @click="send">
                <template #icon>
                  <icon-send size="16" :style="{ color: '#1d4ed8' }" />
                </template>
              </a-button>
            </div>
          </div>
          <!-- 底部文字提示 -->
          <div class="text-center text-gray-500 text-xs py-4">
            内容由AI生成,无法确保真实准确,仅供参考
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { debugApp } from '@/services/app'
import { useRoute } from 'vue-router'

const query = ref('')
const messages = ref<any>([])
const isLoading = ref(false)
const route = useRoute()

const clearMessages = () => {
  messages.value = []
}

const send = async () => {
  // 获取用户输入数据，校验值是否存在
  if (!query.value) {
    Message.error('用户提问不能为空')
    return
  }
  if (isLoading.value) {
    Message.warning('提问频繁，请稍后')
    return
  }

  try {
    isLoading.value = true
    const humanQuery = query.value
    messages.value.push({
      role: 'human',
      content: humanQuery,
    })
    query.value = ''
    messages.value.push({
      role: 'ai',
      content: '',
    })
    await debugApp(route.params.app_id as string, humanQuery, (event_response) => {
      const event = event_response?.event
      const data = event_response?.data

      const lastIndex = messages.value.length - 1
      let message = messages.value[lastIndex]
      // 需要从data中获取
      if (data.event === 'agent_message') {
        // let chunk_content = data?.data
        messages.value[lastIndex].content = message.content + data.answer
      }
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.cursor {
  display: inline-block;
  width: 1px;
  height: 14px;
  background-color: #444444;
  animation: blink 1s step-end infinite;
  vertical-align: middle;
}
@keyframes blink {
  0%,
  100% {
    opacity: 1; /*显示 */
  }
  50% {
    opacity: 0; /*隐藏 */
  }
}
</style>
