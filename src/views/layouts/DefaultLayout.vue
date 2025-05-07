<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { useLogout } from '@/hooks/use-auth'
import LayoutSidebar from './components/Sidebar.vue'
import { useCredentialStore } from '@/stores/credential'
import { useAccountStore } from '@/stores/account'
import SettingModal from '@/views/layouts/components/SettingModal.vue'
import IconLogo from '@/components/icons/IconLogo.vue'
import { ref } from 'vue'
const settingModalVisible = ref(false)
const router = useRouter()
const route = useRoute()
const credentialStore = useCredentialStore()
const accountStore = useAccountStore()
const { handleLogout: handleLogoutHook } = useLogout()

const handleLogout = async () => {
  await handleLogoutHook()

  credentialStore.clear()
  accountStore.clear()

  await router.replace({ name: 'auth-login', query: { redirect: route.fullPath } })
}
</script>

<template>
  <a-layout has-sider class="h-full">
    <!-- 侧边栏 -->
    <a-layout-sider :width="240" class="min-h-screen bg-gray-50 p-2 shadow-none">
      <div class="bg-white h-full rounded-lg px-2 py-4 flex flex-col justify-between">
        <!-- 上半部分 -->
        <div class="">
          <!-- 顶部Logo -->
          <router-link to="/home" class="block h-9 w-full mb-5 hover transition-all rounded-lg">
            <div class="text-gray-700 hover:text-gray-900 flex items-center justify-center">
              <icon-logo class="h-full w-[40px]" />
              <p>不懂就问-AI应用开发平台</p>
            </div>
          </router-link>
          <!-- 创建AI应用按钮 -->
          <router-link :to="{ name: 'space-apps-list', query: { create_type: 'app' } }">
            <a-button type="primary" long class="rounded-lg mb-4">
              <template #icon>
                <icon-plus />
              </template>
              创建 AI 应用
            </a-button>
          </router-link>
          <!-- 侧边栏导航 -->
          <layout-sidebar />
        </div>
        <!-- 账号设置 -->
        <a-dropdown position="tl">
          <div
            class="flex items-center p-2 gap-2 transition-all cursor-pointer rounded-lg hover:bg-gray-100"
          >
            <a-space>
              <!-- 头像 -->
              <a-avatar
                :size="32"
                class="text-sm bg-blue-700"
                :image-url="accountStore.account.avatar"
              >
                {{ accountStore.account.name[0] }}
              </a-avatar>
              <!-- 个人信息 -->
              <div class="flex flex-col">
                <div class="text-sm text-gray-900">{{ accountStore.account.name }}</div>
                <div class="text-xs text-gray-500">{{ accountStore.account.email }}</div>
              </div>
            </a-space>
          </div>
          <template #content>
            <a-doption @click="settingModalVisible = true">
              <template #icon>
                <icon-settings />
              </template>
              账号设置
            </a-doption>
            <a-doption @click="handleLogout">
              <template #icon>
                <icon-poweroff />
              </template>
              退出登录
            </a-doption>
          </template>
        </a-dropdown>
      </div>
    </a-layout-sider>
    <!-- 右侧内容 -->
    <a-layout-content>
      <router-view />
    </a-layout-content>
    <!-- 设置模态窗 -->
    <setting-modal v-model:visible="settingModalVisible" />
  </a-layout>
</template>

<style scoped></style>
