<script setup lang="ts">
import { nextTick, type PropType, ref, watch } from 'vue'
import { useUpdateDraftAppConfig } from '@/hooks/use-app'
import { cloneDeep, isEqual } from 'lodash'
import { Message } from '@arco-design/web-vue'
import { useGetWorkflowsWithPage } from '@/hooks/use-workflow'

const props = defineProps({
  app_id: { type: String, default: '', required: true },
  workflows: {
    type: Array as PropType<
      {
        id: string
        name: string
        icon: string
        description: string
      }[]
    >,
    default: () => [],
    required: true,
  },
})
const emits = defineEmits(['update:workflows'])
const { loading: updateDraftAppConfigLoading, handleUpdateDraftAppConfig } =
  useUpdateDraftAppConfig()
const { loading, paginator, workflows: apiWorkflows, loadWorkflows } = useGetWorkflowsWithPage()
const workflowsModalVisible = ref(false)
const isWorkflowsInit = ref(false)
const activateWorkflows = ref<Record<string, any>[]>([])
const originWorkflows = ref<Record<string, any>[]>([])

const handleScroll = async (event: UIEvent) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLElement

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    if (loading.value) return
    await loadWorkflows('', 'published')
  }
}

const isWorkflowsModified = () => {
  return isEqual(activateWorkflows.value, originWorkflows.value)
}

const handleCancelWorkflowsModal = () => {
  workflowsModalVisible.value = false

  activateWorkflows.value = originWorkflows.value
  isWorkflowsInit.value = false
}

// 工作流选择处理器
const handleSelectWorkflow = (idx: number) => {
  // 提取对应的工作流id
  const workflow = apiWorkflows.value[idx]

  // 检测id是否选中，如果是选中则删除
  if (activateWorkflows.value.some((activateWorkflow) => activateWorkflow.id === workflow.id)) {
    activateWorkflows.value = activateWorkflows.value.filter(
      (activateWorkflow) => activateWorkflow.id !== workflow.id,
    )
  } else {
    // 检测已关联的工作流数量
    if (activateWorkflows.value.length >= 5) {
      Message.warning('关联工作流已超过5个，无法继续关联')
      return
    }
    // 添加数据到激活工作流列表
    activateWorkflows.value.push({
      id: workflow.id,
      name: workflow.name,
      icon: workflow.icon,
      description: workflow.description,
    })
  }
}

// 提交更新关联工作流
const handleSubmitWorkflows = async () => {
  try {
    // 处理数据并完成API接口提交
    await handleUpdateDraftAppConfig(props.app_id, {
      workflows: activateWorkflows.value.map((activateWorkflow) => activateWorkflow.id),
    })

    // 接口更新更新成功，同步表单信息
    originWorkflows.value = activateWorkflows.value
    await nextTick()

    // 双向同步更新props中的数据
    emits('update:workflows', activateWorkflows.value)

    //  隐藏模态窗
    handleCancelWorkflowsModal()
  } catch (e) {
    /* empty */
  }
}

// 监听草稿配置关联的工作流列表
watch(
  () => props.workflows,
  (newValue) => {
    // 检测数据是否初始化
    if (!isWorkflowsInit.value || !isWorkflowsModified()) {
      // 判断草稿配置是否已传递配置
      if (newValue && newValue.length > 0) {
        // 赋初始值
        const initData = props.workflows.map((workflow) => {
          return {
            id: workflow.id,
            name: workflow.name,
            icon: workflow.icon,
            description: workflow.description,
          }
        })
        activateWorkflows.value = cloneDeep(initData)
        originWorkflows.value = cloneDeep(initData)

        // 修改初始化状态
        isWorkflowsInit.value = true
      }
    }
  },
  { immediate: true, deep: true },
)

// 监听知识库模态窗显示or隐藏
watch(
  () => workflowsModalVisible.value,
  async (newValue) => {
    // 显示状态，重新加载数据，获取最新的知识库列表
    if (newValue) {
      await loadWorkflows('', 'published', true)
    } else {
      // 隐藏状态，清空数据
      apiWorkflows.value.splice(0, apiWorkflows.value.length)
    }
  },
)
</script>

<template>
  <div class="">
    <a-collapse-item key="workflows" class="app-ability-item">
      <template #header>
        <div class="text-gray-700 font-bold">工作流</div>
      </template>
      <template #extra>
        <a-button
          size="mini"
          type="text"
          class="!text-gray-700"
          @click.stop="workflowsModalVisible = true"
        >
          <template #icon>
            <icon-plus />
          </template>
        </a-button>
      </template>
      <div v-if="props.workflows?.length > 0" class="flex flex-col gap-1">
        <div
          v-for="(workflow, idx) in props.workflows"
          :key="workflow.id"
          class="flex items-center justify-between bg-white p-3 rounded-lg cursor-pointer hover:shadow-sm group"
        >
          <!-- 左侧工作流信息 -->
          <div class="flex items-center gap-2">
            <!-- 图标 -->
            <a-avatar
              :size="36"
              shape="square"
              class="rounded flex-shrink-0"
              :image-url="workflow.icon"
            />
            <!-- 名称与描述信息 -->
            <div class="flex flex-col flex-1 gap-1 h-9">
              <div class="text-gray-700 font-bold leading-[18px] line-clamp-1 break-all">
                {{ workflow.name }}
              </div>
              <div class="text-gray-500 text-xs line-clamp-1 break-all">
                {{ workflow.description }}
              </div>
            </div>
          </div>
          <!-- 右侧删除按钮 -->
          <a-button
            size="mini"
            type="text"
            class="hidden group-hover:block flex-shrink-0 ml-2 !text-red-700 rounded"
            @click="
              async () => {
                // 清除props中指定的数据
                const newWorkflows = [...props.workflows]
                newWorkflows.splice(idx, 1)

                // 提交草稿配置到接口
                await handleUpdateDraftAppConfig(props.app_id, {
                  workflows: newWorkflows.map((item) => item.id),
                })

                // 更新数据并确保数据完成更新
                isWorkflowsInit = false
                emits('update:workflows', newWorkflows)
              }
            "
          >
            <template #icon>
              <icon-delete />
            </template>
          </a-button>
        </div>
      </div>
      <div v-else class="text-xs text-gray-500 leading-[22px]">
        工作流支持通过可视化的方式，对插件、大语言模型、代码块等功能进行组合，从而实现复杂、稳定的业务流程编排，例如旅行规划、报告分析等。
      </div>
    </a-collapse-item>
    <!-- 工作流模态窗 -->
    <a-modal
      :visible="workflowsModalVisible"
      hide-title
      :footer="false"
      :width="400"
      class="workflows-modal"
      modal-class="h-[calc(100vh-32px)] right-4"
      @cancel="handleCancelWorkflowsModal"
    >
      <!-- 顶部标题 -->
      <div class="flex items-center justify-between mb-6">
        <div class="text-lg font-bold text-gray-700">选择关联工作流</div>
        <a-button
          type="text"
          class="!text-gray-700"
          size="small"
          @click="handleCancelWorkflowsModal"
        >
          <template #icon>
            <icon-close />
          </template>
        </a-button>
      </div>
      <!-- 中间工作流容器 -->
      <div class="h-[calc(100vh-180px)] mb-4 overflow-scroll scrollbar-w-none">
        <a-spin
          :loading="loading"
          class="block h-full w-full scrollbar-w-none overflow-scroll"
          @scroll="handleScroll"
        >
          <!-- 工作流列表 -->
          <div class="flex flex-col gap-2">
            <!-- 有数据UI状态 -->
            <div
              v-for="(workflow, idx) in apiWorkflows"
              :key="workflow.id"
              :class="`flex items-center gap-2 border px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-700 ${activateWorkflows.some((activateWorkflow) => activateWorkflow.id === workflow.id) ? 'bg-blue-50 border-blue-700' : ''}`"
              @click="() => handleSelectWorkflow(idx)"
            >
              <a-avatar
                :size="24"
                shape="square"
                class="flex-shrink-0 rounded"
                :image-url="workflow.icon"
              />
              <div class="line-clamp-1 text-gray-500 flex-1">{{ workflow.name }}</div>
            </div>
            <!-- 无数据UI状态 -->
            <a-empty
              v-if="apiWorkflows.length === 0"
              description="没有可用的工作流"
              class="h-[400px] flex flex-col items-center justify-center"
            />
          </div>
          <!-- 加载器 -->
          <a-row v-if="paginator.total_page >= 2">
            <!-- 加载数据中 -->
            <a-col
              v-if="paginator.current_page <= paginator.total_page"
              :span="24"
              class="!text-center"
            >
              <a-space class="my-4">
                <a-spin />
                <div class="text-gray-400">加载中</div>
              </a-space>
            </a-col>
            <!-- 数据加载完成 -->
            <a-col v-else :span="24" class="!text-center">
              <div class="text-gray-400 my-4">数据已加载完成</div>
            </a-col>
          </a-row>
        </a-spin>
      </div>
      <!-- 底部选中工作流及按钮 -->
      <div class="flex items-center justify-between">
        <!-- 左侧提示文字 -->
        <div class="">{{ activateWorkflows.length }} 个工作流被选中</div>
        <!-- 按钮组 -->
        <a-space :size="12">
          <a-button class="rounded-lg" @click="handleCancelWorkflowsModal">取消</a-button>
          <a-button
            :loading="updateDraftAppConfigLoading"
            type="primary"
            class="rounded-lg"
            @click="handleSubmitWorkflows"
          >
            添加
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<style>
.workflows-modal {
  .arco-modal-wrapper {
    text-align: right;
  }
}
</style>
