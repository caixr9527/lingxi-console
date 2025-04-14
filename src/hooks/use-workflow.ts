import { ref } from 'vue'
import type {
  CreateWorkflowRequest,
  GetWorkflowsWithPageResponse,
  UpdateDraftGraphRequest,
  UpdateWorkflowRequest,
} from '@/models/workflow'
import {
  cancelPublishWorkflow,
  createWorkflow,
  debugWorkflow,
  deleteWorkflow,
  getDraftGraph,
  getWorkflow,
  getWorkflowsWithPage,
  publishWorkflow,
  updateDraftGraph,
  updateWorkflow,
} from '@/services/workflow'
import { useRouter } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'

export const useGetWorkflowsWithPage = () => {
  // 定义hooks所需数据
  const loading = ref(false)
  const workflows = ref<GetWorkflowsWithPageResponse['data']['list']>([])
  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }
  const paginator = ref({ ...defaultPaginator })

  // 定义加载数据函数
  const loadWorkflows = async (
    search_word: string = '',
    status: string = '',
    init: boolean = false,
  ) => {
    // 判断是否是初始化，并检查分页器
    if (init) {
      paginator.value = defaultPaginator
    } else if (paginator.value.current_page > paginator.value.total_page) {
      return
    }

    try {
      // 调用接口获取响应数据
      loading.value = true
      const resp = await getWorkflowsWithPage({
        current_page: paginator.value.current_page,
        page_size: paginator.value.page_size,
        search_word,
        status,
      })
      const data = resp.data

      // 更新分页器
      paginator.value = data.paginator

      // 判断是否存在更多数据
      if (paginator.value.current_page <= paginator.value.total_page) {
        paginator.value.current_page += 1
      }

      // 判断是追加或者是覆盖数据
      if (init) {
        workflows.value = data.list
      } else {
        workflows.value.push(...data.list)
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, workflows, paginator, loadWorkflows }
}

export const useCreateWorkflow = () => {
  const loading = ref(false)
  const router = useRouter()

  const handleCreateWorkflow = async (req: CreateWorkflowRequest) => {
    try {
      loading.value = true
      const resp = await createWorkflow(req)

      Message.success('创建工作流成功')
      await router.push({
        name: 'space-workflows-detail',
        params: {
          workflow_id: resp.data.id,
        },
      })
    } finally {
      loading.value = false
    }
  }

  return { loading, handleCreateWorkflow }
}

export const useUpdateWorkflow = () => {
  const loading = ref(false)

  const handleUpdateWorkflow = async (workflow_id: string, req: UpdateWorkflowRequest) => {
    try {
      loading.value = true
      const resp = await updateWorkflow(workflow_id, req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateWorkflow }
}

export const useGetWorkflow = () => {
  const loading = ref(false)
  const workflow = ref<Record<string, any>>({})

  const loadWorkflow = async (workflow_id: string) => {
    try {
      loading.value = true
      const resp = await getWorkflow(workflow_id)
      workflow.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, workflow, loadWorkflow }
}

export const useDeleteWorkflow = () => {
  const handleDeleteWorkflow = (workflow_id: string, callback?: () => void) => {
    Modal.warning({
      title: '要删除该工作流吗?',
      content:
        '删除工作流后，发布的WebApp、开放API以及关联的社交媒体平台均无法使用该工作流，如果需要暂停工作流，可使用取消发布功能。',
      hideCancel: false,
      onOk: async () => {
        try {
          const resp = await deleteWorkflow(workflow_id)
          Message.success(resp.message)
        } finally {
          callback && callback()
        }
      },
    })
  }

  return { handleDeleteWorkflow }
}

export const useGetDraftGraph = () => {
  const loading = ref(false)
  const nodes = ref<Record<string, any>[]>([])
  const edges = ref<Record<string, any>[]>([])

  const loadDraftGraph = async (workflow_id: string) => {
    try {
      loading.value = true
      const resp = await getDraftGraph(workflow_id)
      const data = resp.data

      nodes.value = data.nodes.map((node) => {
        const { id, node_type: type, position, ...data } = node
        return { id, type, position, data }
      })

      edges.value = data.edges.map((edge) => {
        // 添加动画，并设置边的粗细+颜色
        return {
          ...edge,
          sourceHandle: edge.source_handle_id,
          animated: true,
          style: { strokeWidth: 2, stroke: '#9ca3af' },
        }
      })
    } finally {
      loading.value = false
    }
  }

  return { loading, nodes, edges, loadDraftGraph }
}

export const useUpdateDraftGraph = () => {
  const loading = ref(false)

  const handleUpdateDraftGraph = async (
    workflow_id: string,
    req: UpdateDraftGraphRequest,
    is_notify: boolean = true,
  ) => {
    try {
      loading.value = true
      const resp = await updateDraftGraph(workflow_id, req)
      is_notify && Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  const convertGraphToReq = (
    nodes: Record<string, any>[],
    edges: Record<string, any>[],
  ): UpdateDraftGraphRequest => {
    return {
      nodes: nodes.map((node) => {
        return {
          id: node.id,
          node_type: node.type,
          position: node.position,
          ...node.data,
        }
      }),
      edges: edges.map((edge) => {
        return {
          id: edge.id,
          source: edge.source,
          source_type: edge.source_type,
          source_handle_id: edge?.source_handle_id || null,
          target: edge.target,
          target_type: edge.target_type,
        }
      }),
    }
  }

  return { loading, convertGraphToReq, handleUpdateDraftGraph }
}

export const usePublishWorkflow = () => {
  // 1.定义hooks所需数据
  const loading = ref(false)

  // 2.定义发布工作流处理器
  const handlePublishWorkflow = async (workflow_id: string) => {
    try {
      // 3.调用api接口发布工作流
      loading.value = true
      const resp = await publishWorkflow(workflow_id)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handlePublishWorkflow }
}

export const useCancelPublishWorkflow = () => {
  // 1.定义hooks所需数据
  const loading = ref(false)

  // 2.定义取消发布处理器
  const handleCancelPublish = async (workflow_id: string) => {
    try {
      // 3.调用api取消发布工作流
      loading.value = true
      const resp = await cancelPublishWorkflow(workflow_id)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleCancelPublish }
}

export const useDebugWorkflow = () => {
  // 1.定义hooks所需数据
  const loading = ref(false)
  const error = ref('')

  // 2.定义调试会话处理器
  const handleDebugWorkflow = async (
    workflow_id: string,
    inputs: Record<string, any>,
    onData: (event_response: Record<string, any>) => void,
  ) => {
    try {
      loading.value = true
      const resp = await debugWorkflow(workflow_id, inputs, onData)

      // 2.1 判断响应内容是否存在，如果存在则表示该接口为非流式输出，意味着接口出错
      if (resp !== undefined) {
        error.value = resp['message']
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, error, handleDebugWorkflow }
}
