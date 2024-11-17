<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { type Form, Message, type ValidatedError } from '@arco-design/web-vue'
import { getDocument, updateDocumentName } from '@/services/dataset'

// 1.定义组件所需要使用的数据
const props = defineProps({
  visible: { type: Boolean, required: true },
  dataset_id: { type: String, required: true },
  document_id: { type: String, required: true },
  onAfterUpdate: {
    type: Function,
    required: false,
    default: () => {},
  },
})
const emits = defineEmits(['update:visible'])
const loading = ref(false)
const form = reactive({ name: '' })
const formRef = ref<InstanceType<typeof Form>>()

// 2.定义关闭模态窗函数，执行关闭模态窗并重置表单操作
const hideModal = () => {
  emits('update:visible', false)
  formRef.value?.resetFields()
}

// 3.定义表单提交函数
const handleSubmit = async ({ errors }: { errors: Record<string, ValidatedError> | undefined }) => {
  // 3.1 判断数据校验是否成功
  if (errors) return

  // 3.2 调用api接口发起请求
  try {
    // 3.3 将loading设置为true并调用接口
    loading.value = true
    const resp = await updateDocumentName(props.dataset_id, props.document_id, form.name)
    Message.success(resp.message)

    // 3.4 隐藏模态窗并重置表单
    hideModal()

    // 3.5 调用完成后的回调函数
    props.onAfterUpdate()
  } finally {
    loading.value = false
  }
}

// 4.监听visible，当模态窗开启的时候，我们需要调用接口获取数据并填充到表单中
watch(
  () => props.visible,
  async (newValue: boolean) => {
    if (newValue) {
      const resp = await getDocument(props.dataset_id, props.document_id)
      const data = resp.data

      formRef.value?.resetFields()
      form.name = data.name
    }
  },
)
</script>

<template>
  <a-modal
    :width="520"
    :visible="visible"
    hide-title
    :footer="false"
    modal-class="rounded-xl"
    @cancel="hideModal"
  >
    <!-- 顶部标题 -->
    <div class="flex items-center justify-between">
      <div class="text-lg font-bold text-gray-700">重命名</div>
      <a-button type="text" class="!text-gray-700" size="small" @click="hideModal">
        <template #icon>
          <icon-close />
        </template>
      </a-button>
    </div>
    <!-- 中间表单 -->
    <div class="pt-6">
      <a-form ref="formRef" :model="form" @submit="handleSubmit" layout="vertical">
        <a-form-item
          field="name"
          label="名称"
          asterisk-position="end"
          :rules="[{ required: true, message: '文档名称不能为空' }]"
        >
          <a-input
            v-model="form.name"
            placeholder="请输入文档名称"
            show-word-limit
            :max-length="100"
          />
        </a-form-item>
        <!-- 底部按钮 -->
        <div class="flex items-center justify-between">
          <div class=""></div>
          <a-space :size="16">
            <a-button class="rounded-lg" @click="hideModal">取消</a-button>
            <a-button :loading="loading" type="primary" html-type="submit" class="rounded-lg">
              保存
            </a-button>
          </a-space>
        </div>
      </a-form>
    </div>
  </a-modal>
</template>

<style scoped></style>
