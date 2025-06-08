<script setup lang="ts">
import { Handle, type NodeProps, Position } from '@vue-flow/core'
import IconIf from '@/components/icons/IconIf.vue'
import { computed } from 'vue'
const props = defineProps<NodeProps>()

const classesLength = computed(() => {
  return props.data?.classes.length || 0
})
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-2xl p-3 bg-white border-[2px] border-transparent shadow-sm hover:shadow-md selected-border transition-all w-[240px]"
  >
    <!-- 节点标题信息 -->
    <div class="flex items-center gap-2">
      <a-avatar shape="square" :size="24" class="bg-gray-700 rounded-lg flex-shrink-0">
        <icon-if :size="16" />
      </a-avatar>
      <div class="text-gray-700 font-semibold">{{ props.data?.title }}</div>
    </div>
    <!-- 分类列表 -->
    <div
      v-for="(classifier, idx) in [...props.data?.classes].reverse()"
      :key="idx"
      class="bg-gray-100 rounded-lg px-3 py-1.5 text-xs font-bold relative"
    >
      <p>{{ idx === classesLength - 1 ? '否则' : idx === 0 ? '如果' : '否则如果' }}</p>
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
      该节点暂未添加条件选择信息
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
