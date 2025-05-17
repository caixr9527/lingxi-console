<script setup lang="ts">
import { type PropType } from 'vue'
import { useUpdateDraftAppConfig } from '@/hooks/use-app'

const props = defineProps({
  app_id: { type: String, default: '', required: true },
  multimodal: {
    type: Object as PropType<{ enable: boolean }>,
    default: () => {
      return { enable: false }
    },
    required: true,
  },
})
const emits = defineEmits(['update:multimodal'])
const { handleUpdateDraftAppConfig } = useUpdateDraftAppConfig()
</script>

<template>
  <div class="">
    <a-collapse-item key="multimodal" class="app-ability-item">
      <template #header>
        <div class="text-gray-700 font-bold">开启多模态</div>
      </template>
      <template #extra>
        <a-dropdown
          @select="
            async (value: any) => {
              if (Boolean(value) !== props.multimodal?.enable) {
                emits('update:multimodal', { enable: Boolean(value) })
                await handleUpdateDraftAppConfig(props.app_id, {
                  multimodal: { enable: Boolean(value) },
                })
              }
            }
          "
        >
          <a-button size="mini" class="rounded-lg flex items-center gap-1 px-1" @click.stop>
            {{ props.multimodal.enable ? '开启' : '关闭' }}
            <icon-down />
          </a-button>
          <template #content>
            <a-doption :value="1" class="text-xs py-1.5 text-gray-700">开启</a-doption>
            <a-doption :value="0" class="text-xs py-1.5 text-red-700">关闭</a-doption>
          </template>
        </a-dropdown>
      </template>
      <div class="text-xs text-gray-500 leading-[22px]">启用后，仅识别文字。</div>
    </a-collapse-item>
  </div>
</template>

<style scoped></style>
