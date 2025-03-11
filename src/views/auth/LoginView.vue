<script setup lang="ts">
import Banner from './components/Banner.vue'
import LoginForm from './components/LoginForm.vue'
import IconGithub from '@/components/icons/IconGithub.vue'
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
              <icon-github class="w-[20px] h-[20px]" />
            </a>
            <div>不懂就问-AI应用开发平台</div>
            <a href="https://beian.miit.gov.cn/" target="_blank">闽ICP备2024044910号-3</a>
          </a-space>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
