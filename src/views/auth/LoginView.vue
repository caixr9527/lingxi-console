<script setup lang="ts">
import Banner from './components/Banner.vue'
import LoginForm from './components/LoginForm.vue'
import IconGithub from '@/components/icons/IconGithub.vue'
import gaImage from '@/assets/images/ga.png'
import { icpCode, gaCode, title } from '@/config'
</script>

<template>
  <!-- 页面容器 -->
  <div class="flex h-screen bg-white">
    <!-- 顶部logo -->
    <!-- <div class="fixed top-6 inline-flex items-center">
      <icon-logo class="h-16 z-50" />
    </div> -->
    <!-- 左侧banner -->
    <banner />
    <!-- 右侧表单 -->
    <div class="relative flex flex-1 items-center justify-center pb-10">
      <!-- 登陆表单 -->
      <login-form />
      <!-- 底部footer -->
      <div class="absolute right-0 bottom-0 w-full">
        <footer class="flex items-center justify-center h-10 text-gray-600 text-center">
          <a-space>
            <a href="https://github.com/caixr9527" target="_blank">
              <icon-github class="w-[18px] h-[18px]" />
            </a>
            <div>{{ title }}</div>
            <a href="https://beian.miit.gov.cn/" target="_blank">{{icpCode}}</a>
            <img class="w-[18px] h-[18px]" :src="gaImage"/>
            <a href="https://beian.mps.gov.cn/#/query/webSearch?code=35021102002267" rel="noreferrer" target="_blank">
              {{ gaCode }}
            </a>
          </a-space>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
