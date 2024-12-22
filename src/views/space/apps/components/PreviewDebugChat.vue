<script setup lang="ts">
import type { PropType } from 'vue'

const props = defineProps({
  app: { type: Object, default: {}, required: true },
  opening_statement: { type: String, default: '', required: true },
  opening_questions: { type: Array as PropType<string[]>, default: [], required: true },
})
</script>

<template>
  <!-- 历史对话列表 -->
  <!-- 对话列表为空时展示的对话开场白 -->
  <div class="flex flex-col p-6 gap-2 items-center justify-center h-[calc(100vh-238px)]">
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
      <a-button class="flex-shrink-0 !text-gray-700" type="text" shape="circle">
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
