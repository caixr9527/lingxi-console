<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { type Form, type ValidatedError } from '@arco-design/web-vue'
import { useCreateSegment, useGetSegment, useUpdateSegment } from '@/hooks/use-dataset'
import type { CreateSegmentRequest, UpdateSegmentRequest } from '@/models/dataset'

const props = defineProps({
  dataset_id: { type: String, required: false },
  document_id: { type: String, required: false },
  segment_id: { type: String, required: false },
  visible: { type: Boolean, required: true },
  callback: { type: Function, required: false },
})
const emits = defineEmits(['update:visible'])
const { loading: createSegmentLoading, handleCreateSegment } = useCreateSegment()
const { loading: updateSegmentLoading, handleUpdateSegment } = useUpdateSegment()
const { segment, loadSegment } = useGetSegment()
const defaultForm: { content: string; keywords: string[] } = {
  content: '',
  keywords: [],
}
const form = ref(defaultForm)
const formRef = ref<InstanceType<typeof Form>>()
const isUpdateOperation = computed(() => props.segment_id && props.segment_id !== '')

const hideModal = () => emits('update:visible', false)

const saveSegment = async ({ errors }: { errors: Record<string, ValidatedError> | undefined }) => {
  if (errors) return

  if (isUpdateOperation.value) {
    await handleUpdateSegment(
      props.dataset_id as string,
      props.document_id as string,
      props.segment_id as string,
      form.value as UpdateSegmentRequest,
    )
  } else {
    await handleCreateSegment(
      props.dataset_id as string,
      props.document_id as string,
      form.value as CreateSegmentRequest,
    )
  }

  emits('update:visible', false)
  props.callback && props.callback()
}

watch(
  () => props.visible,
  async (newValue) => {
    formRef.value?.resetFields()

    if (newValue) {
      if (isUpdateOperation.value) {
        await loadSegment(
          props.dataset_id as string,
          props.document_id as string,
          props.segment_id as string,
        )

        form.value.content = segment.value.content
        form.value.keywords = segment.value.keywords
      }
    } else {
      formRef.value?.resetFields()
      form.value = defaultForm
    }
  },
)
</script>

<template>
  <a-modal
    :width="520"
    :visible="props.visible"
    hide-title
    :footer="false"
    modal-class="rounded-xl"
    @cancel="hideModal"
  >
    <!-- 顶部标题 -->
    <div class="flex items-center justify-between">
      <div class="text-lg font-bold text-gray-700">
        {{ isUpdateOperation ? '更新' : '添加' }}片段
      </div>
      <a-button type="text" class="!text-gray-700" size="small" @click="hideModal">
        <template #icon>
          <icon-close />
        </template>
      </a-button>
    </div>
    <!-- 中间表单 -->
    <div class="pt-6">
      <a-form ref="formRef" :model="form" layout="vertical" @submit="saveSegment">
        <a-form-item
          field="content"
          label="片段内容"
          asterisk-position="end"
          :rules="[{ required: true, message: '片段内容不能为空' }]"
        >
          <a-textarea
            v-model:model-value="form.content"
            :auto-size="{ minRows: 8, maxRows: 8 }"
            placeholder="在这里添加文档片段内容"
          />
        </a-form-item>
        <a-form-item field="keywords" label="关键词">
          <a-input-tag
            v-model:model-value="form.keywords"
            :max-tag-count="10"
            placeholder="请输入该文档片段关键词，最多不超过10个，按Enter输入"
          />
        </a-form-item>
        <!-- 底部按钮 -->
        <div class="flex items-center justify-between">
          <div class=""></div>
          <a-space :size="16">
            <a-button class="rounded-lg" @click="hideModal">取消</a-button>
            <a-button
              :loading="updateSegmentLoading || createSegmentLoading"
              type="primary"
              html-type="submit"
              class="rounded-lg"
            >
              保存
            </a-button>
          </a-space>
        </div>
      </a-form>
    </div>
  </a-modal>
</template>

<style scoped></style>
