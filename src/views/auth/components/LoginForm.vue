<script setup lang="ts">
import { ref, onUnmounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCredentialStore } from '@/stores/credential'
import { Message, type ValidatedError } from '@arco-design/web-vue'
import { usePasswordLogin } from '@/hooks/use-auth'
import { useProvider } from '@/hooks/use-oauth'
import { useGetCurrentUser, useRegister, useSendVerificationCode } from '@/hooks/use-account'
import { useAccountStore } from '@/stores/account'

const countdown = ref(0);
const isCounting = ref(false);
const errorMessage = ref('')
let timer = null;
const loginForm = ref({ email: '', password: '' })
const registerForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
  verificationCode: '',
})
const registerModelVisible = ref(false)
const credentialStore = useCredentialStore()
const route = useRoute()
const router = useRouter()
const { loading: passwordLoginLoading, authorization, handlePasswordLogin } = usePasswordLogin()
const { loading: providerLoading, redirect_url, handleProvider } = useProvider()
const { loading: registerLoading, handlerRegister } = useRegister()
const { loading: sendCodeLoading, handlerSendCode } = useSendVerificationCode()
const forgetPassword = () => Message.error('忘记密码请联系管理员')
const { current_user, loadCurrentUser } = useGetCurrentUser()
const accountStore = useAccountStore()
const githubLogin = async () => {
  await handleProvider('github')

  window.location.href = redirect_url.value
}

const handleSubmit = async ({ errors }: { errors: Record<string, ValidatedError> | undefined }) => {
  if (errors) return
  try {
    await handlePasswordLogin(loginForm.value.email, loginForm.value.password)
    Message.success('登录成功，正在跳转')
    credentialStore.update(authorization.value)
    await router.replace({ path: String(route.query.redirect) || '/home' })
    // 加载用户信息
    await loadCurrentUser()
    accountStore.update(current_user.value)
  } catch (error: any) {
    errorMessage.value = error.message
    loginForm.value.password = ''
  }
}

const registerSubmit = async () => {
  if (registerForm.value.confirmPassword !== registerForm.value.password) {
    Message.error('两次密码不一致')
    return
  }
  await handlerRegister({ ...registerForm.value })
  registerModelVisible.value = false
}
const sendVerificationCode = async () => {
  if (!registerForm.value.email) {
    Message.error('邮箱不能为空')
    return
  }
  await handlerSendCode(registerForm.value.email)
  startCountdown()
}

const clearTimer = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// 开始倒计时
const startCountdown = () => {
  isCounting.value = true;
  countdown.value = 60;
  
  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      clearTimer();
      isCounting.value = false;
    }
  }, 1000);
};

// 组件卸载时清理
onUnmounted(clearTimer);
const buttonText = computed(() => {
  return isCounting.value 
    ? `${countdown.value}秒后重新获取`
    : '获取验证码';
});
</script>
<template>
  <div class="">
    <!-- 顶部标题 -->
    <div class="text-gray-900 font-bold text-2xl leading-8">
      <p>不懂就问-AI应用开发平台</p>
    </div>
    <!-- <p class="text-base leading-6 text-gray-600">高效开发你的AI原生应用</p> -->
    <!-- 错误提示占位符 -->
    <div class="h-8 text-red-700 leading-8 line-clamp-1">{{ errorMessage }}</div>
    <!-- 登录表单 -->
    <a-form
      :model="loginForm"
      @submit="handleSubmit"
      layout="vertical"
      size="large"
      class="flex flex-col w-full"
    >
      <a-form-item
        field="email"
        :rules="[{ type: 'email', required: true, message: '登录账号必须是合法的邮箱' }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input v-model="loginForm.email" size="large" placeholder="登录账号">
          <template #prefix>
            <icon-user />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        field="password"
        :rules="[{ required: true, message: '账号密码不能为空' }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password v-model="loginForm.password" size="large" placeholder="账号密码">
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
        <a-button
          :loading="passwordLoginLoading"
          size="large"
          type="primary"
          html-type="submit"
          long
        >
          登录
        </a-button>
        <a-button size="large" long @click="registerModelVisible = true">注册</a-button>
        <a-divider>第三方授权</a-divider>
        <a-button :loading="providerLoading" size="large" type="dashed" long @click="githubLogin">
          <template #icon>
            <icon-github />
          </template>
          Github
        </a-button>
      </a-space>
    </a-form>
  </div>
  <!-- 注册表单 -->
  <a-modal :width="400" v-model:visible="registerModelVisible" :footer="false" @close="clearTimer">
    <template #title> 注册 </template>
    <a-form :model="registerForm" @submit="registerSubmit" layout="vertical">
      <a-form-item
        field="email"
        :rules="[{ type: 'email', required: true, message: '登录账号必须是合法的邮箱' }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input v-model="registerForm.email" size="large" placeholder="邮箱">
          <template #prefix>
            <icon-email />
          </template>
        </a-input>
      </a-form-item>
      <a-form-item
        field="password"
        :rules="[{ required: true, message: '密码不能为空' }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password v-model="registerForm.password" size="large" placeholder="密码">
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-form-item
        field="confirmPassword"
        :rules="[{ required: true, message: '密码不能为空' }]"
        :validate-trigger="['change', 'blur']"
        hide-label
      >
        <a-input-password
          v-model="registerForm.confirmPassword"
          size="large"
          placeholder="再次输入密码"
        >
          <template #prefix>
            <icon-lock />
          </template>
        </a-input-password>
      </a-form-item>
      <a-row class="grid-demo" :gutter="24">
        <a-col flex="20">
          <a-form-item
            field="verificationCode"
            :rules="[{ required: true, message: '验证码不能为空' }]"
            :validate-trigger="['change', 'blur']"
            hide-label
          >
            <a-input v-model="registerForm.verificationCode" size="large" placeholder="验证码">
              <template #prefix>
                <icon-code />
              </template>
            </a-input>
          </a-form-item>
        </a-col>
        <a-col flex="12">
          <a-button type="primary" :disabled="isCounting" :loading="sendCodeLoading" size="large" @click="sendVerificationCode">
            {{ buttonText }}
          </a-button>
        </a-col>
      </a-row>
      <a-button :loading="registerLoading" size="large" type="primary" html-type="submit">
        注册
      </a-button>
    </a-form>
  </a-modal>
</template>
<style scoped></style>
