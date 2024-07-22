<template>
  <a-button @click="debug">发起请求</a-button>
</template>

<script setup lang="ts">
import { post } from '@/utils/request'
const debug = async () => {
  const response = await post('/apps/7a1131d6-722d-43cf-94db-df23082bccc0/debug', {
    body: {
      query: '你好，讲一个关于程序员的冷笑话',
    },
  })
  console.log(response)
}
</script>

<style></style>
