<script setup lang="ts">
import { useUpdateDebugConversationSummary, useGetDebugConversationSummary } from '@/hooks/use-app'
import { ref } from 'vue'

const props = defineProps({
  app_id: { type: String, required: true },
  long_term_memory: { type: Object, required: true },
})

const { debug_conversation_summary, loadDebugConversationSummary } =
  useGetDebugConversationSummary()
const { loading, handleUpdateDebugConversationSummary } = useUpdateDebugConversationSummary()

const summaryModelVisible = ref(false)
const openSummaryModal = async () => {
  await loadDebugConversationSummary(props.app_id)
  summaryModelVisible.value = true
}
</script>

<template>
  <div>
    <!-- 预览与调试头组件 -->
    <div class="flex items-center justify-between border-b h-[64px] px-4">
      <div class="text-lg text-gray-700">预览与调试</div>
      <a-button
        :disabled="!props.long_term_memory?.enable"
        size="mini"
        type="text"
        class="rounded-lg px-1 !text-blue-700"
        @click="openSummaryModal"
      >
        <template #icon>
          <icon-save />
        </template>
        长期记忆
      </a-button>
    </div>
    <!-- 长期记忆模态窗 -->
    <a-modal
      :width="520"
      v-model:visible="summaryModelVisible"
      hide-title
      :footer="false"
      modal-class="rounded-xl"
    >
      <!-- 顶部标题 -->
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold text-gray-700">长期记忆</div>
        <a-button
          type="text"
          class="!text-gray-700"
          size="small"
          @click="summaryModelVisible = false"
        >
          <template #icon>
            <icon-close />
          </template>
        </a-button>
      </div>
      <!-- 底部表单 -->
      <div class="pt-6">
        <a-textarea
          v-model:model-value="debug_conversation_summary"
          placeholder="请输入当前调试会话长期记忆"
          show-word-limit
          max-length="2000"
          :auto-size="{ minRows: 8, maxRows: 8 }"
        />
        <!-- 底部按钮 -->
        <div class="flex items-center justify-between">
          <div class=""></div>
          <a-space :size="16">
            <a-button class="rounded-lg" @click="summaryModelVisible = false">取消</a-button>
            <a-button
              :loading="loading"
              type="primary"
              class="rounded-lg"
              @click="
                async () => {
                  await handleUpdateDebugConversationSummary(app_id, debug_conversation_summary)
                  summaryModelVisible = false
                }
              "
            >
              保存
            </a-button>
          </a-space>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<style scoped></style>
