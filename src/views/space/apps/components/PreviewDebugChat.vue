<script setup lang="ts">
// @ts-ignore
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller'
import 'vue-virtual-scroller/dist/vue-virtual-scroller.css'
import { computed, nextTick, onMounted, type PropType, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  useDebugChat,
  useDeleteDebugConversation,
  useGetDebugConversationMessagesWithPage,
  useStopDebugChat,
} from '@/hooks/use-app'
import { useGenerateSuggestedQuestions } from '@/hooks/use-ai'
import { useAccountStore } from '@/stores/account'
import HumanMessage from '@/components/HumanMessage.vue'
import AiMessage from '@/components/AiMessage.vue'
import { Message } from '@arco-design/web-vue'
import { cosDomain, QueueEvent } from '@/config'
import { uploadFile, uploadImage } from '@/services/upload-file'
import AudioRecorder from 'js-audio-recorder'
import { useAudioPlayer, useAudioToText } from '@/hooks/use-audio'
import { isImage, isFile } from '@/utils/helper'
import IconCsv from '@/components/icons/IconCsv.vue'
import IconDoc from '@/components/icons/IconDoc.vue'
import IconHtml from '@/components/icons/IconHtml.vue'
import IconMd from '@/components/icons/IconMd.vue'
import IconPdf from '@/components/icons/IconPdf.vue'
import IconPpt from '@/components/icons/IconPpt.vue'
import IconProperties from '@/components/icons/IconProperties.vue'
import IconTxt from '@/components/icons/IconTxt.vue'
import IconXls from '@/components/icons/IconXls.vue'
import IconXml from '@/components/icons/IconXml.vue'
import IconYaml from '@/components/icons/IconYaml.vue'

const route = useRoute()
const props = defineProps({
  app: {
    type: Object,
    default: () => {
      return {}
    },
    required: true,
  },
  app_config: {
    type: Object as PropType<Record<string, any>>,
    default: () => {
      return {}
    },
    required: true,
  },
})
const query = ref('')
const image_urls = ref<string[]>([])
const fileInput = ref<any>(null)
const uploadFileLoading = ref(false)
const isRecording = ref(false) // 是否正在录音
const audioBlob = ref<any>(null) // 录音后音频的blob
let recorder: any = null // RecordRTC实例
const message_id = ref('')
const message_event = ref('')
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
const { loading: audioToTextLoading, text, handleAudioToText } = useAudioToText()
const { startAudioStream } = useAudioPlayer()

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
    image_urls: image_urls.value,
    answer: '',
    total_token_count: 0,
    latency: 0,
    agent_thoughts: [],
    created_at: 0,
  })

  let position = 0
  const humanQuery = query.value
  const humanImageUrls = image_urls.value
  query.value = ''
  image_urls.value = []

  await handleDebugChat(props.app?.id, humanQuery, humanImageUrls, (event_response) => {
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
    if (event === QueueEvent.agentEnd) {
      message_event.value = event
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
        messages.value[0].answer = '服务器繁忙,请稍后重试'
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

  if (
    props.app_config.suggested_after_answer?.enable &&
    message_id.value &&
    message_event.value === QueueEvent.agentEnd
  ) {
    await handleGenerateSuggestedQuestions(message_id.value)
    setTimeout(() => scroller.value && scroller.value.scrollToBottom(), 100)
  }

  if (
    props.app_config.text_to_speech?.enable &&
    props.app_config.text_to_speech?.auto_play &&
    message_id.value
  ) {
    startAudioStream(message_id.value)
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

const triggerFileInput = () => {
  if (image_urls.value.length >= 5) {
    Message.error('对话上传图片数量不能超过5张')
    return
  }

  fileInput.value.click()
}

const handleFileChange = async (event: Event) => {
  try {
    // 判断是否在上传中
    if (uploadFileLoading.value) return

    uploadFileLoading.value = true
    // 获取当前选中的图片
    const input = event.target as HTMLInputElement
    const files = input.files
    const filesLength = files ? files.length : 0
    if (filesLength > 5) {
      Message.error('对话上传文档/文件/图片数量不能超过5')
      return
    }
    if (filesLength === 0) {
      return
    }
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB

    const filesArray = Array.from(input.files || []) // 转为数组方便操作

    if (filesArray.some((file) => file.size > MAX_SIZE)) {
      Message.warning('单个文件大小不能超过10M')
      return
    }

    for (const file of filesArray) {
      if (file) {
        const isImg = file.type.startsWith('image')
        var resp: any
        if (isImg) {
          resp = await uploadImage(file)
        } else {
          resp = await uploadFile(file)
        }
        if (resp.code === 'success') {
          image_urls.value.push(isImg ? resp.data.image_url : cosDomain + resp.data.key)
        } else {
          Message.error(resp.message)
          return
        }
      }
    }
    Message.success('上传图片成功')
  } finally {
    uploadFileLoading.value = false
  }
}

const can_image_input = computed(() => {
  return props.app_config?.multimodal?.enable
})
const handleStartRecord = async () => {
  // 创建AudioRecorder
  recorder = new AudioRecorder()

  // 开始录音并记录录音状态
  try {
    isRecording.value = true
    await recorder.start()
    Message.success('开始录音')
  } catch (error: any) {
    Message.error(`录音失败: ${error}`)
    isRecording.value = false
  }
}

const upload_file_accept = computed(() => {
  if (props.app_config?.multimodal?.enable) {
    return '.jpg,.jpeg,.png,.svg,.gif,.webp,.bmp,.ico,.xlsx,.xls,.pdf,.md,.markdown,.htm,.html,.csv,.ppt,.pptx,.xml,.txt,.yaml,.yml,.properties,.doc,.docx'
  }
  return 'image/*'
})

const handleStopRecord = async () => {
  if (recorder) {
    try {
      // 等待录音停止并获取录音数据
      await recorder.stop()
      audioBlob.value = recorder.getWAVBlob()

      // 调用语音转文本处理器并将文本填充到query中
      await handleAudioToText(audioBlob.value)
      Message.success('语音转文本成功')
      query.value = text.value
    } catch (error: any) {
      Message.error(`录音失败: ${error}`)
    } finally {
      isRecording.value = false // 标记为停止录音
    }
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
  <div class="">
    <!-- 历史对话列表 -->
    <div
      v-if="messages.length > 0"
      :class="`flex flex-col px-6 ${image_urls.length > 0 ? 'h-[calc(100vh-288px)]' : 'h-[calc(100vh-238px)]'}`"
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
              <human-message
                :query="item.query"
                :image_urls="item.image_urls"
                :account="accountStore.account"
                :enable_user_info="false"
              />
              <ai-message
                :enable_token_cost="true"
                :enable_agent_thought="true"
                :message_id="item.id"
                :enable_text_to_speech="props.app_config.text_to_speech?.enable"
                :agent_thoughts="item.agent_thoughts"
                :answer="item.answer"
                :app="props.app"
                :suggested_questions="item.id === message_id ? suggested_questions : []"
                :loading="item.id === message_id && debugChatLoading"
                :latency="item.latency"
                :total_token_count="item.total_token_count"
                @select-suggested-question="handleSubmitQuestion"
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
    <div
      v-else
      :class="`flex flex-col p-6 gap-2 items-center justify-center ${image_urls.length > 0 ? 'h-[calc(100vh-288px)]' : 'h-[calc(100vh-238px)]'}`"
    >
      <!-- 应用图标与名称 -->
      <div class="flex flex-col items-center gap-2">
        <a-avatar :size="48" shape="square" class="rounded-lg" :image-url="props.app?.icon" />
        <div class="text-lg text-gray-700">{{ props.app?.name }}</div>
      </div>
      <!-- 对话开场白 -->
      <div
        v-if="props.app_config.opening_statement"
        class="bg-gray-100 w-full px-4 py-3 rounded-lg text-gray-700"
      >
        {{ props.app_config.opening_statement }}
      </div>
      <!-- 开场白建议问题 -->
      <div class="flex items-center flex-wrap gap-2 w-full">
        <div
          v-for="(opening_question, idx) in props.app_config.opening_questions?.filter(
            (item: String) => item.trim() !== '',
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
          :class="`${image_urls.length > 0 ? 'h-[100px]' : 'h-[50px]'} flex flex-col justify-center gap-2 px-4 flex-1 border border-gray-200 rounded-[24px]`"
        >
          <!-- 图片列表 -->
          <div v-if="image_urls.length > 0 && can_image_input" class="flex items-center gap-2">
            <div
              v-for="(image_url, idx) in image_urls"
              :key="image_url"
              class="w-10 h-10 relative rounded-lg overflow-hidden group cursor-pointer"
            >
              <a-avatar v-if="isImage(image_url)" shape="square" :image-url="image_url" />
              <a-avatar
                :style="{ width: '40px', height: '40px' }"
                v-else-if="isFile(image_url)"
                shape="square"
              >
                <icon-csv v-if="image_url.endsWith('csv')" />
                <icon-doc v-else-if="image_url.endsWith('doc') || image_url.endsWith('docx')" />
                <icon-html v-else-if="image_url.endsWith('htm') || image_url.endsWith('html')" />
                <icon-md v-else-if="image_url.endsWith('md') || image_url.endsWith('markdown')" />
                <icon-pdf v-else-if="image_url.endsWith('pdf')" />
                <icon-ppt v-else-if="image_url.endsWith('ppt') || image_url.endsWith('pptx')" />
                <icon-properties v-else-if="image_url.endsWith('properties')" />
                <icon-txt v-else-if="image_url.endsWith('txt')" />
                <icon-xls v-else-if="image_url.endsWith('xls') || image_url.endsWith('xlsx')" />
                <icon-xml v-else-if="image_url.endsWith('xml')" />
                <icon-yaml v-else-if="image_url.endsWith('yaml') || image_url.endsWith('yml')" />
                <icon-file v-else />
              </a-avatar>
              <div
                class="hidden group-hover:flex items-center justify-center bg-gray-700/50 w-10 h-10 absolute top-0"
              >
                <icon-close class="text-white" @click="() => image_urls.splice(idx, 1)" />
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <input
              v-model="query"
              type="text"
              class="flex-1 outline-0"
              @keyup.enter="handleSubmit"
            />
            <!-- 上传图片输入框 -->
            <input
              type="file"
              ref="fileInput"
              :accept="upload_file_accept"
              @change="handleFileChange"
              class="hidden"
              multiple
            />
            <a-button
              v-if="can_image_input"
              :loading="uploadFileLoading"
              size="mini"
              type="text"
              shape="circle"
              class="!text-gray-700"
              @click="triggerFileInput"
            >
              <template #icon>
                <icon-plus />
              </template>
            </a-button>
            <!-- 语音转文本加载按钮 -->
            <template v-if="!props.app_config.speech_to_text?.enable"></template>
            <template v-else-if="audioToTextLoading">
              <a-button size="mini" type="text" shape="circle">
                <template #icon>
                  <icon-loading />
                </template>
              </a-button>
            </template>
            <template v-else>
              <!-- 开始音频录制按钮 -->
              <a-button
                v-if="!isRecording"
                size="mini"
                type="text"
                shape="circle"
                class="!text-gray-700"
                @click="handleStartRecord"
              >
                <template #icon>
                  <icon-voice />
                </template>
              </a-button>
              <!-- 结束音频录制按钮 -->
              <a-button v-else size="mini" type="text" shape="circle" @click="handleStopRecord">
                <template #icon>
                  <icon-pause />
                </template>
              </a-button>
            </template>
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
