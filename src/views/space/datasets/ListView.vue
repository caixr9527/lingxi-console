<script setup lang="ts">
import moment from 'moment'
import { useGetDatasetWithPage } from '@/hooks/use-dataset'

const { loading, datasets, paginator, loadDatasets } = useGetDatasetWithPage()

const handleScroll = async (event: any) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target
  if (scrollTop + clientHeight >= scrollHeight - 10) {
    if (loading.value) {
      return
    }
    await loadDatasets()
  }
}
</script>
<template>
  <a-spin
    :loading="loading"
    class="block h-full w-full scrollbar-w-none overflow-scroll"
    @scroll="handleScroll"
  >
    <!-- 底部知识库列表 -->
    <a-row :gutter="[20, 20]" class="flex-1">
      <!-- 有数据 -->
      <a-col v-for="dataset in datasets" :key="dataset.id" :span="6">
        <a-card hoverable class="cursor-pointer rounded-lg">
          <!-- 顶部知识库名称 -->
          <div class="flex items-center gap-3 mb-3">
            <!-- 左侧图标 -->
            <a-avatar :size="40" shape="square" :image-url="dataset.icon" />
            <!-- 右侧知识库信息 -->
            <div class="flex flex-1 justify-between">
              <div class="flex flex-col">
                <div class="text-base text-gray-900 font-bold">{{ dataset.name }}</div>
                <div class="text-xs text-gray-500 line-clamp-1">
                  {{ dataset.document_count }} 文档 -
                  {{ Math.round(dataset.character_count / 1000) }} 千字符 -
                  {{ dataset.related_app_count }} 关联应用
                </div>
              </div>
              <!-- 操作按钮 -->
              <a-dropdown position="br">
                <a-button type="text" size="small" class="rounded-lg !text-gray-700">
                  <template #icon>
                    <icon-more />
                  </template>
                </a-button>
                <template #content>
                  <a-doption>设置</a-doption>
                  <a-doption class="!text-red-500">删除</a-doption>
                </template>
              </a-dropdown>
            </div>
          </div>
          <!-- 知识库描述信息 -->
          <div class="leading-[18px] text-gray-500 h-[72px] line-clamp-4 mb-2">
            {{ dataset.description }}
          </div>
          <!-- 知识库的发布信息 -->
          <div class="flex items-center gap-1.5">
            <a-avatar :size="18" class="bg-blue-700">
              <icon-user />
            </a-avatar>
            <div class="text-xs text-gray-400">
              最近编辑 {{ moment(dataset.created_at).format('MM-DD HH:mm') }}
            </div>
          </div>
        </a-card>
      </a-col>
      <!-- 无数据 -->
      <a-col v-if="datasets.length === 0" :span="24">
        <a-empty
          description="没有可用的知识库"
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
  </a-spin>
</template>
<style scoped></style>
