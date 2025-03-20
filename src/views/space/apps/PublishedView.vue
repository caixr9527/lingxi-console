<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGetPublishedConfig, useRegenerateWebAppToken } from '@/hooks/use-app'
import { useGetWechatConfig, useUpdateWechatConfig } from '@/hooks/use-platform'

const route = useRoute()
const router = useRouter()
const wechatConfigModalVisible = ref(false)
const wechatConfigForm = ref({
  wechat_app_id: '',
  wechat_app_secret: '',
  wechat_token: '',
})

const {
  loading: getPublishedConfigLoading,
  published_config,
  loadPublishedConfig,
} = useGetPublishedConfig()
const {
  loading: regenerateWebAppTokenLoading,
  token,
  handleRegenerateWebAppToken,
} = useRegenerateWebAppToken()
const { loading: getWechatConfigLoading, wechat_config, loadWechatConfig } = useGetWechatConfig()
const { loading: updateWechatConfigLoading, handleUpdateWechatConfig } = useUpdateWechatConfig()
const webAppUrl = computed(() => {
  if (published_config.value?.web_app?.status === 'published') {
    return getFullPath('web-apps-index', {
      token: published_config.value?.web_app?.token,
    })
  }
  return ''
})

const getFullPath = (name: string, params = {}, query = {}) => {
  // 通过 router.resolve 获取路由的完整路径
  const { href } = router.resolve({ name, params, query })

  // 如果需要包括 host 部分，结合 window.location.origin
  return window.location.origin + href
}

const handleShowWechatConfigModal = async () => {
  // 调用api接口获取微信配置
  await loadWechatConfig(String(route.params?.app_id))

  // 更新表单配置
  wechatConfigForm.value = {
    wechat_app_id: wechat_config.value.wechat_app_id,
    wechat_app_secret: wechat_config.value.wechat_app_secret,
    wechat_token: wechat_config.value.wechat_token,
  }

  wechatConfigModalVisible.value = true
}

const handleCancelWechatConfigModal = () => {
  wechatConfigModalVisible.value = false
}

// 定义提交微信配置模态窗处理器
const handleSubmitWechatConfigModal = async () => {
  // 调用hooks完成数据上传
  await handleUpdateWechatConfig(String(route.params?.app_id), {
    wechat_app_id: wechatConfigForm.value.wechat_app_id,
    wechat_app_secret: wechatConfigForm.value.wechat_app_secret,
    wechat_token: wechatConfigForm.value.wechat_token,
  })

  handleCancelWechatConfigModal()

  // 重新调用获取微信公众号配置接口
  await loadWechatConfig(String(route.params?.app_id))
}

onMounted(() => {
  loadPublishedConfig(String(route.params?.app_id))
  loadWechatConfig(String(route.params?.app_id))
})
</script>

<template>
  <div class="bg-white flex-1 w-full min-h-0 px-6 py-5">
    <!-- 顶部提示信息 -->
    <a-alert class="mb-5">
      如应用访问链接或二维码意外泄露，请及时重新生成或进行停止分发，避免资源出现异常消耗
    </a-alert>
    <!-- 发布渠道列表 -->
    <a-spin :loading="getPublishedConfigLoading" class="w-full">
      <table class="w-full">
        <thead>
          <tr class="h-10 bg-gray-100">
            <th class="font-normal text-left px-4 text-gray-700 border-r border-white">发布渠道</th>
            <th class="font-normal text-left px-4 text-gray-700 border-r border-white">状态</th>
            <th class="font-normal text-left px-4 text-gray-700">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b">
            <td class="py-3 px-4 w-2/3">
              <div class="flex items-center gap-2">
                <a-avatar :size="36" shape="square" class="bg-blue-100">
                  <icon-compass :size="18" class="text-blue-700" />
                </a-avatar>
                <div class="flex flex-col">
                  <div class="text-gray-700 font-semibold">网页版</div>
                  <div class="text-gray-500">可通过访问PC网页立即开始对话。</div>
                </div>
              </div>
            </td>
            <td class="py-3 px-4 w-1/12">
              <a-tag v-if="published_config?.web_app?.status !== 'published'" color="gray" bordered>
                <template #icon>
                  <icon-minus-circle />
                </template>
                未发布
              </a-tag>
              <a-tag v-else color="blue" bordered>
                <template #icon>
                  <icon-check-circle-fill />
                </template>
                已发布
              </a-tag>
            </td>
            <td class="py-3 px-4">
              <div class="flex items-center gap-3">
                <!-- 左侧URL链接 -->
                <div class="flex items-center">
                  <div
                    class="bg-gray-100 h-8 leading-8 px-3 rounded-tl-lg rounded-bl-lg text-gray-700 w-[300px] max-w-[360px] line-clamp-1 break-all"
                  >
                    <template v-if="published_config?.web_app?.status === 'published'">
                      {{ webAppUrl }}
                    </template>
                    <template v-else>应用未发布，无可访问链接</template>
                  </div>
                  <a-button
                    :loading="regenerateWebAppTokenLoading"
                    :disabled="published_config?.web_app?.status !== 'published'"
                    type="primary"
                    class="rounded-tr-lg rounded-br-lg px-2"
                    @click="
                      async () => {
                        // 1.调用API接口发起请求
                        await handleRegenerateWebAppToken(String(route.params?.app_id))

                        // 2.更新web_app对应token的值
                        published_config.web_app.token = token
                      }
                    "
                  >
                    重新生成
                  </a-button>
                </div>
                <!-- 右侧访问按钮 -->
                <a-button
                  class="rounded-lg px-2"
                  :disabled="published_config?.web_app?.status !== 'published'"
                >
                  <template v-if="published_config?.web_app?.status !== 'published'">
                    立即访问
                  </template>
                  <template v-else>
                    <a :href="webAppUrl" target="_blank">立即访问</a>
                  </template>
                </a-button>
              </div>
            </td>
          </tr>
          <tr class="border-b">
            <td class="py-3 px-4 w-2/3">
              <div class="flex items-center gap-2">
                <a-avatar :size="36" shape="square" class="bg-green-100">
                  <icon-wechat :size="18" class="text-green-700" />
                </a-avatar>
                <div class="flex flex-col">
                  <div class="text-gray-700 font-semibold">微信公众号（订阅号、服务号）</div>
                  <div class="text-gray-500">
                    接入微信公众号，自动回复用户消息，助理高效私域运营。
                  </div>
                </div>
              </div>
            </td>
            <td class="py-3 px-4 w-1/12">
              <a-tag v-if="wechat_config?.status !== 'configured'" color="gray" bordered>
                <template #icon>
                  <icon-minus-circle />
                </template>
                未配置
              </a-tag>
              <a-tag v-else color="blue" bordered>
                <template #icon>
                  <icon-check-circle-fill />
                </template>
                已配置
              </a-tag>
            </td>
            <td class="py-3 px-4">
              <div class="flex items-center gap-3">
                <!-- 立即配置 -->
                <a-button
                  :loading="getWechatConfigLoading"
                  type="primary"
                  class="rounded-lg px-2"
                  @click="handleShowWechatConfigModal"
                >
                  <template #icon>
                    <icon-settings />
                  </template>
                  立即配置
                </a-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </a-spin>
    <!-- 微信公众号配置模态窗 -->
    <a-modal
      :visible="wechatConfigModalVisible"
      hide-title
      :footer="false"
      modal-class="rounded-xl w-[600px]"
      @cancel="handleCancelWechatConfigModal"
    >
      <!-- 顶部标题 -->
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold text-gray-700">微信公众号配置</div>
        <a-button
          type="text"
          class="!text-gray-700"
          size="small"
          @click="handleCancelWechatConfigModal"
        >
          <template #icon>
            <icon-close />
          </template>
        </a-button>
      </div>
      <!-- 中间表单 -->
      <div class="py-4">
        <div class="flex flex-col gap-5">
          <!-- 服务器ip -->
          <div class="flex flex-col gap-2">
            <div class="flex flex-col">
              <div class="flex items-center gap-1 text-gray-700">
                服务器ip
                <div class="text-red-700">*</div>
              </div>
            </div>
            <div class="text-gray-500">{{ wechat_config?.ip || '0.0.0.0' }}</div>
          </div>
          <!-- 服务器地址 -->
          <div class="flex flex-col gap-2">
            <div class="flex flex-col">
              <div class="flex items-center gap-1 text-gray-700">
                服务器地址(URL)
                <div class="text-red-700">*</div>
              </div>
            </div>
            <div class="text-gray-500">{{ wechat_config?.url }}</div>
          </div>
          <!-- 开发者ID(AppID) -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-1 text-gray-700">开发者ID(AppID)</div>
            <a-input
              v-model:model-value="wechatConfigForm.wechat_app_id"
              placeholder="请填写微信开发者ID"
            />
          </div>
          <!-- 开发者秘钥(AppSecret) -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-1 text-gray-700">开发者秘钥(AppSecret)</div>
            <a-input
              v-model:model-value="wechatConfigForm.wechat_app_secret"
              placeholder="请填写微信开发者秘钥"
            />
          </div>
          <!-- 令牌(Token) -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-1 text-gray-700">令牌(Token)</div>
            <a-input
              v-model:model-value="wechatConfigForm.wechat_token"
              placeholder="请填写微信公众号令牌"
            />
          </div>
        </div>
      </div>
      <!-- 底部按钮 -->
      <div class="flex items-center justify-between">
        <div class=""></div>
        <a-space :size="16">
          <a-button class="rounded-lg" @click="handleCancelWechatConfigModal">取消</a-button>
          <a-button
            :loading="updateWechatConfigLoading"
            type="primary"
            class="rounded-lg"
            @click="handleSubmitWechatConfigModal"
          >
            保存
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<style scoped></style>
