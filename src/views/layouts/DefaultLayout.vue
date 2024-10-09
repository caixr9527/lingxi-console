<template>
  <a-layout>
    <!-- 侧边栏 -->
    <a-layout-sider :width="240" class="min-h-screen bg-gray-50 p-2 shadow-none">
      <div class="bg-white h-full rounded-lg px-2 py-4 flex flex-col justify-between">
        <!-- 上半部分 -->
        <div class="">
          <!-- 顶部logo -->
          <router-link
            to="/home"
            class="block h-9 w-[110px] mb-5 bg-gray-200 hover:bg-gray-300 transition-all rounded-lg"
          />
          <!-- 创建AI应用按钮 -->
          <a-button type="primary" long class="rounded-lg mb-4">
            <template #icon>
              <icon-plus />
            </template>
            创建AI应用
          </a-button>
          <!-- 侧边栏导航 -->
          <div class="flex flex-col gap-2">
            <router-link
              to="/home"
              class="flex items-center gap-2 h-8 leading-8 rounded-lg transition-all px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200"
              active-class="bg-gray-100"
            >
              <icon-home-full v-if="route.path.startsWith('/home')" />
              <icon-home v-else />
              主页
            </router-link>

            <router-link
              to="/space/apps"
              :class="`flex items-center gap-2 h-8 leading-8 rounded-lg transition-all px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200 ${route.path.startsWith('/space') ? 'bg-gray-100' : ''}`"
            >
              <icon-space-full v-if="route.path.startsWith('/space')" />
              <icon-space v-else />
              个人空间
            </router-link>
            <div class="text-gray-500 text-sm px-2">探索</div>

            <router-link
              to="/store/apps"
              class="flex items-center gap-2 h-8 leading-8 rounded-lg transition-all px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200"
              active-class="bg-gray-100"
            >
              <icon-app-full v-if="route.path.startsWith('/store/apps')" />
              <icon-app v-else />
              应用广场
            </router-link>

            <router-link
              to="/store/tools"
              class="flex items-center gap-2 h-8 leading-8 rounded-lg transition-all px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200"
              active-class="bg-gray-100"
            >
              <icon-tool-full v-if="route.path.startsWith('/store/tools')" />
              <icon-tool v-else />
              插件广场
            </router-link>

            <router-link
              to="/open"
              class="flex items-center gap-2 h-8 leading-8 rounded-lg transition-all px-2 text-gray-700 hover:text-gray-900 hover:bg-gray-200"
              active-class="bg-gray-100"
            >
              <icon-open-api-full v-if="route.path.startsWith('/open')" />
              <icon-open-api v-else />
              开发API
            </router-link>
          </div>
        </div>
        <!-- 账号设置 -->
        <a-dropdown position="tl">
          <div
            class="flex items-center p-2 gap-2 transition-all cursor-pointer rounded-lg hover:bg-gray-100"
          >
            <!-- 头像 -->
            <a-avatar :size="32" class="text-sm bg-blue-700">荣</a-avatar>
            <!-- 个人信息 -->
            <div class="flex flex-col">
              <div class="text-sm text-gray-900">名字</div>
              <div class="text-xs text-gray-500">12345@163.com</div>
            </div>
          </div>
          <template #content>
            <a-doption>
              <template #icon>
                <icon-settings />
              </template>
              账号设置
            </a-doption>
            <a-doption>
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
  </a-layout>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import IconHome from '@/components/icons/IconHome.vue'
import IconHomeFull from '@/components/icons/IconHomeFull.vue'
import IconSpace from '@/components/icons/IconSpace.vue'
import IconSpaceFull from '@/components/icons/IconSpaceFull.vue'
import IconApp from '@/components/icons/IconApp.vue'
import IconAppFull from '@/components/icons/IconAppFull.vue'
import IconTool from '@/components/icons/IconTool.vue'
import IconToolFull from '@/components/icons/IconToolFull.vue'
import IconOpenApi from '@/components/icons/IconOpenApi.vue'
import IconOpenApiFull from '@/components/icons/IconOpenApiFull.vue'

const route = useRoute()
</script>

<style scoped></style>
