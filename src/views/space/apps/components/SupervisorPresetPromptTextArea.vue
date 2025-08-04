<script setup lang="ts">
import { useGeneratePrompt } from '@/hooks/use-ai'
import { useUpdateDraftAppConfig } from '@/hooks/use-app'

const props = defineProps({
  app_id: { type: String, required: true },
  preset_prompt: { type: String, default: '', required: true },
})
const emits = defineEmits(['update:preset_prompt', 'update-status'])
const { handleUpdateDraftAppConfig } = useUpdateDraftAppConfig()
const { loading, prompt, handleGeneratePrompt } = useGeneratePrompt()
</script>
<template>
  <div class="flex flex-col h-[calc(100vh-173px)]">
    <!-- 提示标题 -->
    <div class="flex items-center justify-between px-4 mb-4">
      <div class="text-gray-700 font-bold">Supervisor人设与回复逻辑</div>
      <a-button
        :loading="loading"
        size="mini"
        class="rounded-lg px-2"
        @click="
          async () => {
            await handleGeneratePrompt(props.app_id)
            emits('update:preset_prompt', prompt)
            emits('update-status', 'republish')
            await handleUpdateDraftAppConfig(props.app_id, {
              preset_prompt: prompt,
            })
          }
        "
      >
        <template #icon>
          <icon-sync />
        </template>
        自动生成
      </a-button>
    </div>
    <!-- 输入框容器 -->
    <div class="flex-1 ml-2">
      <a-textarea
        :disabled="loading"
        class="h-full resize-none !bg-transparent !border-0 text-gray-700 px-1 preset-prompt-textarea"
        :max-length="2000"
        :model-value="props.preset_prompt"
        @update:model-value="
          (value: any) => {
            emits('update:preset_prompt', value)
            emits('update-status', 'republish')
          }
        "
        placeholder="点击自动生成人设prompt"
        show-word-limit
        @blur="
          async () => {
            await handleUpdateDraftAppConfig(props.app_id, {
              preset_prompt: props.preset_prompt,
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
