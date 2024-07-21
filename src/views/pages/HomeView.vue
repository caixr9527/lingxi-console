<script setup lang="ts">
import { useAccountStore } from '@/stores/account'
const accountStore = useAccountStore()
</script>

<template>
  <p>这是主页</p>
  <p>用户名：{{ accountStore.account }}</p>
</template>

<style></style>
