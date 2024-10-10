<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { getCategories, getBuiltinTools } from '@/services/builtin-tool'
import { apiPrefix } from '@/config'
import moment from 'moment'

const categories = reactive<Array<any>>([])
const providers = reactive<Array<any>>([])

const loading = ref<boolean>(false)
const category = ref<string>('all')
const search_word = ref<string>('')
const filterProviders = computed(() => {
  return providers.filter((item) => {
    const matchCategory = category.value === 'all' || item.category === category.value
    const mathcSearchWord =
      search_word.value === '' || item.label.toLowerCase().includes(search_word.value)
    return matchCategory && mathcSearchWord
  })
})

onMounted(async () => {
  try {
    loading.value = true
    const categoriesResp = await getCategories()
    Object.assign(categories, categoriesResp.data)
    const builtinToolsResp = await getBuiltinTools()
    Object.assign(providers, builtinToolsResp.data)
  } finally {
    loading.value = false
  }
})
</script>
<template>
  <a-spin :loading="loading" class="block h-full w-full">
    <div class="p-6 flex flex-col">
      <!-- 顶层标题+创建按钮 -->
      <div class="flex items-center justify-between mb-6">
        <!-- 左侧标题 -->
        <div class="flex items-center gap-2">
          <a-avatar :size="32" class="bg-blue-700">
            <icon-common :size="18" />
          </a-avatar>
          <div class="text-lg font-medium text-gray-900">插件广场</div>
        </div>
        <!-- 创建按钮 -->
        <a-button type="primary" class="rounded-lg">创建自定义插件</a-button>
      </div>
      <!-- 插件分类+搜索框 -->
      <div class="flex items-center justify-between mb-6">
        <!-- 左侧分类 -->
        <div class="flex items-center gap-2">
          <a-button
            :type="category === 'all' ? 'secondary' : 'text'"
            class="rounded-lg !text-gray-700 px-3"
            @click="category = 'all'"
            >全部</a-button
          >
          <a-button
            v-for="itme in categories"
            :key="itme.category"
            :type="category === itme.category ? 'secondary' : 'text'"
            class="rounded-lg !text-gray-700 px-3"
            @click="category = itme.category"
          >
            {{ itme.name }}
          </a-button>
        </div>
        <!-- 右侧搜索 -->
        <a-input-search
          v-model="search_word"
          placeholder="请输入插件名称"
          class="w-[240px] bg-white rounded-lg border-gary-300"
        >
        </a-input-search>
      </div>
      <!-- 底部插件列表 -->
      <a-row :gutter="[20, 20]" class="flex-1">
        <!-- 有数据 -->
        <a-col v-for="provider in filterProviders" :key="provider.name" :span="6">
          <a-card hoverable class="cursor-pointer rounded-lg">
            <!-- 顶部提供商名称 -->
            <div class="flex items-center gap-3 mb-3">
              <!-- 左侧图标 -->
              <a-avatar :size="40" shape="square" :style="{ backgroundColor: provider.background }">
                <img
                  :src="`${apiPrefix}/builtin-tools/${provider.name}/icon`"
                  :alt="provider.name"
                />
              </a-avatar>
              <!-- 右侧工具信息 -->
              <div class="flex flex-col">
                <div class="text-base text-gray-900 font-bold">{{ provider.label }}</div>
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
                发布时间 {{ moment(provider.created_at).format('MM-DD HH:mm') }}
              </div>
            </div>
          </a-card>
        </a-col>
        <!-- 无数据 -->
        <a-col v-if="filterProviders.length === 0" :span="24">
          <a-empty
            description="没有可用的内置插件"
            class="h-[400px] flex flex-col items-center justify-center"
          />
        </a-col>
      </a-row>
    </div>
  </a-spin>
</template>
<style scoped></style>
