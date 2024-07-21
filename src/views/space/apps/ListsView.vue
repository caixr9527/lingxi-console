<template>
  <p>这里是AI应用列表{{ counterStore.doubleCount }}</p>
  <router-link to="/home">home</router-link>
</template>

<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counterStore = useCounterStore()
</script>

<style></style>
