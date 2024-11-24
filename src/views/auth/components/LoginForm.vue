<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useCredentialStore } from '@/stores/credential'
import { useRouter } from 'vue-router'
import { Message } from '@arco-design/web-vue'
import { provider } from '@/services/oauth'
import { passwordLogin } from '@/services/auth'

const errorMessage = ref('')
const passwordLoading = ref(false)
const githubLoading = ref(false)
const loginForm = reactive({ email: '', password: '' })
const credentialStore = useCredentialStore()
const router = useRouter()

const forgetPassword = () => {
  Message.error('请联系管理员')
}
const githubLogin = async () => {
  try {
    githubLoading.value = true
    const resp = await provider('github')
    window.location.href = resp.data.redirect_url
  } finally {
    githubLoading.value = false
  }
}
const handleSubmit = async ({ errors }: any) => {
  if (errors) return
  try {
    passwordLoading.value = true
    const resp = await passwordLogin(loginForm.email, loginForm.password)
    Message.success('登陆成功，正在跳转')
    credentialStore.update(resp.data)
    await router.replace({ path: '/home' })
  } catch (error: any) {
    errorMessage.value = error.message
    loginForm.password = ''
  } finally {
    passwordLoading.value = false
  }
}
</script>
<template>
  <div class="">
    <!-- 顶部标题 -->
    <div class="text-gray-900 font-bold text-2xl leading-8">LLMOps App Builder</div>
    <p class="text-base leading-6 text-gray-600">高效开发你的AI原生应用</p>
    <!-- 错误提示占位符 -->
    <div class="h-8 text-red-700 leading-8 line-clamp-1">{{ errorMessage }}</div>
    <!-- 登陆表单 -->
    <a-form
      :model="loginForm"
      @submit="handleSubmit"
      layout="vertical"
      size="large"
      class="flex flex-col w-full"
    >
      <a-form-item
        field="email"
        :rules="[{ type: 'email', required: true, message: '账号不能为空' }]"
        hide-label
        :validate-trigger="['change', 'blur']"
      >
        <a-input v-model="loginForm.email" size="large" placeholder="账号">
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        field="password"
        :rules="[{ required: true, message: '密码不能为空' }]"
        hide-label
        :validate-trigger="['change', 'blur']"
      >
        <a-input-password v-model="loginForm.password" size="large" placeholder="密码">
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-space :size="16" direction="vertical">
        <div class="flex justify-between">
          <a-checkbox>记住密码</a-checkbox>
          <a-link @click="forgetPassword">忘记密码?</a-link>
        </div>
        <a-button :loading="passwordLoading" size="large" type="primary" html-type="submit" long>
          登录
        </a-button>
        <a-divider>第三方授权</a-divider>
        <a-button :loading="githubLoading" size="large" type="dashed" long @click="githubLogin">
          <template #icon>
            <icon-github />
          </template>
          Github
        </a-button>
      </a-space>
    </a-form>
  </div>
</template>
<style scoped></style>
