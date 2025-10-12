<script setup lang="ts">
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
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import { computed } from 'vue'
const props = defineProps({
  account: {
    type: Object,
    default: () => {
      return {}
    },
    required: true,
  },
  query: { type: String, default: '', required: true },
  image_urls: { type: Array, default: () => [] },
  enable_user_info: { type: Boolean, default: false, required: false },
})

const md = MarkdownIt({
  html: true, // 允许 HTML 标签
  linkify: true, // 自动转换 URL 为链接
  typographer: true, // 优化排版
})
// 添加自定义 ^^ 规则
md.inline.ruler.before('emphasis', 'double_caret', (state: any, silent: any) => {
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
  return md.render(props.query)
})
</script>

<template>
  <div v-if="enable_user_info" class="flex gap-2">
    <!-- 左侧头像 -->
    <a-avatar :size="30" shape="circle" class="flex-shrink-0" :image-url="props.account?.avatar" />
    <!-- 右侧昵称与消息 -->
    <div class="flex flex-col items-start gap-2">
      <!-- 账号昵称 -->
      <div class="text-gray-700 font-bold">{{ props.account?.name }}</div>
      <!-- 人类消息 -->
      <div class="bg-blue-100 border border-blue-200 text-gray-700 px-4 py-3 rounded-2xl break-all">
        <a-image v-for="(image_url, idx) in props.image_urls" :key="idx" :src="String(image_url)" />
        <div
          class="!bg-gray-100 markdown-body border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl break-all"
          v-html="compiledMarkdown"
        ></div>
      </div>
    </div>
  </div>
  <div v-else>
    <div
      v-if="props.image_urls.length > 0"
      class="bg-blue-100 border border-blue-200 text-gray-700 px-4 py-3 rounded-2xl break-all ml-auto"
    >
      <template v-for="(image_url, idx) in props.image_urls" :key="idx">
        <a-image v-if="isImage(String(image_url))" :src="String(image_url)" />
        <a-space direction="horizontal" v-else-if="isFile(String(image_url))">
          <a
            :href="String(image_url)"
            target="_blank"
            rel="noopener noreferrer"
            class="custom-spacing"
          >
            <a-avatar :size="64" shape="square">
              <icon-csv v-if="String(image_url).endsWith('csv')" />
              <icon-doc
                v-else-if="String(image_url).endsWith('doc') || String(image_url).endsWith('docx')"
              />
              <icon-html
                v-else-if="String(image_url).endsWith('htm') || String(image_url).endsWith('html')"
              />
              <icon-md
                v-else-if="
                  String(image_url).endsWith('md') || String(image_url).endsWith('markdown')
                "
              />
              <icon-pdf v-else-if="String(image_url).endsWith('pdf')" />
              <icon-ppt
                v-else-if="String(image_url).endsWith('ppt') || String(image_url).endsWith('pptx')"
              />
              <icon-properties v-else-if="String(image_url).endsWith('properties')" />
              <icon-txt v-else-if="String(image_url).endsWith('txt')" />
              <icon-xls
                v-else-if="String(image_url).endsWith('xls') || String(image_url).endsWith('xlsx')"
              />
              <icon-xml v-else-if="String(image_url).endsWith('xml')" />
              <icon-yaml
                v-else-if="String(image_url).endsWith('yaml') || String(image_url).endsWith('yml')"
              />
              <icon-file v-else />
            </a-avatar>
          </a>
        </a-space>
      </template>
    </div>
    <div
      class="!bg-blue-100 markdown-body border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl break-all"
      v-html="compiledMarkdown"
    ></div>
  </div>
</template>

<style scoped>
.custom-spacing {
  margin-right: 12px !important; /* 匹配 <a-space> 的间距值 */
  transition: opacity 0.3s;
}
.custom-spacing:hover {
  opacity: 0.8;
}
</style>
