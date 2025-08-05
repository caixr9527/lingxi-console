<script setup lang="ts">
import { useRoute } from 'vue-router'
import moment from 'moment'
import { useGetApp, usePublish, useCancelPublish, useUpdateApp } from '@/hooks/use-app'
import PublishHistoryDrawer from '@/views/space/apps/components/PublishHistoryDrawer.vue'
import { onMounted, ref } from 'vue'
import router from '@/router'
import { Modal } from '@arco-design/web-vue'

const route = useRoute()
const publishHistoryDrawerVisible = ref(false)
const { loading, app, loadApp } = useGetApp()
const { handleUpdateApp } = useUpdateApp()
const { loading: publishLoading, handlePublish } = usePublish()
const { handleCancelPublish } = useCancelPublish()

const updateMode = async () => {
  await handleUpdateApp(String(route.params?.app_id), {
    mode: app.value.mode,
    name: app.value.name,
    en_name: app.value.en_name,
    icon: app.value.icon,
    description: app.value.description,
  })
}

onMounted(async () => {
  await loadApp(String(route.params?.app_id))
})
</script>

<template>
  <!-- 外层容器 -->
  <div class="min-h-screen flex flex-col h-full overflow-hidden">
    <!-- 顶部导航 -->
    <div class="h-[77px] bg-gray-50 p-4 flex items-center justify-between relative border-b">
      <!-- 左侧应用信息 -->
      <div class="flex items-center gap-2">
        <!-- 回退按钮 -->
        <a-button
          size="mini"
          @click="
            () => {
              if (app.status === 'republish') {
                Modal.warning({
                  title: '要返回到应用列表吗?',
                  content: '应用已被修改，请重新发布。',
                  hideCancel: false,
                  okText: '发布',
                  onOk: async () => {
                    const app_id = String(route.params?.app_id)
                    await handlePublish(app_id)
                    app.status = 'publish'
                  },
                })
              } else {
                router.push({ name: 'space-apps-list' })
              }
            }
          "
        >
          <template #icon>
            <icon-left />
          </template>
        </a-button>
        <!-- 应用容器 -->
        <div class="flex items-center gap-3">
          <!-- 应用图标 -->
          <a-avatar :size="40" shape="square" class="rounded-lg" :image-url="app.icon" />
          <!-- 应用信息 -->
          <div class="flex flex-col justity-between h-[40px]">
            <a-skeleton-line v-if="loading" :widths="[100]" />

            <div v-else class="text-gray-700 font-bold pb-2">
              <a-space>
                {{ app.name }}
                <a-select
                  class="rounded-lg"
                  size="mini"
                  v-model:model-value="app.mode"
                  @change="
                    () => {
                      updateMode()
                      app.status = 'republish'
                    }
                  "
                >
                  <a-option :value="0">单Agent模式</a-option>
                  <a-option :value="1">Supervisor模式(Beta)</a-option>
                </a-select>
                <a-tooltip position="bottom">
                  <template #content>
                    <p>
                      单Agent模式:
                      用户与大模型进行对话，由一个大模型自主思考决策，适用于较为简单的业务逻辑。
                    </p>
                    <p>
                      Supervisor模式:
                      在一个智能体中设置多个Agent，由Supervisor统一调度协调，以处理复杂逻辑。
                    </p>
                  </template>
                  <icon-question-circle />
                </a-tooltip>
              </a-space>
            </div>
            <div v-if="loading" class="flex item-center gap-2">
              <a-skeleton-line :widths="[60]" :line-height="18" />
              <a-skeleton-line :widths="[60]" :line-height="18" />
              <a-skeleton-line :widths="[60]" :line-height="18" />
            </div>
            <div v-else class="flex item-center gap-2">
              <div class="flex items-center h-[18px] text-xs text-gray-500">
                <icon-user />
                个人空间
              </div>
              <div class="flex items-center h-[18px] text-xs text-gray-500">
                <icon-schedule />
                {{ app.status === 'draft' ? '草稿' : '已发布' }}
              </div>
              <a-tag size="small" class="rounded h-[18px] leading-[18px] bg-gray-200 text-gray-500">
                已自动保存 {{ moment(app.draft_updated_at * 1000).format('HH:mm:ss') }}
              </a-tag>
            </div>
          </div>
        </div>
      </div>
      <!-- 导航菜单 -->
      <div class="absolute left-1/2 -translate-x-1/2">
        <a-space :size="12">
          <router-link
            :to="{ name: 'space-apps-detail', params: { app_id: String(route.params?.app_id) } }"
            class="text-base font-bold text-gray-500"
            active-class="!text-blue-700"
          >
            编排
          </router-link>
          <router-link
            :to="{ name: 'space-apps-published', params: { app_id: String(route.params?.app_id) } }"
            class="text-base font-bold text-gray-500"
            active-class="!text-blue-700"
          >
            发布配置
          </router-link>
          <router-link
            :to="{ name: 'space-apps-analysis', params: { app_id: String(route.params?.app_id) } }"
            class="text-base font-bold text-gray-500"
            active-class="!text-blue-700"
          >
            统计分析
          </router-link>
        </a-space>
      </div>
      <!-- 右侧按钮信息 -->
      <div class="">
        <a-space :size="12">
          <a-button
            :disabled="loading"
            class="rounded-lg"
            @click="publishHistoryDrawerVisible = true"
          >
            <template #icon>
              <icon-schedule />
            </template>
          </a-button>
          <a-button-group>
            <a-button
              :disabled="loading"
              :loading="publishLoading"
              type="primary"
              class="!rounded-tl-lg !rounded-bl-lg"
              @click="
                async () => {
                  const app_id = String(route.params?.app_id)
                  await handlePublish(app_id)
                  await loadApp(app_id)
                }
              "
            >
              <template #icon>
                <icon-exclamation-circle-fill
                  v-if="app.status === 'republish'"
                  class="text-red-500"
                />
              </template>
              更新发布
            </a-button>
            <a-dropdown position="br">
              <a-button type="primary" class="!rounded-tr-lg !rounded-br-lg !w-5">
                <template #icon>
                  <icon-down />
                </template>
              </a-button>
              <template #content>
                <a-doption
                  :disabled="app.status === 'draft'"
                  class="!text-red-700"
                  @click="
                    async () => {
                      const app_id = String(route.params?.app_id)
                      await handleCancelPublish(app_id, async () => await loadApp(app_id))
                    }
                  "
                >
                  取消发布
                </a-doption>
              </template>
            </a-dropdown>
          </a-button-group>
        </a-space>
      </div>
    </div>
    <!-- 底部内容区 -->
    <router-view :app="app" v-model:status="app.status" />
    <!-- 发布历史抽屉组件 -->
    <publish-history-drawer
      :app="app"
      v-model:visible="publishHistoryDrawerVisible"
      @load-draft-app-config="() => {}"
    />
  </div>
</template>

<style scoped></style>
