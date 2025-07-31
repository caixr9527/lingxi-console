<script setup lang="ts">
import { nextTick, type PropType, ref, watch } from 'vue'
import { type GetDraftAppConfigResponse } from '@/models/app'
import { useUpdateDraftAppConfig } from '@/hooks/use-app'
import { Message } from '@arco-design/web-vue'
import { useGetAppsWithPage } from '@/hooks/use-app'
import { cloneDeep, isEqual } from 'lodash'

const props = defineProps({
  app_id: { type: String, default: '', required: true },
  agents: {
    type: Array as PropType<GetDraftAppConfigResponse['data']['agents']>,
    default: () => [],
    required: true,
  },
})
const emits = defineEmits(['update:agents'])
const { loading, apps, paginator, loadApps } = useGetAppsWithPage()
const { loading: updateDraftAppConfigLoading, handleUpdateDraftAppConfig } =
  useUpdateDraftAppConfig()
const appsModalVisible = ref(false)
const isAppsInit = ref(false)
const activateApps = ref<Record<string, any>[]>([])
const originApps = ref<Record<string, any>[]>([])

const handleScroll = async (event: UIEvent) => {
  const { scrollTop, scrollHeight, clientHeight } = event.target as HTMLElement

  if (scrollTop + clientHeight >= scrollHeight - 10) {
    if (loading.value) return
    await loadApps(false, '', 'published', 0)
  }
}

const isAppsModified = () => {
  return isEqual(activateApps.value, originApps.value)
}

const handleCancelAppsModal = () => {
  appsModalVisible.value = false
  activateApps.value = originApps.value
  isAppsInit.value = false
}

const handleSelectApp = (idx: number) => {
  const app = apps.value[idx]

  if (activateApps.value.some((activateApp) => activateApp.id === app.id)) {
    activateApps.value = activateApps.value.filter((activateApp) => activateApp.id !== app.id)
  } else {
    if (activateApps.value.length >= 5) {
      Message.warning('关联应用已超过5个，无法继续关联')
      return
    }
    activateApps.value.push({
      id: app.id,
      name: app.name,
      en_name: app.en_name,
      icon: app.icon,
      description: app.description,
    })
  }
}

const handleSubmitApps = async () => {
  try {
    // 处理数据并完成API接口提交
    await handleUpdateDraftAppConfig(props.app_id, {
      agents: activateApps.value.map((activateApp) => activateApp.id),
    })

    // 接口更新更新成功，同步表单信息
    originApps.value = activateApps.value
    await nextTick()

    // 双向同步更新props中的数据
    emits('update:agents', activateApps.value)

    //  隐藏模态窗
    handleCancelAppsModal()
  } catch (e) {
    /* empty */
  }
}

watch(
  () => props.agents,
  (newValue) => {
    // 检测数据是否初始化
    if (!isAppsInit.value || !isAppsModified()) {
      // 判断草稿配置是否已传递配置
      if (newValue && newValue.length > 0) {
        // 赋初始值
        const initData = props.agents.map((agent) => {
          return {
            id: agent.id,
            name: agent.name,
            en_name: agent.en_name,
            icon: agent.icon,
            description: agent.description,
          }
        })
        activateApps.value = cloneDeep(initData)
        originApps.value = cloneDeep(initData)

        // 修改初始化状态
        isAppsInit.value = true
      }
    }
  },
  { immediate: true, deep: true },
)

watch(
  () => appsModalVisible.value,
  async (newValue) => {
    // 显示状态，重新加载数据，获取最新的知识库列表
    if (newValue) {
      await loadApps(true, '', 'published', 0)
    } else {
      // 隐藏状态，清空数据
      apps.value.splice(0, apps.value.length)
    }
  },
)
</script>

<template>
  <div class="">
    <!-- 折叠面板 -->
    <a-collapse-item key="agents" class="app-ability-item">
      <template #header>
        <div class="text-gray-700 font-bold">协同智能体</div>
      </template>
      <template #extra>
        <a-button
          size="mini"
          type="text"
          class="!text-gray-700"
          @click.stop="appsModalVisible = true"
        >
          <template #icon>
            <icon-plus />
          </template>
        </a-button>
      </template>
      <div v-if="props.agents.length > 0" class="flex flex-col gap-1">
        <div
          v-for="(agent, idx) in props.agents"
          :key="agent.id"
          class="flex items-center justify-between bg-white p-3 rounded-lg cursor-pointer hover:shadow-sm group"
        >
          <!-- 左侧工具信息 -->
          <div class="flex items-center gap-2">
            <!-- 图标 -->
            <a-avatar
              :size="36"
              shape="square"
              class="rounded flex-shrink-0"
              :image-url="agent.icon"
            />
            <!-- 名称与描述信息 -->
            <div class="flex flex-col gap-1 h-9">
              <div class="text-gray-700 font-bold leading-[18px] line-clamp-1 break-all">
                {{ agent.name }}({{ agent.en_name }})
              </div>
              <div class="text-gray-500 text-xs line-clamp-1 break-all">
                {{ agent.description }}
              </div>
            </div>
          </div>
          <!-- 右侧按钮 -->
          <a-button
            size="mini"
            type="text"
            class="hidden group-hover:block flex-shrink-0 ml-2 !text-red-700 rounded"
            @click="
              async () => {
                // 清除props中指定的数据
                const newApps = [...props.agents]
                newApps.splice(idx, 1)

                // 提交草稿配置到接口
                await handleUpdateDraftAppConfig(props.app_id, {
                  agents: newApps.map((item) => item.id),
                })

                // 更新数据并确保数据完成更新
                isAppsInit = false
                emits('update:agents', newApps)
              }
            "
          >
            <template #icon>
              <icon-delete />
            </template>
          </a-button>
        </div>
      </div>
      <div v-else class="text-xs text-gray-500 leading-[22px]">
        在当前智能体应用中可以设置多个协同智能体英语，由当前智能体统一调度协调，以处理复杂逻辑。
      </div>
    </a-collapse-item>
    <!-- 工具设置模态窗 -->
    <a-modal
      :visible="appsModalVisible"
      hide-title
      :footer="false"
      :width="400"
      class="workflows-modal"
      modal-class="h-[calc(100vh-32px)] right-4"
      @cancel="handleCancelAppsModal"
    >
      <!-- 顶部标题 -->
      <div class="flex items-center justify-between mb-6">
        <div class="text-lg font-bold text-gray-700">选择协同Agent</div>
        <a-button type="text" class="!text-gray-700" size="small" @click="handleCancelAppsModal">
          <template #icon>
            <icon-close />
          </template>
        </a-button>
      </div>
      <!-- 中间应用容器 -->
      <div class="h-[calc(100vh-180px)] mb-4 overflow-scroll scrollbar-w-none">
        <a-spin
          :loading="loading"
          class="block h-full w-full scrollbar-w-none overflow-scroll"
          @scroll="handleScroll"
        >
          <!-- 应用列表 -->
          <div class="flex flex-col gap-2">
            <!-- 有数据UI状态 -->
            <div
              v-for="(app, idx) in apps"
              :key="app.id"
              :class="`flex items-center gap-2 border px-3 py-2 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-700 ${activateApps.some((activateApp) => activateApp.id === app.id) ? 'bg-blue-50 border-blue-700' : ''}`"
              @click="() => handleSelectApp(idx)"
            >
              <a-avatar
                :size="24"
                shape="square"
                class="flex-shrink-0 rounded"
                :image-url="app.icon"
              />
              <div class="line-clamp-1 text-gray-500 flex-1">{{ app.name }}({{ app.en_name }})</div>
            </div>
            <!-- 无数据UI状态 -->
            <a-empty
              v-if="apps.length === 0"
              description="没有可用的应用"
              class="h-[400px] flex flex-col items-center justify-center"
            />
          </div>
          <!-- 加载器 -->
          <a-row v-if="paginator.total_page >= 2">
            <!-- 加载数据中 -->
            <a-col
              v-if="paginator.current_page <= paginator.total_page"
              :span="24"
              class="!text-center"
            >
              <a-space class="my-4">
                <a-spin />
                <div class="text-gray-400">加载中</div>
              </a-space>
            </a-col>
            <!-- 数据加载完成 -->
            <a-col v-else :span="24" class="!text-center">
              <div class="text-gray-400 my-4">数据已加载完成</div>
            </a-col>
          </a-row>
        </a-spin>
      </div>
      <!-- 底部选中应用及按钮 -->
      <div class="flex items-center justify-between">
        <!-- 左侧提示文字 -->
        <div class="">{{ activateApps.length }} 个应用被选中</div>
        <!-- 按钮组 -->
        <a-space :size="12">
          <a-button class="rounded-lg" @click="handleCancelAppsModal">取消</a-button>
          <a-button
            :loading="updateDraftAppConfigLoading"
            type="primary"
            class="rounded-lg"
            @click="handleSubmitApps"
          >
            添加
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<style>
.workflows-modal {
  .arco-modal-wrapper {
    text-align: right;
  }
}
</style>
