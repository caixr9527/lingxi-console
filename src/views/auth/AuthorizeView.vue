<script setup lang="ts">
import { authorize } from '@/services/oauth'
import { useCredentialState } from '@/stores/credential'
import { Message } from '@arco-design/web-vue'
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
const route = useRoute()
const router = useRouter()
const credentialStore = useCredentialState()
onMounted(async () => {
  try {
    const resp = await authorize(route.params?.provider_name as string, route.query?.code as string)
    Message.success('登录成功，正在跳转...')
    credentialStore.update(resp.data)
    await router.replace({ path: '/home' })
  } catch (error: any) {
    await router.replace({ path: '/auth/login' })
  }
})
</script>

<template>
  <div class="w-full min-h-screen flex items-center justify-center bg-white">
    <a-spin tip="第三方授权登陆中..."></a-spin>
  </div>
</template>

<style scoped></style>
