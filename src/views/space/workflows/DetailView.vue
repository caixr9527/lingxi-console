<script setup lang="ts">
import { markRaw, onMounted, ref } from 'vue'
import moment from 'moment/moment'
import { useRoute } from 'vue-router'
import { ConnectionMode, Panel, useVueFlow, VueFlow } from '@vue-flow/core'
import { Background } from '@vue-flow/background'
import { MiniMap } from '@vue-flow/minimap'
import dagre from 'dagre'
import { cloneDeep } from 'lodash'
import DebugModal from './components/DebugModal.vue'
import {
  useCancelPublishWorkflow,
  useGetDraftGraph,
  useGetWorkflow,
  usePublishWorkflow,
  useUpdateDraftGraph,
} from '@/hooks/use-workflow'
import StartNode from './components/nodes/StartNode.vue'
import LlmNode from './components/nodes/LLMNode.vue'
import DatasetRetrievalNode from './components/nodes/DatasetRetrievalNode.vue'
import CodeNode from './components/nodes/CodeNode.vue'
import HttpRequestNode from './components/nodes/HttpRequestNode.vue'
import ToolNode from './components/nodes/ToolNode.vue'
import TemplateTransformNode from './components/nodes/TemplateTransformNode.vue'
import EndNode from './components/nodes/EndNode.vue'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/minimap/dist/style.css'
import { Message } from '@arco-design/web-vue'
import { generateRandomString } from '@/utils/helper'

const route = useRoute()
const selectedNode = ref<any>(null)
const instance = ref<any>(null)
const isDebug = ref(false)
const { loading: getWorkflowLoading, workflow, loadWorkflow } = useGetWorkflow()
const { loading: getDraftGraphLoading, nodes, edges, loadDraftGraph } = useGetDraftGraph()
const { loading: publishWorkflowLoading, handlePublishWorkflow } = usePublishWorkflow()
const { handleCancelPublish } = useCancelPublishWorkflow()
const {
  onPaneReady, // 面板加载完毕事件
  onViewportChange, // 视口变化回调函数
  onConnect, // 边连接回调函数
  onPaneClick, // 工作流面板点击事件
  onNodeClick, // 节点点击事件
  onEdgeClick, // 边点击事件
  onNodeDragStop, // 节点拖动停止回调函数
  findNode, // 根据id查找节点
  nodes: allNodes, // 所有节点
} = useVueFlow()
const { handleUpdateDraftGraph, convertGraphToReq } = useUpdateDraftGraph()
const zoomLevel = ref<number>(1)
const zoomOptions = [
  { label: '200%', value: 2 },
  { label: '100%', value: 1 },
  { label: '75%', value: 0.75 },
  { label: '50%', value: 0.5 },
  { label: '25%', value: 0.25 },
]
const NOTE_TYPES = {
  start: markRaw(StartNode),
  llm: markRaw(LlmNode),
  tool: markRaw(ToolNode),
  dataset_retrieval: markRaw(DatasetRetrievalNode),
  template_transform: markRaw(TemplateTransformNode),
  http_request: markRaw(HttpRequestNode),
  code: markRaw(CodeNode),
  end: markRaw(EndNode),
}
const NODE_DATA_MAP: Record<string, any> = {
  start: {
    title: '开始节点',
    description: '工作流的起点节点，支持定义工作流的起点输入等信息',
    inputs: [],
  },
  llm: {
    title: '大语言模型',
    description: '调用大语言模型，根据输入参数和提示词生成回复。',
    prompt: '',
    model_config: {
      provider: 'openai',
      model: 'gpt-4o-mini',
      parameters: {
        frequency_penalty: 0.2,
        max_tokens: 8192,
        presence_penalty: 0.2,
        temperature: 0.5,
        top_p: 0.85,
      },
    },
    inputs: [],
    outputs: [{ name: 'output', type: 'string', value: { type: 'generated', content: '' } }],
  },
  tool: {
    title: '扩展插件',
    description: '调用插件广场或自定义API插件，支持能力扩展和复用',
    tool_type: '',
    provider_id: '',
    tool_id: '',
    params: {},
    inputs: [],
    outputs: [{ name: 'text', type: 'string', value: { type: 'generated', content: '' } }],
    meta: {
      type: 'api_tool',
      provider: { id: '', name: '', label: '', icon: '', description: '' },
      tool: { id: '', name: '', label: '', description: '', params: {} },
    },
  },
  dataset_retrieval: {
    title: '知识库检索',
    description: '根据输入的参数，在选定的知识库中检索相关片段并召回，返回切片列表',
    dataset_ids: [],
    retrieval_config: {
      retrieval_strategy: 'semantic',
      k: 4,
      score: 0,
    },
    inputs: [
      {
        name: 'query',
        type: 'string',
        value: { type: 'literal', content: '' },
      },
    ],
    outputs: [
      { name: 'combine_documents', type: 'string', value: { type: 'generated', content: '' } },
    ],
    meta: { datasets: [] },
  },
  template_transform: {
    title: '模板转换',
    description: '对多个字符串变量的格式进行处理',
    template: '',
    inputs: [],
    outputs: [{ name: 'output', type: 'string', value: { type: 'generated', content: '' } }],
  },
  http_request: {
    title: 'HTTP请求',
    description: '配置外部API服务，并发起请求。',
    url: '',
    method: 'get',
    inputs: [],
    outputs: [
      { name: 'status_code', type: 'int', value: { type: 'generated', content: 0 } },
      { name: 'text', type: 'string', value: { type: 'generated', content: '' } },
    ],
  },
  code: {
    title: 'Python代码执行',
    description: '编写代码，处理输入输出变量来生成返回值',
    code: '',
    inputs: [],
    outputs: [],
  },
  end: {
    title: '结束节点',
    description: '工作流的结束节点，支持定义工作流最终输出的变量等信息',
    outputs: [],
  },
}
// 定义监听工作流变化事件（涵盖节点+边）
const onChange = () => {
  // 检测是否初始化，如果是则直接中断程序
  if (isInitializing.value) return

  // 如果不是则发起更新图草稿配置
  handleUpdateDraftGraph(
    String(route.params?.workflow_id ?? ''),
    convertGraphToReq(nodes.value, edges.value),
  )
}
const isInitializing = ref(true)
const autoLayout = () => {
  // 创建dagre图结构
  const dagreGraph = new dagre.graphlib.Graph()

  // 设置布局参数
  dagreGraph.setDefaultEdgeLabel(() => ({}))
  dagreGraph.setGraph({
    rankdir: 'LR', // 纵向布局
    align: 'UL', // 左上对齐
    nodesep: 80, // 节点间距
    ranksep: 60, // 层次间距
    edgesep: 10, // 边间距
  })

  // 深度拷贝nodes和edges对应的数据，避免影响元数据
  const cloneNodes = cloneDeep(nodes.value)
  const cloneEdges = cloneDeep(edges.value)

  // 将节点添加到图中
  cloneNodes.forEach((node: any) => {
    dagreGraph.setNode(node.id, { width: node.dimensions.width, height: node.dimensions.height })
  })

  // 将边添加到图中
  cloneEdges.forEach((edge: any) => {
    dagreGraph.setEdge(edge.source, edge.target)
  })

  // 运行布局算法
  dagre.layout(dagreGraph)

  // 根据布局结果更新工作流的图结构布局
  nodes.value = cloneNodes.map((node: any) => {
    const { x, y } = dagreGraph.node(node.id)
    return {
      ...node,
      position: { x, y },
    }
  })
}

const addNode = (node_type: string) => {
  if (node_type === 'start') {
    if (allNodes.value.some((node) => node.type === node_type)) {
      Message.error('工作流中只能存在一个开始节点')
      return
    }
  }
  if (node_type === 'end') {
    if (allNodes.value.some((node) => node.type === node_type)) {
      Message.error('工作流中只能存在一个结束节点')
      return
    }
  }

  const node_count = allNodes.value.length
  const total = allNodes.value.reduce(
    (acc, item) => {
      acc.xSum += item.position.x
      acc.ySum += item.position.y
      return acc
    },
    {
      xSum: 0,
      ySum: 0,
    },
  )

  const xAverage = node_count > 0 ? total.xSum / node_count : 0
  const yAverage = node_count > 0 ? total.ySum / node_count : 0

  const node_data = NODE_DATA_MAP[node_type]

  nodes.value.push({
    id: crypto.randomUUID(),
    type: node_type,
    position: { x: xAverage, y: yAverage },
    data: {
      ...node_data,
      title: `${node_data.title}_${generateRandomString(5)}`,
    },
  })
}

// 工作流面板点击hooks
onPaneClick((mouseEvent) => {
  isDebug.value = false
  selectedNode.value = null
})

// 工作流Edge边点击hooks
onEdgeClick((edgeMouseEvent) => {
  isDebug.value = false
  selectedNode.value = null
})

// 工作流Node点击hooks
onNodeClick((nodeMouseEvent) => {
  // 限制每个节点只能点击一次，点击的时候将节点的数据赋值给selectedNode
  if (!selectedNode.value || selectedNode.value?.id !== nodeMouseEvent.node.id) {
    selectedNode.value = nodeMouseEvent.node
    // nodeInfoVisible.value = true
  }

  isDebug.value = false
})

// 工作流节点拖动停止hooks
onNodeDragStop((nodeDragEvent) => {
  handleUpdateDraftGraph(
    String(route.params?.workflow_id ?? ''),
    convertGraphToReq(nodes.value, edges.value),
    false,
  )
})

// 节点链接hooks
onConnect((connection) => {
  // 获取节点和目标的节点id
  const { source, target } = connection

  // 检查是否连接统一节点
  if (source === target) {
    Message.error('不能将节点连接到本身')
    return
  }

  // 检查节点和目标节点是否已经存在链接
  const isAlreadyConnected = edges.value.some((edge: any) => {
    return (
      (edge.source === source && edge.target === target) ||
      (edge.source === target && edge.target === source)
    )
  })

  // 如果已经连接，则提示用户并阻止连接
  if (isAlreadyConnected) {
    Message.error('这两个节点已有连接，无需重复添加')
    return
  }

  // 获取边的起点和终点类型
  const source_node = findNode(source)
  const target_node = findNode(target)

  // 将数据添加到edges
  edges.value.push({
    ...connection,
    id: crypto.randomUUID(),
    source_type: source_node?.type,
    target_type: target_node?.type,
    animated: true,
    style: { strokeWidth: 2, stroke: '#9ca3af' },
  })
})
onPaneReady((vueFlowInstance) => {
  vueFlowInstance.fitView()
  instance.value = vueFlowInstance
})
onViewportChange((viewportTransform) => {
  zoomLevel.value = viewportTransform.zoom
})

onMounted(async () => {
  const workflow_id = String(route.params?.workflow_id ?? '')
  await loadWorkflow(workflow_id)
  await loadDraftGraph(workflow_id)
  isInitializing.value = false
})
</script>

<template>
  <!-- 外部容器 -->
  <div class="min-h-screen flex flex-col h-full overflow-hidden relative">
    <!-- 顶部header -->
    <div
      class="h-[77px] flex-shrink-0 bg-white p-4 flex items-center justify-between relative border-b"
    >
      <!-- 左侧工作流信息 -->
      <div class="flex items-center gap-2">
        <!-- 回退按钮 -->
        <router-link :to="{ name: 'space-workflows-list' }">
          <a-button size="mini">
            <template #icon>
              <icon-left />
            </template>
          </a-button>
        </router-link>
        <!-- 工作流容器 -->
        <div class="flex items-center gap-3">
          <!-- 工作流图标 -->
          <a-avatar :size="40" shape="square" class="rounded-lg" :image-url="workflow.icon" />
          <!-- 工作流信息 -->
          <div class="flex flex-col justify-between h-[40px]">
            <a-skeleton-line v-if="getWorkflowLoading" :widths="[100]" />
            <div v-else class="text-gray-700 font-bold">{{ workflow.name }}</div>
            <div v-if="getWorkflowLoading" class="flex items-center gap-2">
              <a-skeleton-line :widths="[60]" :line-height="18" />
              <a-skeleton-line :widths="[60]" :line-height="18" />
              <a-skeleton-line :widths="[60]" :line-height="18" />
            </div>
            <div v-else class="flex items-center gap-2">
              <div class="max-w-[160px] line-clamp-1 text-xs text-gray-500">
                {{ workflow.description }}
              </div>
              <div class="flex items-center h-[18px] text-xs text-gray-500">
                <icon-schedule />
                {{ workflow.status === 'draft' ? '草稿' : '已发布' }}
              </div>
              <a-tag size="small" class="rounded h-[18px] leading-[18px] bg-gray-200 text-gray-500">
                已自动保存 {{ moment(workflow.updated_at * 1000).format('HH:mm:ss') }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>
      <!-- 右侧操作按钮 -->
      <div class="">
        <a-space :size="12">
          <a-button-group>
            <a-button
              :disabled="!workflow.is_debug_passed"
              :loading="publishWorkflowLoading"
              type="primary"
              class="!rounded-tl-lg !rounded-bl-lg"
              @click="() => handlePublishWorkflow(String(workflow.id))"
            >
              更新发布
            </a-button>
            <a-dropdown position="br">
              <a-button
                :disabled="workflow.status !== 'published'"
                type="primary"
                class="!rounded-tr-lg !rounded-br-lg !w-5"
              >
                <template #icon>
                  <icon-down />
                </template>
              </a-button>
              <template #content>
                <a-doption
                  :disabled="workflow.status !== 'published'"
                  class="!text-red-700"
                  @click="() => handleCancelPublish(String(workflow.id))"
                >
                  取消发布
                </a-doption>
              </template>
            </a-dropdown>
          </a-button-group>
        </a-space>
      </div>
    </div>
    <!-- 中间编排画布 -->
    <div class="flex-1">
      <vue-flow
        :min-zoom="0.25"
        :max-zoom="2"
        :nodes-connectable="true"
        :connection-mode="ConnectionMode.Strict"
        :connection-line-options="{ style: { strokeWidth: 2, stroke: '#9ca3af' } }"
        :node-types="NOTE_TYPES"
        v-model:nodes="nodes"
        v-model:edges="edges"
        @update:nodes="onChange"
        @update:edges="onChange"
      >
        <!-- 工作流背景 -->
        <background />
        <!-- 迷你地图 -->
        <mini-map
          class="rounded-xl border border-gray-300 overflow-hidden !left-0 !right-auto"
          :width="160"
          :height="96"
          pannable
          zoomable
        />
        <!-- 使用默认插槽添加工具菜单 -->
        <panel position="bottom-center">
          <div class="p-[5px] bg-white rounded-xl border z-50">
            <a-space :size="8">
              <template #split>
                <a-divider direction="vertical" class="m-0" />
              </template>
              <!-- 添加节点 -->
              <a-trigger position="top" :popup-translate="[0, -16]">
                <a-button type="primary" size="small" class="rounded-lg px-2">
                  <template #icon>
                    <icon-plus-circle-fill />
                  </template>
                  节点
                </a-button>
                <template #content>
                  <div
                    class="bg-white border border-gary-200 w-[240px] shadow rounded-xl h-[calc(100vh-300px)] overflow-scroll py-2"
                  >
                    <!-- 开始节点 -->
                    <div
                      class="flex flex-col px-3 py-2 gap-2 cursor-pointer hover:bg-gray-50"
                      @click="() => addNode('start')"
                    >
                      <!-- 节点名称 -->
                      <div class="flex items-center gap-2">
                        <a-avatar shape="square" :size="24" class="bg-blue-700 rounded-lg">
                          <icon-home />
                        </a-avatar>
                        <div class="text-gray-700 font-semibold">开始节点</div>
                      </div>
                      <!-- 节点描述 -->
                      <div class="text-gray-500 font-xs">
                        工作流的起始节点，支持定义工作流的起点输入等信息。
                      </div>
                    </div>
                    <!-- 大语言模型节点 -->
                    <div
                      class="flex flex-col px-3 py-2 gap-2 cursor-pointer hover:bg-gray-50"
                      @click="() => addNode('llm')"
                    >
                      <!-- 节点名称 -->
                      <div class="flex items-center gap-2">
                        <a-avatar shape="square" :size="24" class="bg-sky-500 rounded-lg">
                          <icon-language />
                        </a-avatar>
                        <div class="text-gray-700 font-semibold">大语言模型节点</div>
                      </div>
                      <!-- 节点描述 -->
                      <div class="text-gray-500 font-xs">
                        调用大语言模型，根据输入参数和提示词生成回复。
                      </div>
                    </div>
                    <!-- 扩展插件节点 -->
                    <div
                      class="flex flex-col px-3 py-2 gap-2 cursor-pointer hover:bg-gray-50"
                      @click="() => addNode('tool')"
                    >
                      <!-- 节点名称 -->
                      <div class="flex items-center gap-2">
                        <a-avatar shape="square" :size="24" class="bg-orange-500 rounded-lg">
                          <icon-tool />
                        </a-avatar>
                        <div class="text-gray-700 font-semibold">扩展插件节点</div>
                      </div>
                      <!-- 节点描述 -->
                      <div class="text-gray-500 font-xs">
                        添加插件广场内或自定义API插件，支持能力扩展和复用。
                      </div>
                    </div>
                    <!-- 知识库检索节点 -->
                    <div
                      class="flex flex-col px-3 py-2 gap-2 cursor-pointer hover:bg-gray-50"
                      @click="() => addNode('dataset_retrieval')"
                    >
                      <!-- 节点名称 -->
                      <div class="flex items-center gap-2">
                        <a-avatar shape="square" :size="24" class="bg-violet-500 rounded-lg">
                          <icon-storage />
                        </a-avatar>
                        <div class="text-gray-700 font-semibold">知识库检索</div>
                      </div>
                      <!-- 节点描述 -->
                      <div class="text-gray-500 text-xs">
                        根据输入的参数，在选定的知识库中检索相关片段并召回，返回切片列表。
                      </div>
                    </div>
                    <!-- 模板转换节点 -->
                    <div
                      class="flex flex-col px-3 py-2 gap-2 cursor-pointer hover:bg-gray-50"
                      @click="() => addNode('template_transform')"
                    >
                      <!-- 节点名称 -->
                      <div class="flex items-center gap-2">
                        <a-avatar shape="square" :size="24" class="bg-emerald-400 rounded-lg">
                          <icon-branch />
                        </a-avatar>
                        <div class="text-gray-700 font-semibold">模板转换节点</div>
                      </div>
                      <!-- 节点描述 -->
                      <div class="text-gray-500 font-xs">对多个字符串变量的格式进行处理。</div>
                    </div>
                    <!-- HTTP请求节点 -->
                    <div
                      class="flex flex-col px-3 py-2 gap-2 cursor-pointer hover:bg-gray-50"
                      @click="() => addNode('http_request')"
                    >
                      <!-- 节点名称 -->
                      <div class="flex items-center gap-2">
                        <a-avatar shape="square" :size="24" class="bg-rose-500 rounded-lg">
                          <icon-link />
                        </a-avatar>
                        <div class="text-gray-700 font-semibold">HTTP请求节点</div>
                      </div>
                      <!-- 节点描述 -->
                      <div class="text-gray-500 font-xs">配置外部API服务，并发起请求。</div>
                    </div>
                    <!-- Python代码执行节点 -->
                    <div
                      class="flex flex-col px-3 py-2 gap-2 cursor-pointer hover:bg-gray-50"
                      @click="() => addNode('code')"
                    >
                      <!-- 节点名称 -->
                      <div class="flex items-center gap-2">
                        <a-avatar shape="square" :size="24" class="bg-cyan-500 rounded-lg">
                          <icon-code />
                        </a-avatar>
                        <div class="text-gray-700 font-semibold">Python代码执行节点</div>
                      </div>
                      <!-- 节点描述 -->
                      <div class="text-gray-500 font-xs">
                        编写代码处理输入输出变量来生成返回值。
                      </div>
                    </div>
                    <!-- 结束节点 -->
                    <div
                      class="flex flex-col px-3 py-2 gap-2 cursor-pointer hover:bg-gray-50"
                      @click="() => addNode('end')"
                    >
                      <!-- 节点名称 -->
                      <div class="flex items-center gap-2">
                        <a-avatar shape="square" :size="24" class="bg-red-700 rounded-lg">
                          <icon-filter />
                        </a-avatar>
                        <div class="text-gray-700 font-semibold">结束节点</div>
                      </div>
                      <!-- 节点描述 -->
                      <div class="text-gray-500 font-xs">
                        工作流的结束节点，支持定义工作流最终输出的变量等信息。
                      </div>
                    </div>
                  </div>
                </template>
              </a-trigger>
              <!-- 自适应布局&视口大小 -->
              <div class="flex items-center gap-3">
                <a-tooltip content="自适应布局">
                  <a-button
                    size="small"
                    type="text"
                    class="!text-gray-700 rounded-lg"
                    @click="() => autoLayout()"
                  >
                    <template #icon>
                      <icon-apps />
                    </template>
                  </a-button>
                </a-tooltip>

                <a-dropdown
                  trigger="hover"
                  @select="
                    (value) => {
                      // 调整视口大小并更新视口等级
                      zoomLevel = Number(value)
                      instance.zoomTo(value)
                    }
                  "
                >
                  <a-button size="small" class="!text-gray-700 px-2 rounded-lg gap-1 w-[80px]">
                    {{ (zoomLevel * 100).toFixed(0) }}%
                    <icon-down />
                  </a-button>
                  <template #content>
                    <a-doption v-for="zoom in zoomOptions" :key="zoom.value" :value="zoom.value">
                      {{ zoom.label }}
                    </a-doption>
                  </template>
                </a-dropdown>
              </div>
              <!-- 调试与预览 -->
              <a-button type="text" size="small" class="px-2 rounded-lg" @click="isDebug = true">
                <template #icon>
                  <icon-play-arrow />
                </template>
                调试
              </a-button>
            </a-space>
          </div>
        </panel>
        <!-- 调试与预览窗口 -->
        <debug-modal
          :workflow_id="String(route.params?.workflow_id ?? '')"
          v-model:visible="isDebug"
        />
      </vue-flow>
    </div>
  </div>
</template>

<style>
.selected {
  .vue-flow__edge-path {
    @apply !stroke-blue-700;
  }
}
</style>
