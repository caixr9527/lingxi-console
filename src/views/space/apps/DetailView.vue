<script setup lang="ts">
import PresetPromptTextarea from './components/PresetPromptTextArea.vue'
import { useRoute } from 'vue-router'
import { useGetDraftAppConfig, useUpdateDraftAppConfig } from '@/hooks/use-app'
import PreViewDebugHeader from './components/PreViewDebugHeader.vue'
import AgentAppAbility from './components/AgentAppAbility.vue'
import PreviewDebugChat from './components/PreviewDebugChat.vue'
const route = useRoute()
const props = defineProps({
  app: { type: Object, default: {}, required: true },
})
const { draftAppConfigForm, loadDraftAppConfig } = useGetDraftAppConfig(
  String(route.params?.app_id),
)
const { handleUpdateDraftAppConfig } = useUpdateDraftAppConfig()
</script>
<template>
  <div class="flex-1 w-full min-h-0 bg-white">
    <div class="flex-1 grid grid-cols-[26fr_14fr] h-full w-full">
      <!-- 左侧应用编排 -->
      <div class="bg-gray-50 flex flex-col h-full">
        <!-- 顶部标题 -->
        <div class="flex items-center h-16 border-b p-4">
          <div class="text-lg text-gray-700">应用编排</div>
          <!-- LLM模型配置 -->
        </div>
        <!-- 底部编排区域 -->
        <div class="grid grid-cols-[13fr_13fr] overflow-hidden h-[calc(100vh-141px)]">
          <!-- 左侧人设与回复逻辑 -->
          <div class="border-r py-4">
            <preset-prompt-textarea
              v-model:preset_prompt="draftAppConfigForm.preset_prompt"
              :app_id="String(route.params?.app_id)"
            />
          </div>
          <!-- 右侧应用能力 -->
          <agent-app-ability
            :draft_app_config="draftAppConfigForm"
            :app_id="String(route.params?.app_id)"
          />
        </div>
      </div>
      <!-- 右侧调试与会话 -->
      <div class="min-w-[404px]">
        <!-- 头部信息 -->
        <pre-view-debug-header
          :app_id="String(route.params?.app_id)"
          :long_term_memory="draftAppConfigForm.long_term_memory"
        />
        <!-- 对话窗口 -->
        <preview-debug-chat
          :opening_questions="draftAppConfigForm.opening_questions"
          :app="props.app"
          :opening_statement="draftAppConfigForm.opening_statement"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
