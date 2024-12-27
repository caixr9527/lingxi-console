<script setup lang="ts">
import { type PropType } from 'vue'
import DotFlashing from '@/components/DotFlashing.vue'
import AgentThought from './AgentThought.vue'

// 1.定义自定义组件所需数据
const props = defineProps({
  app: { type: Object, default: {}, required: true },
  answer: { type: String, default: '', required: true },
  loading: { type: Boolean, default: false, required: false },
  agent_thoughts: { type: Array as PropType<Record<string, any>[]>, default: [], required: true },
  suggested_questions: { type: Array as PropType<string[]>, default: [], required: false },
})
const emits = defineEmits(['selectSuggestedQuestion'])
</script>

<template>
  <div class="flex gap-2">
    <!-- 左侧图标 -->
    <a-avatar :size="30" shape="circle" class="flex-shrink-0" :image-url="props.app?.icon" />
    <!-- 右侧名称与消息 -->
    <div class="flex flex-col items-start gap-2">
      <!-- 应用名称 -->
      <div class="text-gray-700 font-bold">{{ props.app?.name }}</div>
      <!-- 推理步骤 -->
      <agent-thought :agent_thoughts="props.agent_thoughts" :loading="props.loading" />
      <!-- AI消息 -->
      <div class="bg-gray-100 border border-gray-200 text-gray-700 px-4 py-3 rounded-2xl break-all">
        <template v-if="props.loading && props.answer.trim() === ''">
          <dot-flashing />
        </template>
        <template v-else>
          {{ props.answer }}
        </template>
      </div>
      <!-- 建议问题列表 -->
      <div v-if="props.suggested_questions.length > 0" class="flex flex-col gap-2">
        <div
          v-for="(suggested_question, idx) in props.suggested_questions"
          :key="idx"
          class="px-4 py-1.5 border rounded-lg text-gray-700 cursor-pointer hover:bg-gray-50"
          @click="() => emits('selectSuggestedQuestion', suggested_question)"
        >
          {{ suggested_question }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
