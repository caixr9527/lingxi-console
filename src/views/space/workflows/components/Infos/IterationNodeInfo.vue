<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useVueFlow } from '@vue-flow/core'
import { cloneDeep } from 'lodash'
import { getReferencedVariables } from '@/utils/helper'
import { useGetWorkflowsWithPage } from '@/hooks/use-workflow'
import { Message, type ValidatedError } from '@arco-design/web-vue'

const props = defineProps({
  visible: { type: Boolean, required: true, default: false },
  node: {
    type: Object as any,
    required: true,
    default: () => {
      return {}
    },
  },
  loading: { type: Boolean, required: true, default: false },
})
const emits = defineEmits(['update:visible', 'updateNode'])
const route = useRoute()
const workflowsModalVisible = ref(false)
const form = ref<Record<string, any>>({})
const { nodes, edges } = useVueFlow()
const {
  loading: getWorkflowsWithPageLoading,
  paginator,
  workflows: originWorkflows,
  loadWorkflows,
} = useGetWorkflowsWithPage()
const workflows = computed(() => {
  return originWorkflows.value.filter((item) => item.id !== route.params?.workflow_id)
})

const inputRefOptions = computed(() => {
  return getReferencedVariables(cloneDeep(nodes.value), cloneDeep(edges.value), props.node.id)
})

const handleScroll = async (event: UIEvent) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLElement

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    if (getWorkflowsWithPageLoading.value) return
    await loadWorkflows()
  }
}

const removeWorkflow = (idx: number) => {
  form.value.workflows.splice(idx, 1)
}

const handleSelectWorkflow = (idx: number) => {
  const workflow = workflows.value[idx]

  if (form.value.workflows.some((activateWorkflow: any) => activateWorkflow.id === workflow.id)) {
    form.value.workflows = form.value.workflows.filter(
      (activateWorkflow: any) => activateWorkflow.id !== workflow.id,
    )
  } else {
    if (form.value.workflows.length >= 1) {
      Message.warning('迭代的工作流数量大于等于1，无法继续关联')
      return
    }
    form.value.workflows.push({
      id: workflow.id,
      name: workflow.name,
      icon: workflow.icon,
      description: workflow.description,
    })
  }
}

const onSubmit = async ({ errors }: { errors: Record<string, ValidatedError> | undefined }) => {
  if (errors) return

  const cloneInputs = cloneDeep(form.value.inputs)
  const cloneWorkflows = cloneDeep(form.value.workflows)

  emits('updateNode', {
    id: props.node.id,
    title: form.value.title,
    description: form.value.description,
    workflow_ids: cloneWorkflows.map((workflow: any) => {
      return workflow.id
    }),
    meta: { workflows: cloneWorkflows },
    inputs: cloneInputs.map((input: any) => {
      return {
        name: input.name,
        description: '',
        required: true,
        type: input.type === 'ref' ? 'list[string]' : input.type,
        value: {
          type: input.type === 'ref' ? 'ref' : 'literal',
          content:
            input.type === 'ref'
              ? {
                  ref_node_id: input.ref.split('/')[0] || '',
                  ref_var_name: input.ref.split('/')[1] || '',
                }
              : input.content,
        },
        meta: {},
      }
    }),
    outputs: cloneDeep(form.value.outputs),
  })
}

watch(
  () => props.node,
  (newNode) => {
    const cloneInputs = cloneDeep(newNode.data.inputs)
    form.value = {
      id: newNode.id,
      type: newNode.type,
      title: newNode.data.title,
      description: newNode.data.description,
      workflows: cloneDeep(newNode.data.meta.workflows) ?? [],
      inputs: cloneInputs.map((input: any) => {
        // 7.1 计算引用的变量值信息
        const ref =
          input.value.type === 'ref'
            ? `${input.value.content.ref_node_id}/${input.value.content.ref_var_name}`
            : ''

        // 7.2 判断引用的变量值信息是否存在，如果不存在则设置为空
        let refExists = false
        if (input.value.type === 'ref') {
          for (const inputRefOption of inputRefOptions.value) {
            for (const option of inputRefOption.options) {
              if (option.value === ref) {
                refExists = true
                break
              }
            }
          }
        }
        return {
          name: input.name, // 变量名
          type: input.value.type === 'literal' ? input.type : 'ref', // 数据类型(涵盖ref/string/int/float/boolean
          content: input.value.type === 'literal' ? input.value.content : '', // 变量值内容
          ref: input.value.type === 'ref' && refExists ? ref : '', // 变量引用信息，存储引用节点id+引用变量名
        }
      }),
      outputs: [
        { name: 'outputs', type: 'list[string]', value: { type: 'generated', content: '' } },
      ],
    }
  },
  { immediate: true },
)

onMounted(() => {
  loadWorkflows('', 'published', true)
})
</script>

<template>
  <div
    v-if="props.visible"
    id="llm-node-info"
    class="absolute top-0 right-0 bottom-0 w-[400px] border-l z-50 bg-white overflow-scroll scrollbar-w-none p-3"
  >
    <!-- 顶部标题信息 -->
    <div class="flex items-center justify-between gap-3 mb-2">
      <!-- 左侧标题 -->
      <div class="flex items-center gap-1 flex-1">
        <a-avatar :size="30" shape="square" class="bg-pink-700 rounded-lg flex-shrink-0">
          <icon-sync />
        </a-avatar>
        <a-input
          v-model:model-value="form.title"
          placeholder="请输入标题"
          class="!bg-white text-gray-700 font-semibold px-2"
        />
      </div>
      <!-- 右侧关闭按钮 -->
      <a-button
        type="text"
        size="mini"
        class="!text-gray700 flex-shrink-0"
        @click="() => emits('update:visible', false)"
      >
        <template #icon>
          <icon-close />
        </template>
      </a-button>
    </div>
    <!-- 描述信息 -->
    <a-textarea
      :auto-size="{ minRows: 3, maxRows: 5 }"
      v-model="form.description"
      class="rounded-lg text-gray-700 !text-xs"
      placeholder="输入描述..."
    />
    <!-- 分隔符 -->
    <a-divider class="my-2" />
    <!-- 表单信息 -->
    <a-form size="mini" :model="form" layout="vertical" @submit="onSubmit">
      <!-- 输入参数 -->
      <div class="flex flex-col gap-2">
        <!-- 标题&操作按钮 -->
        <div class="flex items-center justify-between">
          <!-- 左侧标题 -->
          <div class="flex items-center gap-2 text-gray-700 font-semibold">
            <div class="">输入数据</div>
            <a-tooltip
              content="传递给迭代器的数据，参数类型必须是列表型数据，支持列表型string/int/float/bool数据。"
            >
              <icon-question-circle />
            </a-tooltip>
          </div>
        </div>
        <!-- 字段名 -->
        <div class="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <div class="w-[20%]">参数名</div>
          <div class="w-[25%]">类型</div>
          <div class="w-[55%]">值</div>
        </div>
        <!-- 循环遍历字段列表 -->
        <div v-for="(input, idx) in form?.inputs" :key="idx" class="flex items-center gap-1">
          <div class="w-[20%] flex-shrink-0">
            <div class="text-xs text-gray-500">{{ input.name }}</div>
          </div>
          <div class="w-[25%] flex-shrink-0">
            <a-select
              size="mini"
              v-model="input.type"
              class="px-2"
              :options="[
                { label: '引用', value: 'ref' },
                { label: 'LIST[STRING]', value: 'list[string]' },
                { label: 'LIST[INT]', value: 'list[int]' },
                { label: 'LIST[FLOAT]', value: 'list[float]' },
                { label: 'LIST[BOOLEAN]', value: 'list[boolean]' },
              ]"
            />
          </div>
          <div class="w-[55%] flex-shrink-0 flex items-center gap-1">
            <a-input
              v-if="input.type !== 'ref'"
              size="mini"
              v-model="input.content"
              placeholder="请输入参数值"
            />
            <a-select
              v-else
              placeholder="请选择引用变量"
              size="mini"
              tag-nowrap
              v-model="input.ref"
              :options="inputRefOptions"
            />
          </div>
        </div>
      </div>
      <a-divider class="my-4" />
      <!-- 迭代工作流 -->
      <div class="flex flex-col gap-2">
        <!-- 标题&操作按钮 -->
        <div class="flex items-center justify-between">
          <!-- 左侧标题 -->
          <div class="flex items-center gap-2 text-gray-700 font-semibold">
            <div class="">迭代工作流</div>
            <a-tooltip content="绑定需要迭代的工作流，最多可以绑定一个工作流进行迭代。">
              <icon-question-circle />
            </a-tooltip>
          </div>
          <!-- 右侧绑定工作流按钮 -->
          <a-button
            size="mini"
            type="text"
            class="!text-gray-700"
            @click="() => (workflowsModalVisible = true)"
          >
            <template #icon>
              <icon-plus />
            </template>
          </a-button>
        </div>
        <div v-if="form.workflows?.length > 0" class="flex flex-col gap-1">
          <div
            v-for="(workflow, idx) in form.workflows"
            :key="workflow.id"
            class="flex items-center justify-between bg-white p-3 rounded-lg cursor-pointer hover:shadow-sm group border"
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
              @click="() => removeWorkflow(idx)"
            >
              <template #icon>
                <icon-delete />
              </template>
            </a-button>
          </div>
        </div>
        <div v-else class="text-xs text-gray-500 leading-[22px]">
          执行迭代的工作流，迭代节点最多支持绑定 1 个已发布工作流。
        </div>
      </div>
      <a-divider class="my-4" />
      <!-- 输出参数 -->
      <div class="flex flex-col gap-2">
        <!-- 输出标题 -->
        <div class="font-semibold text-gray-700">输出数据</div>
        <!-- 字段标题 -->
        <div class="text-gray-500 text-xs">参数名</div>
        <!-- 输出参数列表 -->
        <div v-for="(output, idx) in form?.outputs" :key="idx" class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div class="text-gray-700">{{ output.name }}</div>
            <div class="text-gray-500 bg-gray-200 px-1 py-0.5 rounded">{{ output.type }}</div>
          </div>
        </div>
      </div>
      <a-divider class="my-4" />
      <!-- 保存按钮 -->
      <a-button
        :loading="props.loading"
        type="primary"
        size="small"
        html-type="submit"
        long
        class="rounded-lg"
      >
        保存
      </a-button>
    </a-form>
    <!-- 迭代知识库列表 -->
    <a-modal
      :visible="workflowsModalVisible"
      hide-title
      :footer="false"
      :width="400"
      modal-class="h-[calc(100vh-32px)]"
      @cancel="() => (workflowsModalVisible = false)"
    >
      <!-- 顶部标题 -->
      <div class="flex items-center justify-between mb-6">
        <div class="text-lg font-bold text-gray-700">选择迭代工作流</div>
        <a-button
          type="text"
          class="!text-gray-700"
          size="small"
          @click="() => (workflowsModalVisible = false)"
        >
          <template #icon>
            <icon-close />
          </template>
        </a-button>
      </div>
      <!-- 中间知识库容器 -->
      <div class="h-[calc(100vh-180px)] mb-4 overflow-scroll scrollbar-w-none">
        <a-spin
          :loading="getWorkflowsWithPageLoading"
          class="block h-full w-full scrollbar-w-none overflow-scroll"
          @scroll="handleScroll"
        >
          <!-- 工作流列表 -->
          <div class="flex flex-col gap-2">
            <!-- 有数据UI状态 -->
            <div
              v-for="(workflow, idx) in workflows"
              :key="workflow.id"
              :class="`flex items-center gap-2 border px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-700 ${form.workflows.some((activateWorkflow: any) => activateWorkflow.id === workflow.id) ? 'bg-blue-50 border-blue-700' : ''}`"
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
              v-if="workflows.length === 0"
              description="没有可迭代的工作流"
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
      <!-- 底部选中知识库及按钮 -->
      <div class="flex items-center justify-between">
        <!-- 左侧提示文字 -->
        <div class="">{{ form.workflows.length }} 个工作流被选中</div>
        <!-- 按钮组 -->
        <a-space :size="12">
          <a-button
            type="primary"
            class="rounded-lg"
            @click="() => (workflowsModalVisible = false)"
          >
            确定
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<style scoped></style>
