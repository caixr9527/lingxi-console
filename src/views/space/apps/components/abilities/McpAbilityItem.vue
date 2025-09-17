<script setup lang="ts">
import { computed, onMounted, type PropType, ref } from 'vue'
import { type GetDraftAppConfigResponse } from '@/models/app'
import { useUpdateDraftAppConfig } from '@/hooks/use-app'
import { useGetApiTool, useGetApiToolProvidersWithPage } from '@/hooks/use-tool'
import { useGetBuiltinTool, useGetBuiltinTools, useGetCategories } from '@/hooks/use-builtin-tool'
import { apiPrefix, typeMap } from '@/config'
import { Message } from '@arco-design/web-vue'
import IconMcp from '@/components/icons/IconMCP.vue'

const { handleUpdateDraftAppConfig } = useUpdateDraftAppConfig()
const props = defineProps({
  app_id: { type: String, default: '', required: true },
  mcp_server: { type: String, default: '', required: true },
})
const emits = defineEmits(['update:mcp_server'])

const mcpServerModalVisible = ref(false)
const defaultMcpServer = `{"mcpServers": {}}`

const mcpServers = computed(() => {
  try {
    const data = JSON.parse(props.mcp_server)
    return Object.keys(data.mcpServers)
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
  <a-modal :visible="mcpServerModalVisible" title="MCP配置" @cancel="mcpServerModalVisible = false">
    <template #footer>
      <a-button
        type="secondary"
        @click="
          () => {
            try {
              emits('update:mcp_server', JSON.stringify(JSON.parse(props.mcp_server), null, '\t'))
            } catch {
              Message.error('格式错误')
            }
          }
        "
      >
        格式化
      </a-button>
      <a-button
        type="primary"
        @click="
          () => {
            try {
              JSON.parse(props.mcp_server)
              handleSubmit()
              mcpServerModalVisible = false
            } catch {
              Message.error('格式错误')
            }
          }
        "
      >
        保存
      </a-button>
    </template>
    <a-textarea
      :auto-size="{ minRows: 20, maxRows: 20 }"
      :model-value="props.mcp_server || defaultMcpServer"
      @update:model-value="
        (value: any) => {
          emits('update:mcp_server', value)
        }
      "
    />
  </a-modal>
</template>

<style></style>
