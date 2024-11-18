<script setup lang="ts">
import { onMounted, reactive, ref, watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  createApiToolProvider,
  deleteApiToolProvider,
  getApiToolProvider,
  getApiToolProvidersWithPage,
  updateApiToolProvider,
  validateOpenAPISchema,
} from '@/services/api-tool'
import moment from 'moment'
import { Message, Modal } from '@arco-design/web-vue'
import { typeMap } from '@/config'
import type { CreateApiToolProviderRequest } from '@/models/api-tool'
import { uploadImage } from '@/services/upload-file'

const route = useRoute()
const props = defineProps({
  createType: {
    type: String,
    required: true,
  },
})
const emits = defineEmits(['update-create-type'])

const providers = reactive<Array<any>>([])
const paginator = reactive({
  current_page: 1,
  page_size: 20,
  total_page: 0,
  total_record: 0,
})
const form = reactive({
  fileList: [],
  icon: '',
  name: '',
  openapi_schema: '',
  headers: [] as { key: string; value: string }[],
})
const formRef = ref()
const loading = ref<boolean>(false)
const showIndex = ref<number>(-1)
const showUpdateModal = ref<boolean>(false)
const showUpdateModalLoading = ref<boolean>(false)
const sumbitLoading = ref<boolean>(false)

const tools = computed(() => {
  try {
    if (form.openapi_schema.trim() === '') return
    const available_tools = []
    const openapi_schema = JSON.parse(form.openapi_schema)
    if ('paths' in openapi_schema) {
      for (const path in openapi_schema['paths']) {
        for (const method in openapi_schema['paths'][path]) {
          if (['get', 'post'].includes(method)) {
            const tool = openapi_schema['paths'][path][method]
            if ('operationId' in tool && 'description' in tool) {
              available_tools.push({
                name: tool?.operationId,
                description: tool?.description,
                method: method,
                path: path,
              })
            }
          }
        }
      }
    }
    return available_tools
  } catch (e) {
    console.log('解析出错')
  }
  return []
})

const loadMoreData = async (init: boolean = false) => {
  if (!init && paginator.current_page > paginator.total_page) return
  try {
    loading.value = true
    const resp = await getApiToolProvidersWithPage(
      paginator.current_page,
      paginator.page_size,
      String(route.query?.search_word ?? ''),
    )
    const data = resp.data
    paginator.current_page = data.paginator.current_page
    paginator.page_size = data.paginator.page_size
    paginator.total_page = data.paginator.total_page
    paginator.total_record = data.paginator.total_record
    if (paginator.current_page <= paginator.total_page) {
      paginator.current_page += 1
    }
    if (init) {
      providers.splice(0, providers.length, ...data.list)
    } else {
      providers.push(...data.list)
    }
  } finally {
    loading.value = false
  }
}

const initData = async () => {
  paginator.current_page = 1
  paginator.page_size = 20
  paginator.total_page = 0
  paginator.total_record = 0
  await loadMoreData(true)
}

const handleScroll = (event: any) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    if (loading.value) {
      return
    }
    loadMoreData()
  }
}

const handleSubmit = async ({ values, errors }: any) => {
  if (errors) return
  try {
    sumbitLoading.value = true

    if (props.createType === 'tool') {
      const resp = await createApiToolProvider(values as CreateApiToolProviderRequest)
      Message.success(resp.message)
    } else if (showUpdateModal.value) {
      const resp = await updateApiToolProvider(
        providers[showIndex.value]['id'],
        values as CreateApiToolProviderRequest,
      )
      Message.success(resp.message)
    }
    handleCancel()
    showIndex.value = -1
  } finally {
    sumbitLoading.value = false
  }
  await initData()
}

const handleDelete = () => {
  Modal.warning({
    title: '是否删除？',
    content: '删除工具是不可逆的，AI应用将无法使用该工具',
    hideCancel: false,
    onOk: async () => {
      try {
        const provider_id = providers[showIndex.value]['id']
        const resp = await deleteApiToolProvider(provider_id)
        Message.success(resp.message)
      } finally {
        handleCancel()
        showIndex.value = -1
        await initData()
      }
    },
  })
}

const handleCancel = () => {
  formRef.value?.resetFields()
  form.fileList = []
  emits('update-create-type', '')
  showUpdateModal.value = false
}

const handleUpdate = async () => {
  try {
    showUpdateModalLoading.value = true

    const provider_id = providers[showIndex.value]['id']
    const resp = await getApiToolProvider(provider_id)
    console.log(resp)
    const data = resp.data

    formRef.value?.resetFields()
    form.fileList = [{ uid: '1', name: '插件图标', url: data.icon }]
    form.icon = data.icon
    form.name = data.name
    form.openapi_schema = data.openapi_schema
    form.headers = data.headers
  } finally {
    showUpdateModalLoading.value = false
  }
  showUpdateModal.value = true
}

onMounted(async () => {
  await initData()
})
watch(
  () => route.query?.search_word,
  async () => {
    await initData()
  },
)
</script>
<template>
  <a-spin
    :loading="loading"
    class="block h-full w-full scrollbar-w-none overflow-scroll"
    @scroll="handleScroll"
  >
    <!-- 底部插件列表 -->
    <a-row :gutter="[20, 20]" class="flex-1">
      <!-- 有数据 -->
      <a-col v-for="(provider, idx) in providers" :key="provider.name" :span="6">
        <a-card hoverable class="cursor-pointer rounded-lg" @click="showIndex = idx">
          <!-- 顶部提供商名称 -->
          <div class="flex items-center gap-3 mb-3">
            <!-- 左侧图标 -->
            <a-avatar :size="40" shape="square" :image-url="provider.icon" />
            <!-- 右侧工具信息 -->
            <div class="flex flex-col">
              <div class="text-base text-gray-900 font-bold">{{ provider.name }}</div>
              <div class="text-xs text-gray-500 line-clamp-1">
                {{ provider.name }} ▪️ {{ provider.tools.length }} 插件
              </div>
            </div>
          </div>
          <!-- 提供商描述信息 -->
          <div class="leading-[18px] text-gray-500 h-[72px] line-clamp-4 mb-2">
            {{ provider.description }}
          </div>
          <!-- 提供商的发布信息 -->
          <div class="flex items-center gap-1.5">
            <a-avatar :size="18" class="bg-blue-700">
              <icon-user />
            </a-avatar>
            <div class="text-xs text-gray-400">
              编辑时间 {{ moment(provider.created_at).format('MM-DD HH:mm') }}
            </div>
          </div>
        </a-card>
      </a-col>
      <!-- 无数据 -->
      <a-col v-if="providers.length === 0" :span="24">
        <a-empty
          description="没有可用的API插件"
          class="h-[400px] flex flex-col items-center justify-center"
        />
      </a-col>
    </a-row>
    <!-- 加载器 -->
    <a-row v-if="paginator.total_page >= 2">
      <!-- 加载数据中 -->
      <a-col v-if="paginator.current_page <= paginator.total_page" :span="24" align="center">
        <a-space class="my-4">
          <a-spin>
            <div class="text-gray-400">加载中</div>
          </a-spin>
        </a-space>
      </a-col>
      <!-- 加载数据完成 -->
      <a-col v-else :span="24" align="center">
        <div class="text-gary-400 my-4">数据已加载完成</div>
      </a-col>
    </a-row>
    <!-- 卡片抽屉 -->
    <a-drawer
      :visible="showIndex != -1"
      :width="350"
      :footer="false"
      title="工具详情"
      :drawer-style="{ background: '#F9FAFB' }"
      @cancel="showIndex = -1"
    >
      <div v-if="showIndex !== -1">
        <!-- 顶部提供商名称 -->
        <div class="flex items-center gap-3 mb-3">
          <!-- 左侧图标 -->
          <a-avatar :size="40" shape="square" :image-url="providers[showIndex].icon" />
          <!-- 右侧工具信息 -->
          <div class="flex flex-col">
            <div class="text-base text-gray-900 font-bold">
              {{ providers[showIndex].name }}
            </div>
            <div class="text-xs text-gray-500 line-clamp-1">
              {{ providers[showIndex].name }} ▪️ {{ providers[showIndex].tools.length }} 插件
            </div>
          </div>
        </div>
        <!-- 提供商描述信息 -->
        <div class="leading-[18px] text-gray-500 mb-2">
          {{ providers[showIndex].description }}
        </div>
        <!-- 编辑 -->
        <a-button
          :loading="showUpdateModalLoading"
          type="dashed"
          long
          class="mb-2 rounded-lg"
          @click="handleUpdate"
        >
          <template #icon>
            <icon-edit />
          </template>
          编辑工具
        </a-button>
        <!-- 分隔符 -->
        <hr class="my-4" />
        <!-- 提供者工具列表 -->
        <div class="flex flex-col gap-2">
          <div class="text-xs text-gray-500">
            包含 {{ providers[showIndex].tools.length }} 个工具
          </div>
          <!-- 工具列表 -->
          <a-card
            v-for="tool in providers[showIndex].tools"
            :key="tool.name"
            class="cursor-pointer flex flex-col rounded-xl"
          >
            <!-- 工具名称 -->
            <div class="font-bold text-gray-900 mb-2">{{ tool.name }}</div>
            <!-- 工具描述 -->
            <div class="text-gray-500 text-xs">{{ tool.description }}</div>
            <!-- 工具参数 -->
            <div v-if="tool.inputs.length > 0" class="">
              <!-- 分隔符 -->
              <div class="flex items-center gap-2 my-4">
                <div class="text-xs font-bold text-gray-500">参数</div>
                <hr class="flex-1" />
              </div>
              <!-- 参数列表 -->
              <div class="flex flex-col gap-4">
                <div v-for="input in tool.inputs" :key="input.name" class="flex flex-col gap-2">
                  <!-- 上半部分 -->
                  <div class="flex items-center gap-2 text-xs">
                    <div class="text-gray-900 font-bold">{{ input.name }}</div>
                    <div class="text-gray-500">{{ input.type }}</div>
                    <div v-if="input.required" class="text-red-700">必填</div>
                  </div>
                  <!-- 下半部分 -->
                  <div class="text-xs text-gary-500">{{ input.description }}</div>
                </div>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </a-drawer>
    <!-- 新建/修改模态框 -->
    <a-modal
      :width="630"
      :visible="props.createType === 'tool' || showUpdateModal"
      hide-title
      :footer="false"
      modal-class="rounded-xl"
      @cancel="handleCancel"
    >
      <!-- 标题 -->
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold text-gray-700">
          {{ props.createType === 'tool' ? '新建' : '更新' }}插件
        </div>
        <a-button type="text" class="!text-gray-700" size="small" @click="handleCancel">
          <template #icon>
            <icon-close />
          </template>
        </a-button>
      </div>
      <!-- 中间表单 -->
      <div class="pt-6">
        <a-form ref="formRef" :model="form" @submit="handleSubmit" layout="vertical">
          <a-form-item
            field="icon"
            hide-label
            :rules="[{ required: true, message: '插件图标不能为空' }]"
          >
            <a-upload
              :limit="1"
              list-type="picture-card"
              accept="image/png, image/jpeg"
              class="!w-auto mx-auto"
              v-model:file-list="form.fileList"
              image-preview
              :custom-request="
                async (option: any) => {
                  const { fileItem, onSuccess, onError } = option
                  const resp = await uploadImage(fileItem.file)
                  form.icon = resp.data.image_url
                  onSuccess(resp)
                }
              "
              :on-before-remove="
                () => {
                  form.icon = ''
                  return true
                }
              "
            />
          </a-form-item>
          <a-form-item
            field="name"
            label="插件名称"
            asterisk-position="end"
            :rules="[{ required: true, message: '插件名称不能为空' }]"
          >
            <a-input
              v-model="form.name"
              placeholder="请输入插件名称"
              show-word-limit
              :max-length="60"
            />
          </a-form-item>
          <a-form-item
            field="openapi_schema"
            label="OpenAPI Schema"
            asterisk-position="end"
            :rules="[{ required: true, message: 'OpenAPI Schema不能为空' }]"
          >
            <a-textarea
              v-model="form.openapi_schema"
              :auto-size="{ minRows: 4, maxRows: 6 }"
              placeholder="请输入OpenAPI Schema"
              @blur="
                async () => {
                  if (form.openapi_schema.trim() != '') {
                    await validateOpenAPISchema(form.openapi_schema)
                  }
                }
              "
            />
          </a-form-item>
          <a-form-item label="可用工具">
            <div class="rounded-lg border border-gray-200 w-full overflow-x-auto">
              <table class="w-full leading-[18px] text-xs text-gray-700 font-normal">
                <thead class="text-gray-500">
                  <tr class="border-b border-gray-200">
                    <th class="p-2 pl-3 font-medium">名称</th>
                    <th class="p-2 pl-3 font-medium w-[236px]">描述</th>
                    <th class="p-2 pl-3 font-medium">方法</th>
                    <th class="p-2 pl-3 font-medium">路径</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(tool, idx) in tools"
                    :key="idx"
                    class="border-b last:border-0 border-gray-200 text-gray-700"
                  >
                    <td class="p-2 pl-3">{{ tool.name }}</td>
                    <td class="p-2 pl-3 w-[236px]">{{ tool.description }}</td>
                    <td class="p-2 pl-3">{{ tool.method }}</td>
                    <td class="p-2 pl-3 w-[62px]">{{ tool.path }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </a-form-item>
          <a-form-item field="Headers" label="Headers">
            <!-- 请求头表单 -->
            <div class="rounded-lg border border-gray-200 w-full overflow-x-auto">
              <table class="w-full leading-[18px] text-xs text-gray-700 font-normal mb-3">
                <thead class="text-gray-500">
                  <tr class="border-b border-gray-200">
                    <th class="p-2 pl-3">key</th>
                    <th class="p-2 pl-3">value</th>
                    <th class="p-2 pl-3 w-[50px]">操作</th>
                  </tr>
                </thead>
                <tbody v-if="form.headers.length > 0" class="border-b border-gray-200">
                  <tr
                    v-for="(header, idx) in form.headers"
                    :key="idx"
                    class="border-b last:border-0 border-gray-200"
                  >
                    <td class="p-2 pl-3">
                      <a-form-item :field="`headers[${idx}].key`" hide-label class="m-0">
                        <a-input v-model="header.key" placeholder="请输入请求头键名" />
                      </a-form-item>
                    </td>
                    <td class="p-2 pl-3">
                      <a-form-item :field="`headers[${idx}].value`" hide-label class="m-0">
                        <a-input v-model="header.value" placeholder="请输入请求头" />
                      </a-form-item>
                    </td>
                    <td class="p-2 pl-3">
                      <a-button
                        size="mini"
                        type="text"
                        class="!text-gray-700"
                        @click="form.headers.splice(idx, 1)"
                      >
                        <template #icon>
                          <icon-delete />
                        </template>
                      </a-button>
                    </td>
                  </tr>
                </tbody>
              </table>
              <!-- 新增 -->
              <a-button
                size="mini"
                class="rounded ml-3 mb-3 !text-gray-700"
                @click="form.headers.push({ key: '', value: '' })"
              >
                <template #icon>
                  <icon-plus />
                </template>
                新增参数
              </a-button>
            </div>
          </a-form-item>
          <!-- 底部按钮 -->
          <div class="flex items-center justify-between">
            <div class="">
              <a-button
                v-if="showUpdateModal"
                class="rounded-lg !text-red-700"
                @click="handleDelete"
                >删除</a-button
              >
            </div>
            <a-space :size="16">
              <a-button class="rounded-lg" @click="handleCancel">取消</a-button>
              <a-button
                :loading="sumbitLoading"
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
  </a-spin>
</template>
<style scoped></style>
