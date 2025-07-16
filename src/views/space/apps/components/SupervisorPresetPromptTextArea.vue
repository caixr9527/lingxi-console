<script setup lang="ts">
import { useOptimizePrompt } from '@/hooks/use-ai'
import { useUpdateDraftAppConfig } from '@/hooks/use-app'
import { Message } from '@arco-design/web-vue'
import { computed, ref } from 'vue'

const props = defineProps({
  app_id: { type: String, required: true },
  preset_prompt: { type: String, default: '', required: true },
})
const emits = defineEmits(['update:preset_prompt'])
const { handleUpdateDraftAppConfig } = useUpdateDraftAppConfig()
const agentCount = computed(() => {
  return 0
})
const prompt = computed(() => {
  return `# 角色
你是以下${agentCount.value}个Agent的主管：
- 数学
- 语文
`
})
</script>
<template>
  <div class="flex flex-col h-[calc(100vh-173px)]">
    <!-- 提示标题 -->
    <div class="flex items-center justify-between px-4 mb-4">
      <div class="text-gray-700 font-bold">人设与回复逻辑</div>
      <a-button size="mini" class="rounded-lg px-2" @click="() => {}">
        <template #icon>
          <icon-sync />
        </template>
        优化
      </a-button>
    </div>
    <!-- 输入框容器 -->
    <div class="flex-1">
      <a-textarea
        class="h-full resize-none !bg-transparent !border-0 text-gray-700 px-1 preset-prompt-textarea"
        :max-length="5000"
        :default-value="props.preset_prompt || prompt"
        show-word-limit
        @update:model-value="
          async (value: any) => {
            emits('update:preset_prompt', value)
            await handleUpdateDraftAppConfig(props.app_id, {
              preset_prompt: value,
            })
          }
        "
      />
    </div>
  </div>
</template>
<style>
.preset-prompt-textarea {
  textarea {
    scrollbar-width: none;
  }
}
</style>
