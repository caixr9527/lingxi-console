import {
  createDataset,
  deleteDataset,
  deleteDocument,
  getDataset,
  getDatasetsWithPage,
  getDocumentsWithPage,
  updateDataset,
  updateDocumentEnabled,
} from '@/services/dataset'
import { reactive, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'

export const useGetDatasetWithPage = () => {
  const route = useRoute()
  const loading = ref(false)
  const datasets = reactive<Array<any>>([])
  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }

  const paginator = reactive({
    ...defaultPaginator,
  })

  const loadDatasets = async (init: boolean = false) => {
    if (init) {
      initPaginator()
    } else if (paginator.current_page > paginator.total_page) {
      return
    }

    try {
      loading.value = true
      const resp = await getDatasetsWithPage(
        paginator.current_page,
        paginator.page_size,
        String(route.query?.search_word ?? ''),
      )
      const data = resp.data

      updatePaginator(data)

      if (paginator.current_page <= paginator.total_page) {
        paginator.current_page += 1
      }
      if (init) {
        datasets.splice(0, datasets.length, ...data.list)
      } else {
        datasets.push(...data.list)
      }
    } finally {
      loading.value = false
    }
  }

  const initPaginator = () => {
    Object.assign(paginator, { ...defaultPaginator })
  }

  const updatePaginator = (data: any) => {
    paginator.current_page = data.paginator.current_page
    paginator.page_size = data.paginator.page_size
    paginator.total_page = data.paginator.total_page
    paginator.total_record = data.paginator.total_record
  }

  onMounted(async () => {
    await loadDatasets(true)
  })

  watch(
    () => route.query?.search_word,
    async () => {
      await loadDatasets(true)
    },
  )
  return { loading, datasets, paginator, loadDatasets }
}

export const useDeleteDataset = () => {
  const handleDelete = (dataset_id: string, callback?: () => void) => {
    Modal.warning({
      title: '是否删除？',
      content:
        '删除知识库后，关联该知识库的应用将无法再使用该知识库，所有的提示配置和文档将被永久删除',
      hideCancel: false,
      onOk: async () => {
        try {
          const resp = await deleteDataset(dataset_id)
          Message.success(resp.message)
        } finally {
          callback && callback()
        }
      },
    })
  }

  return { handleDelete }
}

export const useCrateOrUpdateDataset = () => {
  const loading = ref(false)
  const defaultForm = {
    fileList: [],
    icon: '',
    name: '',
    description: '',
  }
  const form = reactive({ ...defaultForm })

  const formRef = ref()
  const showUpdateModal = ref(false)
  const updateShowUpdateModal = (new_value: boolean, callback?: () => void) => {
    showUpdateModal.value = new_value
    callback && callback()
  }

  const saveDataset = async (dataset_id?: string) => {
    try {
      loading.value = true
      if (dataset_id !== undefined && dataset_id !== '') {
        const resp = await updateDataset(dataset_id, {
          icon: form.icon,
          name: form.name,
          description: form.description,
        })
        Message.success(resp.message)
      } else {
        const resp = await createDataset({
          icon: form.icon,
          name: form.name,
          description: form.description,
        })
        Message.success(resp.message)
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, form, formRef, saveDataset, showUpdateModal, updateShowUpdateModal }
}

export const useGetDataset = (dataset_id: string) => {
  const loading = ref(false)
  const dataset = reactive<any>({})

  const loadDataset = async (dataset_id: string) => {
    try {
      loading.value = true
      const resp = await getDataset(dataset_id)
      const data = resp.data
      Object.assign(dataset, { ...data })
    } finally {
      loading.value = false
    }
  }

  onMounted(async () => await loadDataset(dataset_id))

  return { loading, dataset, loadDataset }
}

export const useGetDocumentsWithPage = (dataset_id: string) => {
  const route = useRoute()
  const loading = ref(false)
  const documents = reactive<Array<any>>([])

  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }
  const paginator = reactive({ ...defaultPaginator })
  const loadDocuments = async (init: boolean = false) => {
    if (!init && paginator.current_page > paginator.total_page) return

    try {
      loading.value = true
      const resp = await getDocumentsWithPage(dataset_id, {
        current_page: (route.query?.current_page || 1) as number,
        page_size: (route.query?.page_size || 20) as number,
        search_word: (route.query?.search_word || '') as string,
      })
      const data = resp.data

      updatePaginator(data)

      documents.splice(0, documents.length, ...data.list)
    } finally {
      loading.value = false
    }
  }

  const initPaginator = () => {
    Object.assign(paginator, { ...defaultPaginator })
  }

  const updatePaginator = (data: any) => {
    paginator.current_page = data.paginator.current_page
    paginator.page_size = data.paginator.page_size
    paginator.total_page = data.paginator.total_page
    paginator.total_record = data.paginator.total_record
  }

  onMounted(async () => {
    await loadDocuments(true)
  })

  watch(
    () => route.query,
    async (newQuery, oldQuery) => {
      if (newQuery.search_word !== oldQuery.search_word) {
        initPaginator()
        await loadDocuments(true)
      } else if (newQuery.current_page !== oldQuery.current_page) {
        await loadDocuments()
      }
    },
  )
  return { loading, documents, paginator, loadDocuments }
}

export const useDeleteDocument = () => {
  const handleDelete = (dataset_id: string, document_id: string, callback?: () => void) => {
    Modal.warning({
      title: '是否删除？',
      content:
        '删除文档后，知识库/向量数据库将无法检索到该文档，如需暂时关闭该文档的检索，可以选择禁用功能',
      hideCancel: false,
      onOk: async () => {
        try {
          const resp = await deleteDocument(dataset_id, document_id)
          Message.success(resp.message)
        } finally {
          callback && callback()
        }
      },
    })
  }

  return { handleDelete }
}

export const useUpdateDocumentEnabled = () => {
  const handleUpdate = async (
    dataset_id: string,
    document_id: string,
    enabled: boolean,
    callback?: () => void,
  ) => {
    let resp
    try {
      resp = await updateDocumentEnabled(dataset_id, document_id, enabled)
      if (resp.code !== 'success') {
        Message.error(resp.message)
      } else {
        Message.success(resp.message)
      }
    } finally {
      callback && resp?.code === 'success' && callback()
    }
  }
  return { handleUpdate }
}
