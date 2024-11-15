import {
  createDataset,
  deleteDataset,
  getDatasetsWithPage,
  updateDataset,
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
    icon: 'https://picsum.photos/400',
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
        const resp = await updateDataset(dataset_id, form)
        Message.success(resp.message)
      } else {
        const resp = await createDataset(form)
        Message.success(resp.message)
      }
    } finally {
      loading.value = false
    }
  }

  return { loading, form, formRef, saveDataset, showUpdateModal, updateShowUpdateModal }
}
