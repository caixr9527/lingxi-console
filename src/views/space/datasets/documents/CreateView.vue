<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { type Form, Message } from '@arco-design/web-vue'
import { useCreateDocuments, useGetDocumentsStatus } from '@/hooks/use-dataset'
import { useUploadFile } from '@/hooks/use-upload-file'
import { unescapeString } from '@/utils/helper'
import type { CreateDocumentsRequest } from '@/models/dataset'

let timer: any = 0
let batch = ''
let fetchCount = 0
const route = useRoute()
const {
  loading: createDocumentsLoading,
  create_documents_result,
  handleCreateDocuments,
} = useCreateDocuments()
const { upload_file, handleUploadFile } = useUploadFile()
const { documents_status_result, loadDocumentsStatus } = useGetDocumentsStatus()
const currentStep = ref(1)
const createDocumentsForm = ref<Record<string, any>>({
  file_list: [],
  process_type: 'automatic',
  rule: {
    separators: ['\\n'],
    chunk_size: 500,
    chunk_overlap: 50,
    pre_process_rules: [],
  },
})
const customRuleFormRef = ref<InstanceType<typeof Form>>()
const documents = ref<Array<any>>([])

const nextStep = async () => {
  if (currentStep.value === 1) {
    if (createDocumentsForm.value.file_list.length === 0) {
      Message.error('请上传需要添加到知识库的文件')
      return
    }

    const isUploaded = createDocumentsForm.value.file_list.every(
      (fileItem: any) => fileItem.response?.id,
    )
    if (!isUploaded) {
      Message.warning('文件正在上传中，请稍等')
      return
    }

    currentStep.value++
  } else {
    if (createDocumentsForm.value.process_type === 'custom') {
      const errors = await customRuleFormRef.value?.validate()
      if (errors) return
    }

    try {
      const req: Record<string, any> = {
        upload_file_ids: createDocumentsForm.value.file_list.map(
          (fileItem: any) => fileItem?.response?.id,
        ),
        process_type: createDocumentsForm.value.process_type,
      }

      if (createDocumentsForm.value.process_type === 'custom') {
        req.rule = {
          pre_process_rules: [
            {
              id: 'remove_extra_space',
              enabled:
                createDocumentsForm.value.rule.pre_process_rules.includes('remove_extra_space'),
            },
            {
              id: 'remove_url_and_email',
              enabled:
                createDocumentsForm.value.rule.pre_process_rules.includes('remove_url_and_email'),
            },
          ],
          segment: {
            separators: createDocumentsForm.value.rule.separators.map((separator: any) =>
              unescapeString(separator),
            ),
            chunk_size: createDocumentsForm.value.rule.chunk_size,
            chunk_overlap: createDocumentsForm.value.rule.chunk_overlap,
          },
        }
      }

      await handleCreateDocuments(String(route.params?.dataset_id), req as CreateDocumentsRequest)
      batch = create_documents_result.value.batch

      await fetchDocumentsStatus()
      startTimer()

      currentStep.value++
    } finally {
      createDocumentsLoading.value = false
    }
  }
}

const fetchDocumentsStatus = async () => {
  fetchCount++
  await loadDocumentsStatus(String(route.params?.dataset_id), batch)

  documents.value = documents_status_result.value

  if (fetchCount >= 30) stopTimer()

  const isCompleted = documents_status_result.value.every(
    (document) => document.status === 'completed' || document.status === 'error',
  )
  if (isCompleted) stopTimer()
}

const startTimer = () => (timer = setInterval(fetchDocumentsStatus, 5000))

const stopTimer = () => {
  if (timer) {
    clearInterval(timer)
    timer = 0
  }
}

onUnmounted(() => stopTimer())
</script>

<template>
  <div class="p-6">
    <!-- 回退按钮与标题 -->
    <div class="flex items-center mb-6 gap-4">
      <!-- 左侧回退按钮 -->
      <router-link
        :to="{
          name: 'space-datasets-documents-list',
          params: { dataset_id: route.params?.dataset_id as string },
        }"
      >
        <a-button size="mini" type="text" class="!text-gray-700">
          <template #icon>
            <icon-left />
          </template>
        </a-button>
      </router-link>
      <div class="text-lg font-bold text-gray-700">添加文件</div>
    </div>
    <!-- 步骤条 -->
    <div class="w-[520px] mx-auto">
      <a-steps :current="currentStep">
        <a-step>上传</a-step>
        <a-step>分段设置</a-step>
        <a-step>数据处理</a-step>
      </a-steps>
    </div>
    <!-- 步骤条页面 -->
    <div class="min-h-[calc(100vh-160px)] p-[48px]">
      <!-- 上传页面 -->
      <div v-if="currentStep === 1" class="">
        <!-- 上传文件按钮 -->
        <a-upload
          v-model:file-list="createDocumentsForm.file_list"
          draggable
          accept=".doc,.docx,.pdf,.txt,.md,.markdown"
          :limit="10"
          multiple
          tip="支持PDF、TXT、DOC、DOCX、MD，最多可上传10个文件，每个文件的大小不超过10MB"
          :custom-request="
            (option) => {
              const { fileItem, onSuccess, onError } = option

              const uploadTask = async () => {
                try {
                  await handleUploadFile(fileItem.file as File)
                  onSuccess(upload_file)
                } catch (error) {
                  onError(error)
                }
              }

              uploadTask()

              return { abort: () => {} }
            }
          "
        />
      </div>
      <!-- 分段设置页面 -->
      <div v-else-if="currentStep === 2" class="">
        <!-- 自动分段与清洗 -->
        <div
          :class="`px-5 py-4 bg-white rounded-lg border cursor-pointer mb-4 hover:border-blue-700 ${createDocumentsForm.process_type === 'automatic' ? 'border-blue-700' : ''}`"
          @click="createDocumentsForm.process_type = 'automatic'"
        >
          <div class="font-bold text-gray-700 mb-2">自动分段与清洗</div>
          <div class="text-gray-500">自动分段与预处理规则</div>
        </div>
        <!-- 自定义 -->
        <div
          :class="`px-5 py-4 bg-white rounded-lg border cursor-pointer hover:border-blue-700 ${createDocumentsForm.process_type === 'custom' ? 'border-blue-700' : ''}`"
          @click="createDocumentsForm.process_type = 'custom'"
        >
          <div class="font-bold text-gray-700 mb-2">自定义</div>
          <div class="text-gray-500">自定义分段规则、分段长度与预处理规则</div>
          <!-- 自定义表单 -->
          <div v-if="createDocumentsForm.process_type === 'custom'" class="">
            <a-divider />
            <!-- 表单选项 -->
            <a-form :model="createDocumentsForm.rule" ref="customRuleFormRef" layout="vertical">
              <a-form-item
                field="separators"
                label="分段标识符"
                required
                asterisk-position="end"
                :rules="[{ required: true, message: '分段标识符不能为空' }]"
              >
                <a-input-tag
                  v-model:model-value="createDocumentsForm.rule.separators"
                  placeholder="请输入分段标识符，按下Enter结束"
                />
              </a-form-item>
              <a-form-item
                field="chunk_size"
                label="分段最大长度"
                required
                asterisk-position="end"
                :rules="[{ required: true, message: '分段最大长度不能为空' }]"
              >
                <a-input-number
                  v-model:model-value="createDocumentsForm.rule.chunk_size"
                  :min="100"
                  :max="1000"
                  :step="1"
                  :default-value="500"
                  placeholder="请输入100-1000的数字"
                />
              </a-form-item>
              <a-form-item
                field="chunk_overlap"
                label="块重叠数"
                required
                asterisk-position="end"
                :rules="[{ required: true, message: '块重叠大小不能为空' }]"
              >
                <a-input-number
                  v-model:model-value="createDocumentsForm.rule.chunk_overlap"
                  :min="0"
                  :max="500"
                  :step="1"
                  :default-value="50"
                  placeholder="请输入0-500的数字"
                />
              </a-form-item>
              <a-form-item field="pre_process_rules" label="文本预处理规则">
                <a-checkbox-group
                  v-model:model-value="createDocumentsForm.rule.pre_process_rules"
                  direction="vertical"
                >
                  <a-checkbox value="remove_extra_space">
                    替换掉连续的空格、换行符和制表符
                  </a-checkbox>
                  <a-checkbox value="remove_url_and_email">删除所有 URL 和电子邮件</a-checkbox>
                </a-checkbox-group>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
      <!-- 数据处理页面 -->
      <div v-else class="">
        <!-- 数据处理状态提示 -->
        <div class="text-gray-900 mb-4 text-base">服务器正在处理中</div>
        <!-- 处理中的文档列表 -->
        <div class="flex flex-col gap-2">
          <div
            v-for="document in documents"
            :key="document.id"
            class="flex items-center justify-between px-4 py-3 bg-white rounded-lg border"
          >
            <!-- 左侧文件信息 -->
            <div class="flex items-center gap-2.5">
              <a-avatar shape="square" class="bg-blue-700" :size="32">
                <icon-file />
              </a-avatar>
              <div class="">
                <div class="text-gray-700">{{ document.name }}</div>
                <div class="text-gray-500">{{ (document.size / 1024).toFixed(2) }}kb</div>
              </div>
            </div>
            <!-- 处理的百分比 -->
            <div v-if="document.segment_count === 0" class="text-gray-500">0.00%</div>
            <div v-else-if="document.status === 'error'" class="">处理出错</div>
            <div v-else-if="document.status === 'completed'" class="">处理完成</div>
            <div v-else class="text-gray-500">
              {{ ((document.completed_segment_count / document.segment_count) * 100).toFixed(2) }}%
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 按钮：涵盖上一步和下一步 -->
    <div class="flex items-center justify-between px-[48px]">
      <div class=""></div>
      <div class="flex items-center gap-2">
        <a-button
          v-if="currentStep === 2"
          class="rounded-lg"
          @click="
            () => {
              if (currentStep > 1) currentStep--
            }
          "
        >
          上一步
        </a-button>
        <a-button
          :loading="createDocumentsLoading"
          v-if="currentStep <= 2"
          type="primary"
          class="rounded-lg"
          @click="nextStep"
        >
          下一步
        </a-button>
        <!-- 数据处理页面显示的内容 -->
        <div v-if="currentStep === 3" class="flex items-center gap-2">
          <div class="text-gray-500">点击确认不影响数据处理，处理完毕后可进行引用</div>
          <router-link
            :to="{
              name: 'space-datasets-documents-list',
              params: { dataset_id: route.params?.dataset_id as string },
            }"
          >
            <a-button type="primary" class="rounded-lg">确定</a-button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
