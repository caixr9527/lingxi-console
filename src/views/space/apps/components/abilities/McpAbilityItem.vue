<script setup lang="ts">
import { computed, type PropType, ref } from 'vue'
import { useUpdateDraftAppConfig } from '@/hooks/use-app'

import IconMcp from '@/components/icons/IconMCP.vue'
import JsonEditorVue from '@/components/JsonEditor.vue'
const { handleUpdateDraftAppConfig } = useUpdateDraftAppConfig()
const props = defineProps({
  app_id: { type: String, default: '', required: true },
  mcp_server: {
    type: Object as PropType<{ mcpServers: {} }>,
    default: () => {
      return { mcpServers: {} }
    },
    required: true,
  },
})
const emits = defineEmits(['update:mcp_server'])

const mcpServerModalVisible = ref(false)
const saveBtDisable = ref(false)
const defaultMcpServer = { mcpServers: {} }

const mcpServers = computed(() => {
  try {
    return Object.keys(props.mcp_server.mcpServers)
  } catch {
    /* empty */
  }
  return []
})

const handleSubmit = async () => {
  await handleUpdateDraftAppConfig(props.app_id, {
    mcp_server: props.mcp_server,
  })
}

const computedMcpServer = computed(() => {
  return props.mcp_server
})
</script>

<template>
  <div class="">
    <!-- 折叠面板 -->
    <a-collapse-item key="tools" class="app-ability-item">
      <template #header>
        <div class="text-gray-700 font-bold">MCP服务</div>
      </template>
      <template #extra>
        <a-button
          size="mini"
          type="text"
          class="!text-gray-700"
          @click.stop="mcpServerModalVisible = true"
        >
          <template #icon>
            <icon-plus />
          </template>
        </a-button>
      </template>
      <div v-if="mcpServers.length > 0" class="flex flex-col gap-1">
        <div
          v-for="(name, idx) in mcpServers"
          :key="idx"
          class="flex items-center justify-between bg-white p-3 rounded-lg cursor-pointer hover:shadow-sm group"
        >
          <!-- 左侧工具信息 -->
          <div class="flex items-center gap-2">
            <!-- 图标 -->
            <icon-mcp class="w-[36px] h-[36px]" />
            <!-- 名称与描述信息 -->
            <div class="flex gap-1">
              <div class="text-gray-700 font-bold leading-[18px] line-clamp-1 break-all">
                {{ name }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-xs text-gray-500 leading-[22px]">快速接入MCP服务</div>
    </a-collapse-item>
  </div>
  <a-modal
    :visible="mcpServerModalVisible"
    :modal-style="{ width: '800px' }"
    title="MCP配置"
    @cancel="mcpServerModalVisible = false"
  >
    <template #footer>
      <a-button
        :disabled="saveBtDisable"
        type="primary"
        @click="
          () => {
            handleSubmit()
            mcpServerModalVisible = false
          }
        "
      >
        保存
      </a-button>
    </template>
    <json-editor-vue
      class="editor"
      v-model="computedMcpServer"
      current-mode="code"
      mode="code"
      :options="{ mainMenuBar: false, navigationBar: false }"
      language="zh-CN"
      @validationError="
        (editor: any, errors: any[]) => {
          if (errors.length > 0) {
            saveBtDisable = true
          } else {
            saveBtDisable = false
          }
        }
      "
      @update:modelValue="
        (value: any) => {
          if (value) {
            emits('update:mcp_server', value)
          } else {
            emits('update:mcp_server', defaultMcpServer)
          }
        }
      "
    />
  </a-modal>
</template>

<style></style>
