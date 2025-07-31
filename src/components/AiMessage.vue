<script setup lang="ts">
import { computed, type PropType } from 'vue'
import MarkdownIt from 'markdown-it'
import DotFlashing from '@/components/DotFlashing.vue'
import { useAudioPlayer } from '@/hooks/use-audio'
import AgentThought from './AgentThought.vue'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import 'github-markdown-css'
import { Message } from '@arco-design/web-vue'

const { textToAudioLoading, isPlaying, startAudioStream, stopAudioStream } = useAudioPlayer()
const props = defineProps({
  app: {
    type: Object,
    default: () => {
      return {}
    },
    required: true,
  },
  enable_text_to_speech: { type: Boolean, default: false, required: false },
  message_id: { type: String, default: '', required: false },
  answer: { type: String, default: '', required: true },
  loading: { type: Boolean, default: false, required: false },
  latency: { type: Number, default: 0, required: false },
  total_token_count: { type: Number, default: 0, required: false },
  agent_thoughts: {
    type: Array as PropType<Record<string, any>[]>,
    default: () => [],
    required: true,
  },
  suggested_questions: { type: Array as PropType<string[]>, default: () => [], required: false },
  message_class: { type: String, default: '!bg-gray-100', required: false },
  enable_agent_thought: { type: Boolean, default: false, required: false },
  enable_token_cost: { type: Boolean, default: false, required: false },
})
const emits = defineEmits(['selectSuggestedQuestion'])
const md = MarkdownIt({
  html: true, // 允许 HTML 标签
  linkify: true, // 自动转换 URL 为链接
  typographer: true, // 优化排版
})
// 添加自定义 ^^ 规则
md.inline.ruler.before('emphasis', 'double_caret', (state, silent) => {
  const max = state.posMax
  const start = state.pos

  if (state.src.charCodeAt(start) !== 0x5e || state.src.charCodeAt(start + 1) !== 0x5e) {
    return false
  }

  let end = start + 2
  while (end < max) {
    if (state.src.charCodeAt(end) === 0x5e && state.src.charCodeAt(end + 1) === 0x5e) {
      break
    }
    end++
  }

  if (end + 1 >= max) return false

  const content = state.src.slice(start + 2, end)

  if (!silent) {
    const token = state.push('double_caret', '', 0)
    token.content = content
    token.markup = '^^'
  }

  state.pos = end + 2
  return true
})

// 自定义渲染规则
md.renderer.rules.double_caret = (tokens: any, idx: any) => {
  return `<mark style="background-color: transparent; font-style: italic;">${md.utils.escapeHtml(tokens[idx].content)}</mark>`
}

md.set({
  highlight: function (str: string, lang: string) {
    // 指定语言时使用对应高亮
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang }).value}</code></pre>`
      } catch (__) {
        /* empty */
      }
    }

    // 未指定语言时自动检测
    try {
      return `<pre class="hljs"><code>${hljs.highlightAuto(str).value}</code></pre>`
    } catch (__) {
      /* empty */
    }

    // 保底处理
    return `<pre class="hljs"><code>${md.utils.escapeHtml(str)}</code></pre>`
  },
})
const compiledMarkdown = computed(() => {
  return md.render(props.answer)
})

const copyText = async () => {
  try {
    await navigator.clipboard.writeText(props.answer)
    Message.info('复制完成')
  } catch (err) {
    Message.error('复制失败')
  }
}
</script>

<template>
  <div class="flex gap-2 group">
    <!-- 左侧图标 -->
    <a-avatar
      v-if="props.app?.icon"
      :size="30"
      shape="circle"
      class="flex-shrink-0"
      :image-url="props.app?.icon"
    />
    <a-avatar v-else :size="30" shape="circle" class="flex-shrink-0 bg-blue-700">
      <icon-apps />
    </a-avatar>
    <!-- 右侧名称与消息 -->
    <div class="flex-1 flex flex-col items-start gap-2">
      <!-- 应用名称 -->
      <div class="text-gray-700 font-bold">{{ props.app?.name }}</div>
      <!-- 推理步骤 -->
      <agent-thought
        v-if="enable_agent_thought"
        :agent_thoughts="props.agent_thoughts"
        :loading="props.loading"
      />
      <!-- AI消息 -->
      <div
        v-if="props.loading && props.answer.trim() === ''"
        :class="`${props.message_class} border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl break-all`"
      >
        <dot-flashing />
      </div>
      <div
        v-else
        :class="`${props.message_class} markdown-body border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl break-all`"
        v-html="compiledMarkdown"
      ></div>
      <!-- 消息展示与操作 -->
      <div v-if="props.answer" class="w-full flex items-center justify-between">
        <!-- 消息数据额外展示 -->
        <a-space class="text-xs">
          <template #split>
            <a-divider direction="vertical" class="m-0" />
          </template>
          <!-- 文本复制 -->
          <div class="flex items-center gap-1 text-gray-500">
            <icon-copy class="cursor-pointer hover:text-gray-700" @click="copyText" />
          </div>
          <!-- 播放音频&暂停播放 -->
          <div v-if="props.enable_text_to_speech" class="flex items-center gap-2">
            <template v-if="textToAudioLoading">
              <icon-loading class="text-gray-500" />
            </template>
            <template v-else>
              <icon-pause
                v-if="isPlaying"
                class="text-blue-700 cursor-pointer hover:text-gray-700"
                @click="() => stopAudioStream()"
              />
              <icon-play-circle
                v-else
                class="text-gray-400 cursor-pointer hover:text-gray-700"
                @click="() => startAudioStream(props.message_id)"
              />
            </template>
          </div>
          <div class="flex items-center gap-1 text-gray-500">
            <icon-check />
            {{ props.latency.toFixed(2) }}s
          </div>
          <div v-if="enable_token_cost" class="text-gray-500">
            {{ props.total_token_count }} Tokens
          </div>
        </a-space>
      </div>
      <!-- 建议问题列表 -->
      <div v-if="props.suggested_questions.length > 0" class="flex flex-col gap-2">
        <a-space>
          <div
            v-for="(suggested_question, idx) in props.suggested_questions"
            :key="idx"
            class="px-4 py-1.5 border rounded-lg text-gray-700 cursor-pointer bg-white hover:bg-gray-50"
            @click="() => emits('selectSuggestedQuestion', suggested_question)"
          >
            {{ suggested_question }}
          </div>
        </a-space>
      </div>
    </div>
  </div>
</template>

<style></style>
