<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { getApiToolProvidersWithPage } from '@/services/api-tool'
import moment from 'moment'
import { typeMap } from '@/config'

const providers = reactive<Array<any>>([])
const loading = ref<boolean>(false)
const showIndex = ref<number>(-1)

onMounted(async () => {
  try {
    loading.value = true
    const resp = await getApiToolProvidersWithPage()
    Object.assign(providers, resp.data.list)
  } finally {
    loading.value = false
  }
})
</script>
<template>
  <a-spin :loading="loading" class="block h-full w-full">
    <!-- 底部插件列表 -->
    <a-row :gutter="[20, 20]" class="flex-1">
      <!-- 有数据 -->
      <a-col v-for="(provider, idx) in providers" :key="provider.name" :span="6">
        <a-card hoverable class="cursor-pointer rounded-lg" @click="showIndex = idx">
          <!-- 顶部提供商名称 -->
          <div class="flex items-center gap-3 mb-3">
            <!-- 左侧图标 -->
            <a-avatar :size="40" shape="square" :image-url="provider.icon" />
            <!-- 右侧工具信息 -->
            <div class="flex flex-col">
              <div class="text-base text-gray-900 font-bold">{{ provider.name }}</div>
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
              编辑时间 {{ moment(provider.created_at).format('MM-DD HH:mm') }}
            </div>
          </div>
        </a-card>
      </a-col>
      <!-- 无数据 -->
      <a-col v-if="providers.length === 0" :span="24">
        <a-empty
          description="没有可用的API插件"
          class="h-[400px] flex flex-col items-center justify-center"
        />
      </a-col>
    </a-row>
    <!-- 卡片抽屉 -->
    <a-drawer
      :visible="showIndex != -1"
      :width="350"
      :footer="false"
      title="工具详情"
      :drawer-style="{ background: '#F9FAFB' }"
      @cancel="showIndex = -1"
    >
      <div v-if="showIndex !== -1">
        <!-- 顶部提供商名称 -->
        <div class="flex items-center gap-3 mb-3">
          <!-- 左侧图标 -->
          <a-avatar :size="40" shape="square" :image-url="providers[showIndex].icon" />
          <!-- 右侧工具信息 -->
          <div class="flex flex-col">
            <div class="text-base text-gray-900 font-bold">
              {{ providers[showIndex].name }}
            </div>
            <div class="text-xs text-gray-500 line-clamp-1">
              {{ providers[showIndex].name }} ▪️ {{ providers[showIndex].tools.length }} 插件
            </div>
          </div>
        </div>
        <!-- 提供商描述信息 -->
        <div class="leading-[18px] text-gray-500 mb-2">
          {{ providers[showIndex].description }}
        </div>
        <!-- 分隔符 -->
        <hr class="my-4" />
        <!-- 提供者工具列表 -->
        <div class="flex flex-col gap-2">
          <div class="text-xs text-gray-500">
            包含 {{ providers[showIndex].tools.length }} 个工具
          </div>
          <!-- 工具列表 -->
          <a-card
            v-for="tool in providers[showIndex].tools"
            :key="tool.name"
            class="cursor-pointer flex flex-col rounded-xl"
          >
            <!-- 工具名称 -->
            <div class="font-bold text-gray-900 mb-2">{{ tool.name }}</div>
            <!-- 工具描述 -->
            <div class="text-gray-500 text-xs">{{ tool.description }}</div>
            <!-- 工具参数 -->
            <div v-if="tool.inputs.length > 0" class="">
              <!-- 分隔符 -->
              <div class="flex items-center gap-2 my-4">
                <div class="text-xs font-bold text-gray-500">参数</div>
                <hr class="flex-1" />
              </div>
              <!-- 参数列表 -->
              <div class="flex flex-col gap-4">
                <div v-for="input in tool.inputs" :key="input.name" class="flex flex-col gap-2">
                  <!-- 上半部分 -->
                  <div class="flex items-center gap-2 text-xs">
                    <div class="text-gray-900 font-bold">{{ input.name }}</div>
                    <div class="text-gray-500">{{ input.type }}</div>
                    <div v-if="input.required" class="text-red-700">必填</div>
                  </div>
                  <!-- 下半部分 -->
                  <div class="text-xs text-gary-500">{{ input.description }}</div>
                </div>
              </div>
            </div>
          </a-card>
        </div>
      </div>
    </a-drawer>
  </a-spin>
</template>
<style scoped></style>
