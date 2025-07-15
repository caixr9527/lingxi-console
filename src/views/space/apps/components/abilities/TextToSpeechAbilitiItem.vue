<script setup lang="ts">
import { cloneDeep, isEqual } from 'lodash'
import { nextTick, ref, watch } from 'vue'
import { useUpdateDraftAppConfig } from '@/hooks/use-app'

const props = defineProps({
  app_id: { type: String, default: '', required: true },
  text_to_speech: {
    type: Object,
    default: () => {
      return {}
    },
    required: true,
  },
})
const { loading, handleUpdateDraftAppConfig } = useUpdateDraftAppConfig()
const isInit = ref(false)
const textToSpeechModalVisible = ref(false)
const textToSpeechForm = ref({
  enable: props.text_to_speech?.enable,
  voice: props.text_to_speech?.voice,
  auto_play: props.text_to_speech?.auto_play,
})
const originTextToSpeechForm = ref({ ...cloneDeep(textToSpeechForm.value) })

const isFormModified = () => {
  return isEqual(originTextToSpeechForm.value, textToSpeechForm.value)
}

// 隐藏文本转语音配置模态窗
const handleCancelTextToSpeechModal = () => {
  // 隐藏模态窗
  textToSpeechModalVisible.value = false

  // 还原表单数据
  textToSpeechForm.value = cloneDeep(originTextToSpeechForm.value)
}

// 提交模态窗存储的内容
const handleSubmitTextToSpeech = async () => {
  // 处理数据并完成API接口提交
  await handleUpdateDraftAppConfig(props.app_id, {
    text_to_speech: {
      enable: textToSpeechForm.value.enable,
      voice: textToSpeechForm.value.voice,
      auto_play: textToSpeechForm.value.auto_play,
    },
  })

  // 接口更新更新成功，同步表单信息
  originTextToSpeechForm.value = cloneDeep(textToSpeechForm.value)
  await nextTick()

  // 隐藏模态窗
  handleCancelTextToSpeechModal()
}

// 监听text_to_speech变化并同步到表单
watch(
  () => props.text_to_speech,
  (newValue: any) => {
    // 检测数据是否更新并且未初始化
    if (!isInit.value || !isFormModified()) {
      if (newValue && Object.keys(newValue).length > 0) {
        // 更新表单数据和备份数据，使用深拷贝
        textToSpeechForm.value = { ...newValue }
        originTextToSpeechForm.value = { ...newValue }

        // 标记为已初始化
        isInit.value = true
      }
    }
  },
  { immediate: true, deep: true },
)
</script>

<template>
  <div class="">
    <a-collapse-item key="text_to_speech" class="app-ability-item text-to-speech-ability-item">
      <template #header>
        <div class="text-gray-700 font-bold">语音输出</div>
      </template>
      <template #extra>
        <a-dropdown
          @select="
            async (value: any) => {
              if (Boolean(value) !== textToSpeechForm.enable) {
                try {
                  // 1.表盖表单数据并确保数据同步
                  textToSpeechForm.enable = Boolean(value)
                  await nextTick()

                  // 2.提交表单更新数据
                  await handleSubmitTextToSpeech()
                } catch (e) {}
              }
            }
          "
        >
          <a-button size="mini" class="rounded-lg flex items-center gap-1 px-1" @click.stop>
            {{ textToSpeechForm.enable ? '开启' : '关闭' }}
            <icon-down />
          </a-button>
          <template #content>
            <a-doption :value="1" class="text-xs py-1.5 text-gray-700">开启</a-doption>
            <a-doption :value="0" class="text-xs py-1.5 text-red-700">关闭</a-doption>
          </template>
        </a-dropdown>
      </template>
      <div class="group py-2">
        <div class="text-xs text-gray-500 leading-[22px] group-hover:hidden">
          在Bot回复后，语音播报回复内容。
        </div>
        <a-button
          size="small"
          long
          class="hidden group-hover:block rounded-lg transition-all"
          @click="textToSpeechModalVisible = true"
        >
          <template #icon>
            <icon-settings />
          </template>
          语音设置
        </a-button>
      </div>
    </a-collapse-item>
    <!-- 模态窗组件 -->
    <a-modal
      :visible="textToSpeechModalVisible"
      hide-title
      :footer="false"
      modal-class="rounded-xl"
      @cancel="handleCancelTextToSpeechModal"
    >
      <!-- 顶部标题 -->
      <div class="flex items-center justify-between">
        <div class="text-lg font-bold text-gray-700">语音输出</div>
        <a-button
          type="text"
          class="!text-gray-700"
          size="small"
          @click="handleCancelTextToSpeechModal"
        >
          <template #icon>
            <icon-close />
          </template>
        </a-button>
      </div>
      <!-- 中间表单 -->
      <div class="py-4">
        <div class="flex flex-col gap-5">
          <!-- 音色设置 -->
          <div class="flex flex-col gap-2">
            <div class="flex flex-col">
              <div class="flex items-center gap-1 text-gray-700">
                音色设置
                <div class="text-red-700">*</div>
              </div>
              <div class="text-gray-500 text-xs">
                不同的音色适用于不同的场景，请结合业务进行选择。
              </div>
            </div>
            <a-select v-model:model-value="textToSpeechForm.voice">
              <a-option value="alloy">alloy</a-option>
              <a-option value="ash">ash</a-option>
              <a-option value="coral">coral</a-option>
              <a-option value="echo">echo</a-option>
              <a-option value="fable">fable</a-option>
              <a-option value="onyx">onyx</a-option>
              <a-option value="nova">nova</a-option>
              <a-option value="sage">sage</a-option>
              <a-option value="shimmer">shimmer</a-option>
            </a-select>
          </div>
          <!-- 自动播放 -->
          <div class="flex flex-col gap-2">
            <div class="flex flex-col">
              <div class="flex items-center gap-1 text-gray-700">
                自动播放
                <div class="text-red-700">*</div>
              </div>
              <div class="text-gray-500 text-xs">Agent回复结束后，自动播放音频内容</div>
            </div>
            <div class="">
              <a-switch
                v-model:model-value="textToSpeechForm.auto_play"
                size="small"
                type="round"
              />
            </div>
          </div>
        </div>
      </div>
      <!-- 底部按钮 -->
      <div class="flex items-center justify-between">
        <div class=""></div>
        <a-space :size="16">
          <a-button class="rounded-lg" @click="handleCancelTextToSpeechModal">取消</a-button>
          <a-button
            :loading="loading"
            type="primary"
            class="rounded-lg"
            @click="handleSubmitTextToSpeech"
          >
            保存
          </a-button>
        </a-space>
      </div>
    </a-modal>
  </div>
</template>

<style>
.text-to-speech-ability-item {
  .arco-collapse-item-content-box {
    padding: 0;
  }
}
</style>
