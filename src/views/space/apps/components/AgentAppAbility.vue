<script setup lang="ts">
import LongTermMemoryAbilityItem from './abilities/LongTermMemoryAbilityItem.vue'
import OpeningAbilityItem from './abilities/OpeningAbilityItem.vue'
const props = defineProps({
  app_id: { type: String, default: '', required: true },
  draft_app_config: { type: Object, required: true },
})
const emits = defineEmits(['update:draft_app_config'])
</script>

<template>
  <div class="flex flex-col h-[calc[100vh-141px]]">
    <!-- 应用能力标题 -->
    <div class="p-4 text-gray-700 font-bold">应用能力</div>
    <!-- 应用能力列表 -->
    <div class="flex-1 overfolw-scroll scrollbar-w-none">
      <a-collapse :bordered="false">
        <template #expand-icon="{ active }">
          <icon-down v-if="active" />
          <icon-right v-else />
        </template>
        <!-- 长期记忆召回 -->
        <long-term-memory-ability-item
          v-model:long_term_memory="draft_app_config.long_term_memory"
          :app_id="app_id"
        />
        <!-- 对话开场白 -->
        <opening-ability-item
          v-model:opening_questions="draft_app_config.opening_questions"
          v-model:opening_statement="draft_app_config.opening_statement"
          :app_id="props.app_id"
        />
      </a-collapse>
    </div>
  </div>
</template>

<style>
.app-ability-item {
  .arco-collapse-item-header {
    background-color: transparent;
    border: none;
  }

  .arco-collapse-item-content {
    padding-left: 16px;
  }
}
</style>
