<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { ref, watch } from 'vue'

const route = useRoute()
const router = useRouter()
const createType = ref<string>('')
const searchWord = ref(route.query?.search_word || '')

const search = (value: any) => {
  router.push({
    path: route.path,
    query: {
      search_word: value,
    },
  })
}

const updateCreateType = (value: string) => {
  createType.value = value
}

watch(
  () => route.query?.search_word,
  () => {
    searchWord.value = route.query.search_word || ''
  },
)
</script>
<template>
  <div class="px-6 flex flex-col overflow-hidden h-full">
    <div class="pt-6 sticky top-0 z-20 bg-gray-50">
      <!-- 顶层标题+创建按钮 -->
      <div class="flex items-center justify-between mb-6">
        <!-- 左侧标题 -->
        <div class="flex items-center gap-2">
          <a-avatar :size="32" class="bg-blue-700">
            <icon-user :size="18" />
          </a-avatar>
          <div class="text-lg font-medium text-gray-900">个人空间</div>
        </div>
        <!-- 创建按钮 -->
        <a-button
          v-if="route.path.startsWith('/space/apps')"
          type="primary"
          class="rounded-lg"
          @click="createType = 'app'"
        >
          创建 AI 应用
        </a-button>
        <a-button
          v-if="route.path.startsWith('/space/tools')"
          type="primary"
          class="rounded-lg"
          @click="createType = 'tool'"
        >
          创建自定义插件
        </a-button>
        <a-button
          v-if="route.path.startsWith('/space/workflows')"
          type="primary"
          class="rounded-lg"
          @click="createType = 'workflow'"
        >
          创建工作流
        </a-button>
        <a-button
          v-if="route.path.startsWith('/space/datasets')"
          type="primary"
          class="rounded-lg"
          @click="createType = 'dataset'"
        >
          创建知识库
        </a-button>
      </div>
      <!-- 导航按钮+搜索框 -->
      <div class="flex items-center justify-between mb-6">
        <!-- 左侧导航 -->
        <div class="flex items-center gap-2">
          <router-link
            to="/space/apps"
            class="rounded-lg text-gray-700 px-3 h-8 leading-8 hover:bg-gray-200 transition-all"
            active-class="bg-gray-100"
          >
            AI应用
          </router-link>
          <router-link
            to="/space/tools"
            class="rounded-lg text-gray-700 px-3 h-8 leading-8 hover:bg-gray-200 transition-all"
            active-class="bg-gray-100"
          >
            插件
          </router-link>
          <router-link
            to="/space/workflows"
            class="rounded-lg text-gray-700 px-3 h-8 leading-8 hover:bg-gray-200 transition-all"
            active-class="bg-gray-100"
          >
            工作流
          </router-link>
          <router-link
            to="/space/datasets"
            class="rounded-lg text-gray-700 px-3 h-8 leading-8 hover:bg-gray-200 transition-all"
            active-class="bg-gray-100"
          >
            知识库
          </router-link>
        </div>
        <!-- 右侧搜索 -->
        <a-input-search
          v-model="searchWord"
          placeholder="请输入搜索词"
          class="w-[240px] bg-white rounded-lg border-gary-300"
          @search="search"
        >
        </a-input-search>
      </div>
    </div>
    <!-- 中间内容 -->
    <router-view v-model:create-type="createType" />
  </div>
</template>
<style scoped></style>
