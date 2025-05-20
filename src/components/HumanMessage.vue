<script setup lang="ts">
import { isImage, isFile } from '@/utils/helper'
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
        {{ props.query }}
      </div>
    </div>
  </div>
  <div
    v-else
    class="bg-blue-100 border border-blue-200 text-gray-700 px-4 py-3 rounded-2xl break-all ml-auto"
  >
    <div v-for="(image_url, idx) in props.image_urls" :key="idx">
      <a-image v-if="isImage(String(image_url))" :src="String(image_url)" />
      <a-space v-else-if="isFile(String(image_url))">
        <a :href="String(image_url)" target="_blank" rel="noopener noreferrer">
          <a-avatar :size="64" shape="square">
            <icon-file />
          </a-avatar>
        </a>
      </a-space>
    </div>

    {{ props.query }}
  </div>
</template>

<style scoped></style>
