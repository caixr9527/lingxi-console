<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { v4 } from 'uuid'
import { cloneDeep } from 'lodash'
import { getReferencedVariables } from '@/utils/helper'
import { Message, type ValidatedError } from '@arco-design/web-vue'

const props = defineProps({
  visible: { type: Boolean, required: true, default: false },
  node: {
    type: Object as any,
    required: true,
    default: () => {
      return {}
    },
  },
  loading: { type: Boolean, required: true, default: false },
})
const emits = defineEmits(['update:visible', 'updateNode'])
const form = ref<Record<string, any>>({})
const { nodes, edges } = useVueFlow()

const inputRefOptions = computed(() => {
  return getReferencedVariables(cloneDeep(nodes.value), cloneDeep(edges.value), props.node.id)
})

// 定义添加问题分类字段函数
const addClass = () => {
  form.value?.classes.push({
    query: '',
    node_id: '',
    node_type: '',
    source_handle_id: v4(),
  })
  Message.success('新增问题分类字段成功')
}

// 定义移除问题分类
const removeClass = (idx: number) => {
  form.value?.classes?.splice(idx, 1)
}

// 定义表单提交函数
const onSubmit = async ({ errors }: { errors: Record<string, ValidatedError> | undefined }) => {
  // 检查表单是否出现错误，如果出现错误则直接结束
  if (errors) return

  // 深度拷贝表单数据内容
  const cloneInputs = cloneDeep(form.value.inputs)
  const cloneClasses = cloneDeep(form.value.classes)

  // 数据校验通过，通过事件触发数据更新
  emits('updateNode', {
    id: props.node.id,
    title: form.value.title,
    description: form.value.description,
    classes: cloneClasses,
    inputs: cloneInputs.map((input: any) => {
      return {
        name: input.name,
        description: '',
        required: true,
        type: input.type === 'ref' ? 'string' : input.type,
        value: {
          type: input.type === 'ref' ? 'ref' : 'literal',
          content:
            input.type === 'ref'
              ? {
                  ref_node_id: input.ref.split('/')[0] || '',
                  ref_var_name: input.ref.split('/')[1] || '',
                }
              : input.content,
        },
        meta: {},
      }
    }),
    outputs: cloneDeep(form.value.outputs),
  })
}

// 监听数据，将数据映射到表单模型上
watch(
  () => props.node,
  (newNode) => {
    const cloneInputs = cloneDeep(newNode.data.inputs)
    const cloneClasses = cloneDeep(newNode.data.classes)
    form.value = {
      id: newNode.id,
      type: newNode.type,
      title: newNode.data.title,
      description: newNode.data.description,
      classes: cloneClasses,
      inputs: cloneInputs.map((input: any) => {
        // 计算引用的变量值信息
        const ref =
          input.value.type === 'ref'
            ? `${input.value.content.ref_node_id}/${input.value.content.ref_var_name}`
            : ''

        // 判断引用的变量值信息是否存在，如果不存在则设置为空
        let refExists = false
        if (input.value.type === 'ref') {
          for (const inputRefOption of inputRefOptions.value) {
            for (const option of inputRefOption.options) {
              if (option.value === ref) {
                refExists = true
                break
              }
            }
          }
        }
        return {
          name: input.name, // 变量名
          type: input.value.type === 'literal' ? input.type : 'ref', // 数据类型(涵盖ref/string/int/float/boolean
          content: input.value.type === 'literal' ? input.value.content : '', // 变量值内容
          ref: input.value.type === 'ref' && refExists ? ref : '', // 变量引用信息，存储引用节点id+引用变量名
        }
      }),
      outputs: [{ name: 'node_id', type: 'string', value: { type: 'generated', content: '' } }],
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="props.visible"
    id="llm-node-info"
    class="absolute top-0 right-0 bottom-0 w-[400px] border-l z-50 bg-white overflow-scroll scrollbar-w-none p-3"
  >
    <!-- 顶部标题信息 -->
    <div class="flex items-center justify-between gap-3 mb-2">
      <!-- 左侧标题 -->
      <div class="flex items-center gap-1 flex-1">
        <a-avatar :size="30" shape="square" class="bg-green-700 rounded-lg flex-shrink-0">
          <icon-mind-mapping />
        </a-avatar>
        <a-input
          v-model:model-value="form.title"
          placeholder="请输入标题"
          class="!bg-white text-gray-700 font-semibold px-2"
        />
      </div>
      <!-- 右侧关闭按钮 -->
      <a-button
        type="text"
        size="mini"
        class="!text-gray700 flex-shrink-0"
        @click="() => emits('update:visible', false)"
      >
        <template #icon>
          <icon-close />
        </template>
      </a-button>
    </div>
    <!-- 描述信息 -->
    <a-textarea
      :auto-size="{ minRows: 3, maxRows: 5 }"
      v-model="form.description"
      class="rounded-lg text-gray-700 !text-xs"
      placeholder="输入描述..."
    />
    <!-- 分隔符 -->
    <a-divider class="my-2" />
    <!-- 表单信息 -->
    <a-form size="mini" :model="form" layout="vertical" @submit="onSubmit">
      <!-- 输入参数 -->
      <div class="flex flex-col gap-2">
        <!-- 标题&操作按钮 -->
        <div class="flex items-center justify-between">
          <!-- 左侧标题 -->
          <div class="flex items-center gap-2 text-gray-700 font-semibold">
            <div class="">输入数据</div>
            <a-tooltip content="传递给LLM的相关数据，LLM会根据该数据自行判断需要执行的路由线路。">
              <icon-question-circle />
            </a-tooltip>
          </div>
        </div>
        <!-- 字段名 -->
        <div class="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <div class="w-[20%]">参数名</div>
          <div class="w-[25%]">类型</div>
          <div class="w-[55%]">值</div>
        </div>
        <!-- 循环遍历字段列表 -->
        <div v-for="(input, idx) in form?.inputs" :key="idx" class="flex items-center gap-1">
          <div class="w-[20%] flex-shrink-0">
            <div class="text-xs text-gray-500">{{ input.name }}</div>
          </div>
          <div class="w-[25%] flex-shrink-0">
            <a-select
              size="mini"
              v-model="input.type"
              class="px-2"
              :options="[
                { label: '引用', value: 'ref' },
                { label: 'STRING', value: 'string' },
                { label: 'INT', value: 'int' },
                { label: 'FLOAT', value: 'float' },
                { label: 'BOOLEAN', value: 'boolean' },
              ]"
            />
          </div>
          <div class="w-[55%] flex-shrink-0 flex items-center gap-1">
            <a-input
              v-if="input.type !== 'ref'"
              size="mini"
              v-model="input.content"
              placeholder="请输入参数值"
            />
            <a-select
              v-else
              placeholder="请选择引用变量"
              size="mini"
              tag-nowrap
              v-model="input.ref"
              :options="inputRefOptions"
            />
          </div>
        </div>
      </div>
      <a-divider class="my-4" />
      <!-- 问题分类 -->
      <div class="flex flex-col gap-2">
        <!-- 标题&操作按钮 -->
        <div class="flex items-center justify-between">
          <!-- 左侧标题 -->
          <div class="flex items-center gap-2 text-gray-700 font-semibold">
            <div class="">问题分类</div>
            <a-tooltip content="设置不同的问题分类，LLM会根据query自动选择对应的路由。">
              <icon-question-circle />
            </a-tooltip>
          </div>
          <!-- 右侧新增问题按钮 -->
          <a-button type="text" size="mini" class="!text-gray-700" @click="() => addClass()">
            <template #icon>
              <icon-plus />
            </template>
          </a-button>
        </div>
        <div
          v-for="(classifier, idx) in form?.classes"
          :key="idx"
          class="bg-white border p-3 rounded-xl mb-2"
        >
          <!-- 分类标题&操作按钮 -->
          <div class="flex items-center justify-between mb-2">
            <!-- 左侧标题 -->
            <div class="font-bold text-gray-700">分类{{ idx + 1 }}</div>
            <!-- 右侧操作按钮 -->
            <div class="">
              <a-button
                type="text"
                size="mini"
                class="!text-gray-700"
                @click="() => removeClass(idx)"
              >
                <template #icon>
                  <icon-delete />
                </template>
              </a-button>
            </div>
          </div>
          <!-- 分类输入数据 -->
          <a-textarea
            v-model="classifier.query"
            class="rounded-lg"
            placeholder="在这里输入你的主题内容"
          />
        </div>
        <!-- 空数据状态 -->
        <a-empty v-if="form?.classes.length <= 0" class="my-4">该节点暂无分类数据</a-empty>
      </div>
      <a-divider class="my-4" />
      <!-- 输出参数 -->
      <div class="flex flex-col gap-2">
        <!-- 输出标题 -->
        <div class="font-semibold text-gray-700">输出数据</div>
        <!-- 字段标题 -->
        <div class="text-gray-500 text-xs">参数名</div>
        <!-- 输出参数列表 -->
        <div class="text-gray-700">该节点无输出参数</div>
      </div>
      <a-divider class="my-4" />
      <!-- 保存按钮 -->
      <a-button
        :loading="props.loading"
        type="primary"
        size="small"
        html-type="submit"
        long
        class="rounded-lg"
      >
        保存
      </a-button>
    </a-form>
  </div>
</template>

<style scoped></style>
