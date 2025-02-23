<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthorize } from '@/hooks/use-oauth'
import { useCredentialStore } from '@/stores/credential'
const route = useRoute()
const router = useRouter()
const credentialStore = useCredentialStore()
const { authorization, handleAuthorize } = useAuthorize()
onMounted(async () => {
  try {
    await handleAuthorize(String(route.params?.provider_name), String(route.query?.code ?? ''))

    credentialStore.update(authorization.value)
    await router.replace({ path: '/home' })
  } catch (error) {
    await router.replace({ path: '/auth/login' })
  }
})
</script>

<template>
  <div class="w-full min-h-screen flex items-center justify-center bg-white">
    <a-spin tip="第三方授权登录中..."></a-spin>
  </div>
</template>

<style scoped></style>
