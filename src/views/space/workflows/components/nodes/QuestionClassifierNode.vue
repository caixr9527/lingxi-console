<script setup lang="ts">
import { Handle, type NodeProps, Position } from '@vue-flow/core'

const props = defineProps<NodeProps>()
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-2xl p-3 bg-white border-[2px] border-transparent shadow-sm hover:shadow-md selected-border transition-all w-[240px]"
  >
    <!-- 节点标题信息 -->
    <div class="flex items-center gap-2">
      <a-avatar shape="square" :size="24" class="bg-green-700 rounded-lg flex-shrink-0">
        <icon-mind-mapping :size="16" />
      </a-avatar>
      <div class="text-gray-700 font-semibold">{{ props.data?.title }}</div>
    </div>
    <!-- 分类列表 -->
    <div
      v-for="(classifier, idx) in props.data?.classes"
      :key="idx"
      class="bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold relative"
    >
      <p>分类{{ idx + 1 }}</p>
      <handle
        type="source"
        :id="classifier?.source_handle_id"
        :position="Position.Right"
        class="!w-4 !h-4 !bg-blue-700 !text-white flex items-center justify-center"
      >
        <icon-plus :size="12" class="pointer-events-none" />
      </handle>
    </div>
    <!-- 空数据展示 -->
    <div
      v-if="!props.data?.classes?.length"
      class="text-gray-700 bg-gray-100 rounded-lg p-3 text-xs"
    >
      该节点暂未添加问题分类信息
    </div>
    <!-- 意图识别节点-连接句柄 -->
    <handle
      type="target"
      :position="Position.Left"
      class="!w-4 !h-4 !bg-blue-700 !text-white flex items-center justify-center"
    >
      <icon-plus :size="12" class="pointer-events-none" />
    </handle>
  </div>
</template>

<style scoped>
.selected {
  .selected-border {
    @apply border-blue-700;
  }
}
</style>
