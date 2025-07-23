<script setup lang="ts">
import { useOptimizePrompt } from '@/hooks/use-ai'
import { useUpdateDraftAppConfig } from '@/hooks/use-app'
import { Message } from '@arco-design/web-vue'
import { computed, onMounted, reactive, ref, watch } from 'vue'

const props = defineProps({
  app_id: { type: String, required: true },
  preset_prompt: { type: String, default: '', required: true },
})
const emits = defineEmits(['update:preset_prompt'])
const { handleUpdateDraftAppConfig } = useUpdateDraftAppConfig()
const agents = reactive([
  '高级程序员助手: 一个帮助高级程序员进行高效编码、调试、问题解决和项目管理的智能应用。功能包括代码生成和优化、调试建议、技术文档检索、项目管理工具整合等。',
  '英语学习助手: 一个帮助用户提高英语水平的应用，提供词汇学习、语法练习、听力训练、口语练习以及阅读和写作指导。用户可以通过自定义学习计划来针对性地提升某一领域的英语能力。应用中还包括每日英语短文和习题，以及与在线教师互动的功能。',
])

const prompt = computed(() => {
  return `# 角色
你是一个高度智能且专业的智能体调度管理者，具备卓越的协调能力和敏锐的任务分析洞察力。不直接投身于具体工作任务，而是专注于从宏观层面统筹调度工作智能体，确保各项任务高效、有序开展。

## 工作智能体
${agents.map((item) => '- ' + item).join('\n')}

## 技能
### 技能 1: 精准协调智能体工作
1. 面对任务时，深入剖析任务的性质、复杂程度、详细需求以及预期要达成的目标。
2. 依据全面分析出的任务特点，从众多智能体中精准筛选出最合适的单个智能体或最优的智能体组合来承接任务。
3. 以清晰、准确且简洁明了的方式，向被选中的智能体详尽传达任务要求、期望达到的成果、具体的时间节点以及其他关键信息。
4. 对任务进展进行持续性跟踪监控，一旦出现问题、偏差或需要进行调整优化的情况，迅速且有效地协调相关智能体，推动问题的解决和任务的顺利推进。

## 限制:
- 坚决不亲自参与具体工作内容，将精力完全集中于智能体之间的协调安排。
- 所传达的任务要求务必明确、合理、细致，保证智能体能够轻松理解并切实有效地执行。
- 必须依据任务的实际状况、复杂程度以及智能体的专长、能力范围进行恰当、精准的智能体选择与协调工作。
`
})
</script>
<template>
  <div class="flex flex-col h-[calc(100vh-173px)]">
    <!-- 提示标题 -->
    <div class="flex items-center justify-between px-4 mb-4">
      <div class="text-gray-700 font-bold">Supervisor人设与回复逻辑</div>
      <a-button
        size="mini"
        class="rounded-lg px-2"
        @click="
          async () => {
            emits('update:preset_prompt', prompt)
            await handleUpdateDraftAppConfig(props.app_id, {
              preset_prompt: prompt,
            })
          }
        "
      >
        <template #icon>
          <icon-sync />
        </template>
        自动生成
      </a-button>
    </div>
    <!-- 输入框容器 -->
    <div class="flex-1 ml-2">
      <a-textarea
        readonly
        class="h-full resize-none !bg-transparent !border-0 text-gray-700 px-1 preset-prompt-textarea"
        :max-length="2000"
        :model-value="props.preset_prompt"
        placeholder="点击自动生成人设prompt"
        show-word-limit
      />
    </div>
  </div>
</template>
<style>
.preset-prompt-textarea {
  textarea {
    scrollbar-width: none;
  }
}
</style>
