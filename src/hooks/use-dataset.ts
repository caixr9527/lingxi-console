import { getDatasetsWithPage } from '@/services/dataset'
import { reactive, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'

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
