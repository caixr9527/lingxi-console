<script setup lang="ts">
import { ref, watch } from 'vue'
import { type Form, type ValidatedError } from '@arco-design/web-vue'
import { useCreateApp, useGetApp, useUpdateApp } from '@/hooks/use-app'
import { useUploadImage } from '@/hooks/use-upload-file'

const props = defineProps({
  app_id: { type: String, default: '', required: false },
  visible: { type: Boolean, required: true },
  callback: { type: Function, required: false },
})
const emits = defineEmits(['update:visible', 'update:app_id'])
const { loading: createAppLoading, handleCreateApp } = useCreateApp()
const { loading: updateAppLoading, handleUpdateApp } = useUpdateApp()
const { app, loadApp } = useGetApp()
const { image_url, handleUploadImage } = useUploadImage()
const defaultForm = {
  fileList: [] as any,
  icon: '',
  name: '',
  description: '',
}
const form = ref({ ...defaultForm })
const formRef = ref<InstanceType<typeof Form>>()

const hideModal = () => emits('update:visible', false)

const saveApp = async ({ errors }: { errors: Record<string, ValidatedError> | undefined }) => {
  if (errors) return

  if (props.app_id) {
    await handleUpdateApp(props.app_id, form.value)
  } else {
    await handleCreateApp(form.value)
  }

  emits('update:visible', false)
  props.callback && props.callback()
}

watch(
  () => props.visible,
  async (newValue) => {
    formRef.value?.resetFields()

    if (newValue) {
      if (props.app_id) {
        await loadApp(props.app_id)

        form.value = {
          fileList: [{ uid: '1', name: '应用图标', url: app.value.icon }],
          icon: app.value.icon,
          name: app.value.name,
          description: app.value.description,
        }
      }
    } else {
      form.value = defaultForm
      formRef.value?.resetFields()
      emits('update:app_id', '')
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
        {{ props.app_id === '' ? '创建 AI 应用' : '编辑 AI 应用' }}
      </div>
      <a-button type="text" class="!text-gray-700" size="small" @click="hideModal">
        <template #icon>
          <icon-close />
        </template>
      </a-button>
    </div>
    <!-- 中间表单 -->
    <div class="pt-6">
      <a-form ref="formRef" :model="form" layout="vertical" @submit="saveApp">
        <a-form-item
          field="fileList"
          hide-label
          :rules="[{ required: true, message: '应用图标不能为空' }]"
        >
          <a-upload
            :limit="1"
            list-type="picture-card"
            accept="image/png, image/jpeg"
            class="!w-auto mx-auto"
            v-model:file-list="form.fileList"
            image-preview
            :custom-request="
              (option: { fileItem: any; onSuccess: any; onError: any }) => {
                const { fileItem, onSuccess, onError } = option

                const uploadTask = async () => {
                  try {
                    await handleUploadImage(fileItem.file as File)
                    form.icon = image_url
                    onSuccess(image_url)
                  } catch (error) {
                    onError(error)
                  }
                }
                uploadTask()

                return { abort: () => {} }
              }
            "
            :on-before-remove="
              async () => {
                form.icon = ''
                return true
              }
            "
          />
        </a-form-item>
        <a-form-item
          field="name"
          label="应用名称"
          asterisk-position="end"
          :rules="[{ required: true, message: '应用名称不能为空' }]"
        >
          <a-input v-model:model-value="form.name" placeholder="请输入应用名称" />
        </a-form-item>
        <a-form-item field="description" label="应用描述">
          <a-textarea
            v-model:model-value="form.description"
            :auto-size="{ minRows: 8, maxRows: 8 }"
            :max-length="800"
            show-word-limit
            placeholder="请输入关于该应用的描述信息"
          />
        </a-form-item>
        <!-- 底部按钮 -->
        <div class="flex items-center justify-between">
          <div class=""></div>
          <a-space :size="16">
            <a-button class="rounded-lg" @click="hideModal">取消</a-button>
            <a-button
              :loading="createAppLoading || updateAppLoading"
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
