import { ref } from 'vue'
import {
  createDataset,
  createDocuments,
  createSegment,
  deleteDataset,
  deleteDocument,
  deleteSegment,
  getDataset,
  getDatasetQueries,
  getDatasetsWithPage,
  getDocument,
  getDocumentsStatus,
  getDocumentsWithPage,
  getSegment,
  getSegmentsWithPage,
  hit,
  updateDataset,
  updateDocumentEnabled,
  updateDocumentName,
  updateSegment,
  updateSegmentEnabled,
} from '@/services/dataset'
import { Form, Message, Modal } from '@arco-design/web-vue'
import type {
  CreateDocumentsRequest,
  CreateSegmentRequest,
  GetDocumentsWithPageRequest,
  HitRequest,
  UpdateSegmentRequest,
} from '@/models/dataset'

export const useGetDatasetsWithPage = () => {
  const loading = ref(false)
  const datasets = ref<Record<string, any>[]>([])
  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }
  const paginator = ref(defaultPaginator)

  const loadDatasets = async (init: boolean = false, search_word: string = '') => {
    if (init) {
      paginator.value = defaultPaginator
    } else if (paginator.value.current_page > paginator.value.total_page) {
      return
    }

    try {
      loading.value = true
      const resp = await getDatasetsWithPage(
        paginator.value.current_page,
        paginator.value.page_size,
        search_word,
      )
      const data = resp.data

      paginator.value = data.paginator

      if (paginator.value.current_page <= paginator.value.total_page) {
        paginator.value.current_page += 1
      }

      if (init) {
        datasets.value = data.list
      } else {
        datasets.value.push(...data.list)
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, datasets, paginator, loadDatasets }
}

export const useDeleteDataset = () => {
  const handleDelete = (dataset_id: string, callback?: () => void) => {
    Modal.warning({
      title: '要删除知识库吗?',
      content:
        '删除知识库后，关联该知识库的应用将无法再使用该知识库，所有的提示配置和文档都将被永久删除',
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

export const useCreateOrUpdateDataset = () => {
  const loading = ref(false)
  const defaultForm = {
    fileList: [] as any,
    icon: '',
    name: '',
    description: '',
  }
  const form = ref(defaultForm)
  const formRef = ref<InstanceType<typeof Form>>()
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
          icon: form.value.icon,
          name: form.value.name,
          description: form.value.description,
        })
        Message.success(resp.message)
      } else {
        const resp = await createDataset({
          icon: form.value.icon,
          name: form.value.name,
          description: form.value.description,
        })
        Message.success(resp.message)
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, form, formRef, saveDataset, showUpdateModal, updateShowUpdateModal }
}

export const useGetDataset = () => {
  const loading = ref(false)
  const dataset = ref<Record<string, any>>({})

  const loadDataset = async (dataset_id: string) => {
    try {
      loading.value = true
      const resp = await getDataset(dataset_id)
      dataset.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, dataset, loadDataset }
}

export const useGetDocumentsWithPage = () => {
  const loading = ref(false)
  const documents = ref<Record<string, any>[]>([])
  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }
  const paginator = ref(defaultPaginator)

  const loadDocuments = async (
    dataset_id: string,
    req: GetDocumentsWithPageRequest = {
      current_page: 1,
      page_size: 20,
      search_word: '',
    },
  ) => {
    try {
      loading.value = true
      const resp = await getDocumentsWithPage(dataset_id, req)
      const data = resp.data

      paginator.value = data.paginator
      documents.value = data.list
    } finally {
      loading.value = false
    }
  }

  return { loading, documents, paginator, loadDocuments }
}

export const useDeleteDocument = () => {
  const handleDelete = (dataset_id: string, document_id: string, callback?: () => void) => {
    Modal.warning({
      title: '要删除该文档吗?',
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
    try {
      const resp = await updateDocumentEnabled(dataset_id, document_id, enabled)
      Message.success(resp.message)
    } finally {
      callback && callback()
    }
  }
  return { handleUpdate }
}

export const useGetDocument = () => {
  const loading = ref(false)
  const document = ref<Record<string, any>>({})

  const loadDocument = async (dataset_id: string, document_id: string) => {
    try {
      loading.value = true
      const resp = await getDocument(dataset_id, document_id)
      document.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, document, loadDocument }
}

export const useGetSegmentsWithPage = () => {
  const loading = ref(false)
  const segments = ref<Record<string, any>>([])
  const defaultPaginator = {
    current_page: 1,
    page_size: 20,
    total_page: 0,
    total_record: 0,
  }
  const paginator = ref(defaultPaginator)

  const loadSegments = async (
    dataset_id: string,
    document_id: string,
    init: boolean = false,
    search_word: string = '',
  ) => {
    if (init) {
      paginator.value = defaultPaginator
    } else if (paginator.value.current_page > paginator.value.total_page) {
      return
    }

    try {
      loading.value = true
      const resp = await getSegmentsWithPage(dataset_id, document_id, {
        current_page: paginator.value.current_page,
        page_size: paginator.value.page_size,
        search_word: search_word,
      })
      const data = resp.data

      paginator.value = data.paginator

      if (paginator.value.current_page <= paginator.value.total_page) {
        paginator.value.current_page += 1
      }

      if (init) {
        segments.value = data.list
      } else {
        segments.value.push(...data.list)
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, segments, paginator, loadSegments }
}

export const useDeleteSegment = () => {
  const handleDelete = async (
    dataset_id: string,
    document_id: string,
    segment_id: string,
    callback?: () => void,
  ) => {
    Modal.warning({
      title: '要删除该文档片段吗?',
      content:
        '删除文档文档后，知识库/向量数据库将无法检索到该文档，如需暂时关闭该文档的检索，可以选择禁用功能。',
      hideCancel: false,
      onOk: async () => {
        try {
          const resp = await deleteSegment(dataset_id, document_id, segment_id)
          Message.success(resp.message)
        } finally {
          callback && callback()
        }
      },
    })
  }

  return { handleDelete }
}

export const useUpdateSegmentEnabled = () => {
  const handleUpdate = async (
    dataset_id: string,
    document_id: string,
    segment_id: string,
    enabled: boolean,
    callback?: () => void,
  ) => {
    try {
      const resp = await updateSegmentEnabled(dataset_id, document_id, segment_id, enabled)
      Message.success(resp.message)
    } finally {
      callback && callback()
    }
  }

  return { handleUpdate }
}

export const useGetDatasetQueries = () => {
  const loading = ref(false)
  const queries = ref<Record<string, any>[]>([])

  const loadDatasetQueries = async (dataset_id: string) => {
    try {
      loading.value = true
      const resp = await getDatasetQueries(dataset_id)
      queries.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, queries, loadDatasetQueries }
}

export const useHit = () => {
  const loading = ref(false)
  const hits = ref<Record<string, any>[]>([])

  const handleHit = async (dataset_id: string, req: HitRequest) => {
    try {
      loading.value = true
      const resp = await hit(dataset_id, req)
      hits.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, hits, handleHit }
}

export const useCreateSegment = () => {
  const loading = ref(false)

  const handleCreateSegment = async (
    dataset_id: string,
    document_id: string,
    req: CreateSegmentRequest,
  ) => {
    try {
      loading.value = true
      const resp = await createSegment(dataset_id, document_id, req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleCreateSegment }
}

export const useUpdateSegment = () => {
  const loading = ref(false)

  const handleUpdateSegment = async (
    dataset_id: string,
    document_id: string,
    segment_id: string,
    req: UpdateSegmentRequest,
  ) => {
    try {
      loading.value = true
      const resp = await updateSegment(dataset_id, document_id, segment_id, req)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateSegment }
}

export const useGetSegment = () => {
  const loading = ref(false)
  const segment = ref<Record<string, any>>({})

  const loadSegment = async (dataset_id: string, document_id: string, segment_id: string) => {
    try {
      loading.value = true
      const resp = await getSegment(dataset_id, document_id, segment_id)
      segment.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, segment, loadSegment }
}

export const useCreateDocuments = () => {
  const loading = ref(false)
  const create_documents_result = ref<Record<string, any>>({})

  const handleCreateDocuments = async (dataset_id: string, req: CreateDocumentsRequest) => {
    try {
      loading.value = true
      const resp = await createDocuments(dataset_id, req)
      create_documents_result.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, create_documents_result, handleCreateDocuments }
}

export const useGetDocumentsStatus = () => {
  const loading = ref(false)
  const documents_status_result = ref<Record<string, any>[]>([])

  const loadDocumentsStatus = async (dataset_id: string, batch: string) => {
    try {
      loading.value = true
      const resp = await getDocumentsStatus(dataset_id, batch)
      documents_status_result.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, documents_status_result, loadDocumentsStatus }
}

export const useUpdateDocumentName = () => {
  const loading = ref(false)

  const handleUpdateDocumentName = async (
    dataset_id: string,
    document_id: string,
    name: string,
  ) => {
    try {
      loading.value = true
      const resp = await updateDocumentName(dataset_id, document_id, name)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateDocumentName }
}
