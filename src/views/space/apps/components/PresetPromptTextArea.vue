<script setup lang="ts">
import { useUpdateDraftAppConfig } from '@/hooks/use-app'

// 1.定义自定义组件所需数据
const props = defineProps({
  app_id: { type: String, required: true },
  preset_prompt: { type: String, default: '', required: true },
})
const emits = defineEmits(['update:preset_prompt'])

const { handleUpdateDraftAppConfig } = useUpdateDraftAppConfig()
</script>
<template>
  <div class="flex flex-col h-[calc(100vh-173px)]">
    <!-- 提示标题 -->
    <div class="flex items-center justify-between px-4 mb-4">
      <div class="text-gray-700 font-bold">人设与回复逻辑</div>
      <a-button size="mini" class="rounded-lg px-2">
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
        placeholder="请在这里输入Agent的人设与回复逻辑(预设prompt)"
        :max-length="2000"
        show-word-limit
        :model-value="props.preset_prompt"
        @update:model-value="(value) => emits('update:preset_prompt', value)"
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
<style scoped></style>
