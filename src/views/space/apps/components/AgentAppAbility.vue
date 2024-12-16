<script setup lang="ts">
import LongTermMemoryAbilityItem from './abilities/LongTermMemoryAbilityItem.vue'
import OpeningAbilityItem from './abilities/OpeningAbilityItem.vue'
import SuggestedAfterAnswerAbilityItem from './abilities/SuggestedAfterAnswerAbilityItem.vue'
import ReviewConfigAbilityItem from './abilities/ReviewConfigAbilityItem.vue'
import DatasetsAbilityItem from './abilities/DatasetsAbilityItem.vue'
import ToolsAbilityItem from './abilities/ToolsAbilityItem.vue'

const props = defineProps({
  app_id: { type: String, default: '', required: true },
  draft_app_config: { type: Object, required: true },
})
const emits = defineEmits(['update:draft_app_config'])
const defaultActiveKeys = ['long_term_memory', 'opening', 'suggested_after_answer', 'review_config']
</script>

<template>
  <div class="flex flex-col h-[calc[100vh-141px]]">
    <!-- 应用能力标题 -->
    <div class="p-4 text-gray-700 font-bold">应用能力</div>
    <!-- 应用能力列表 -->
    <div class="flex-1 overfolw-scroll scrollbar-w-none">
      <a-collapse :bordered="false" :default-active-key="defaultActiveKeys">
        <template #expand-icon="{ active }">
          <icon-down v-if="active" />
          <icon-right v-else />
        </template>
        <!-- 扩展插件组件 -->
        <tools-ability-item v-model:tools="draft_app_config.tools" :app_id="app_id" />
        <!-- 知识库组件 -->
        <datasets-ability-item
          v-model:retrieval_config="draft_app_config.retrieval_config"
          v-model:datasets="draft_app_config.datasets"
          :app_id="app_id"
        />
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
        <!-- 回答后生成建议问题 -->
        <suggested-after-answer-ability-item
          v-model:suggested_after_answer="draft_app_config.suggested_after_answer"
          :app_id="props.app_id"
        />
        <!-- 内容审核 -->
        <review-config-ability-item
          v-model:review_config="draft_app_config.review_config"
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
