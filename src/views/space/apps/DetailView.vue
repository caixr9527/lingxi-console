<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useGetDraftAppConfig } from '@/hooks/use-app'
import PresetPromptTextarea from './components/PresetPromptTextArea.vue'
import SupervisorPresetPromptTextarea from './components/SupervisorPresetPromptTextArea.vue'
import PreviewDebugHeader from './components/PreViewDebugHeader.vue'
import AgentAppAbility from './components/AgentAppAbility.vue'
import PreviewDebugChat from './components/PreviewDebugChat.vue'
import ModelConfig from './components/ModelConfig.vue'
import { onMounted, ref, watch } from 'vue'

const route = useRoute()
const props = defineProps({
  app: {
    type: Object,
    default: () => {
      return {}
    },
    required: true,
  },
})
const emits = defineEmits(['update:status'])
const { draftAppConfigForm, loadDraftAppConfig } = useGetDraftAppConfig()
const updateStatus = (value: any) => {
  if (props.app.status === 'published') {
    emits('update:status', value)
  }
}
onMounted(async () => {
  await loadDraftAppConfig(String(route.params?.app_id))
})
</script>
<template>
  <div class="flex-1 w-full min-h-0 bg-white">
    <div class="flex-1 grid grid-cols-[26fr_14fr] h-full w-full">
      <!-- 左侧应用编排 -->
      <div class="bg-gray-50 flex flex-col h-full">
        <!-- 顶部标题 -->
        <div class="flex items-center h-16 border-b p-4 gap-4">
          <div class="text-lg text-gray-700">应用编排</div>
          <!-- LLM模型配置 -->
          <model-config
            :dialog_round="draftAppConfigForm.dialog_round"
            v-model:model_config="draftAppConfigForm.model_config"
            :app_id="String(route.params?.app_id)"
            @update-status="
              (value: any) => {
                updateStatus(value)
              }
            "
          />
        </div>
        <!-- 底部编排区域 -->
        <div class="grid grid-cols-[13fr_13fr] overflow-hidden h-[calc(100vh-141px)]">
          <!-- 左侧人设与回复逻辑 -->
          <div class="border-r py-4">
            <preset-prompt-textarea
              v-if="app.mode === 0"
              v-model:preset_prompt="draftAppConfigForm.preset_prompt"
              :app_id="String(route.params?.app_id)"
              @update-status="
                (value: any) => {
                  updateStatus(value)
                }
              "
            />
            <supervisor-preset-prompt-textarea
              v-else
              v-model:preset_prompt="draftAppConfigForm.preset_prompt"
              @update-status="
                (value: any) => {
                  updateStatus(value)
                }
              "
              :app_id="String(route.params?.app_id)"
            />
          </div>
          <!-- 右侧应用能力 -->
          <agent-app-ability
            v-model:draft_app_config="draftAppConfigForm"
            :mode="app.mode"
            :app_id="String(route.params?.app_id)"
            @update-status="
              (value: any) => {
                updateStatus(value)
              }
            "
          />
        </div>
      </div>
      <!-- 右侧调试与会话 -->
      <div class="min-w-[404px]">
        <!-- 头部信息 -->
        <preview-debug-header
          :app_id="String(route.params?.app_id)"
          :long_term_memory="draftAppConfigForm.long_term_memory"
        />
        <!-- 对话窗口 -->
        <preview-debug-chat :app="props.app" :app_config="draftAppConfigForm" />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
