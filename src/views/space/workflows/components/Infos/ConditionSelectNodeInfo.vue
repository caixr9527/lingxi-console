<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useVueFlow } from '@vue-flow/core'
import { v4 } from 'uuid'
import { cloneDeep } from 'lodash'
import { getReferencedVariables } from '@/utils/helper'
import { Message, type ValidatedError } from '@arco-design/web-vue'
import IconIf from '@/components/icons/IconIf.vue'
import { onMounted } from 'vue'
import { color } from 'echarts'
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

// 定义添加表单输入字段函数
const addFormInputField = () => {
  form.value?.inputs.push({ name: '', type: 'string', content: null, ref: '' })
  Message.success('新增输入字段成功')
}

// 定义添加问题分类字段函数
const addClass = () => {
  if (form.value?.classes.length >= 5) {
    Message.warning('最多只能有5个条件分支')
    return
  }
  const source_handle_id = v4()
  form.value?.classes.splice(1, 0, {
    condition_group: [],
    logical_type: 'and',
    priority: 0,
    node_id: '',
    node_type: '',
    source_handle_id: source_handle_id,
  })
  addCondition(source_handle_id)
  Message.success('新增成功')
}

// 定义移除问题分类
const removeClass = (source_handle_id: string) => {
  const index = form.value?.classes.findIndex(
    (item: any) => item.source_handle_id === source_handle_id,
  )
  form.value?.classes?.splice(index, 1)
}

// 定义移除表单输入字段函数
const removeFormInputField = (idx: number) => {
  form.value?.inputs?.splice(idx, 1)
}

const removeCondition = (source_handle_id: string, cgIdx: number) => {
  const index = form.value?.classes.findIndex(
    (item: any) => item.source_handle_id === source_handle_id,
  )
  form.value?.classes[index]?.condition_group?.splice(cgIdx, 1)
}

const addCondition = (source_handle_id: string) => {
  const index = form.value?.classes.findIndex(
    (item: any) => item.source_handle_id === source_handle_id,
  )
  form.value?.classes[index]?.condition_group?.push({
    variable: '',
    parameter: '',
    condition_type: '',
  })
}

const selectOp = (source_handle_id: string, cgIdx: number) => {
  const index = form.value?.classes.findIndex(
    (item: any) => item.source_handle_id === source_handle_id,
  )
  if (form.value.classes[index].condition_group[cgIdx].condition_type === 'empty') {
    form.value.classes[index].condition_group[cgIdx].parameter = 'empty'
  } else if (form.value.classes[index].condition_group[cgIdx].condition_type === 'not empty') {
    form.value.classes[index].condition_group[cgIdx].parameter = 'not empty'
  } else {
    if (
      form.value.classes[index].condition_group[cgIdx].parameter === 'empty' ||
      form.value.classes[index].condition_group[cgIdx].parameter === 'not empty'
    )
      form.value.classes[index].condition_group[cgIdx].parameter = ''
  }
}

// 定义表单提交函数
const onSubmit = async ({ errors }: { errors: Record<string, ValidatedError> | undefined }) => {
  console.log(form.value)
  // 检查表单是否出现错误，如果出现错误则直接结束
  if (errors) return

  for (const item of form.value.classes) {
    for (const itemCg of item.condition_group) {
      if (itemCg.variable === '' || itemCg.parameter === '' || itemCg.condition_type === '') {
        Message.warning('优先级' + (item.priority + 1) + '参数缺失')
        return
      }
    }
  }
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

watch(
  () => form.value.classes,
  () => {
    var index = form.value.classes.length - 1
    for (const item of form.value.classes) {
      item.priority = index
      index = index - 1
    }
  },
  { deep: true },
)

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
          content: input.value.type === 'literal' ? input.value.content : null, // 变量值内容
          ref: input.value.type === 'ref' && refExists ? ref : '', // 变量引用信息，存储引用节点id+引用变量名
        }
      }),
      outputs: [],
    }
  },
  { immediate: true },
)

const classesLength = computed(() => {
  return form.value?.classes?.length || 0
})

onMounted(() => {
  if (form.value?.classes.length > 0) {
    return
  }
  form.value?.classes.push({
    condition_group: [],
    logical_type: '',
    priority: 0,
    node_id: '',
    node_type: '',
    source_handle_id: v4(),
  })
  form.value?.classes.push({
    condition_group: [{ variable: '', parameter: '', condition_type: '' }],
    logical_type: 'and',
    priority: 0,
    node_id: '',
    node_type: '',
    source_handle_id: v4(),
  })
})
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
        <a-avatar :size="30" shape="square" class="bg-gray-700 rounded-lg flex-shrink-0">
          <icon-if />
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
            <a-tooltip
              content="输入给选择器的参数，可在下方选择器中引用。所有输入参数会被转为string输入。"
            >
              <icon-question-circle />
            </a-tooltip>
          </div>
          <!-- 右侧新增字段按钮 -->
          <a-button
            type="text"
            size="mini"
            class="!text-gray-700"
            @click="() => addFormInputField()"
          >
            <template #icon>
              <icon-plus />
            </template>
          </a-button>
        </div>
        <!-- 字段名 -->
        <div class="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <div class="w-[20%]">参数名</div>
          <div class="w-[25%]">类型</div>
          <div class="w-[47%]">值</div>
          <div class="w-[8%]"></div>
        </div>
        <!-- 循环遍历字段列表 -->
        <div v-for="(input, idx) in form?.inputs" :key="idx" class="flex items-center gap-1">
          <div class="w-[20%] flex-shrink-0">
            <a-input v-model="input.name" size="mini" placeholder="请输入参数名" class="!px-2" />
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
                { label: 'LIST[STRING]', value: 'list[string]' },
                { label: 'LIST[INT]', value: 'list[int]' },
                { label: 'LIST[FLOAT]', value: 'list[float]' },
                { label: 'LIST[BOOLEAN]', value: 'list[boolean]' },
              ]"
            />
          </div>
          <div class="w-[47%] flex-shrink-0 flex items-center gap-1">
            <a-input-tag
              v-if="input.type.startsWith('list')"
              size="mini"
              v-model="input.content"
              :default-value="[]"
              placeholder="请输入参数值，按回车结束"
            />
            <a-input
              v-else-if="input.type !== 'ref'"
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
          <div class="w-[8%] text-right">
            <icon-minus-circle
              class="text-gray-500 hover:text-gray-700 cursor-pointer flex-shrink-0"
              @click="() => removeFormInputField(idx)"
            />
          </div>
        </div>
        <!-- 空数据状态 -->
        <a-empty v-if="form?.inputs.length <= 0" class="my-4">该节点暂无输入数据</a-empty>
      </div>
      <a-divider class="my-4" />
      <!-- 条件分支 -->
      <div class="flex flex-col gap-2">
        <!-- 标题&操作按钮 -->
        <div class="flex items-center justify-between">
          <!-- 左侧标题 -->
          <div class="flex items-center gap-2 text-gray-700 font-semibold">
            <div class="">条件分支</div>
            <a-tooltip content="设置不同的条件分支，选择器会自动选择对应的路由。">
              <icon-question-circle />
            </a-tooltip>
          </div>
          <!-- 右侧新增按钮 -->
          <a-button type="text" size="mini" class="!text-gray-700" @click="() => addClass()">
            <template #icon>
              <icon-plus />
            </template>
          </a-button>
        </div>
        <div
          v-for="(classifier, idx) in [...form.classes].reverse()"
          :key="idx"
          class="bg-white border p-3 rounded-xl mb-2"
        >
          <!-- 分类标题&操作按钮 -->
          <div class="flex items-center justify-between mb-2">
            <!-- 左侧标题 -->
            <div class="font-bold text-gray-700">
              {{ idx === classesLength - 1 ? '否则' : idx === 0 ? '如果' : '否则如果' }}
              <a-tag color="green">
                {{ '优先级' + (classifier.priority + 1) }}
              </a-tag>
            </div>
            <!-- 右侧操作按钮 -->
            <div class="">
              <a-button
                v-if="idx !== classesLength - 1 && idx !== 0"
                type="text"
                size="mini"
                class="!text-gray-700"
                @click="() => removeClass(classifier.source_handle_id)"
              >
                <template #icon>
                  <icon-delete />
                </template>
              </a-button>
            </div>
          </div>
          <!-- 条件选择输入数据 -->
          <div class="flex items-center justify-between py-1">
            <div v-if="classifier.condition_group.length > 1" class="flex items-center">
              <a-select
                :bordered="false"
                size="mini"
                v-model="classifier.logical_type"
                default-value="and"
              >
                <a-option value="and">且</a-option>
                <a-option value="or">或</a-option>
              </a-select>
            </div>
            <div class="flex-1 items-center">
              <div
                v-for="(cg, cgIdx) in classifier.condition_group"
                :key="cgIdx"
                class="flex items-center justify-between py-1"
              >
                <a-space>
                  <div class="flex items-center w-[60px]">
                    <a-select
                      size="mini"
                      v-model="cg.condition_type"
                      @change="selectOp(classifier.source_handle_id, cgIdx)"
                      class="rounded-lg"
                    >
                      <a-option value="==">=</a-option>
                      <a-option value="!=">≠</a-option>
                      <a-option value=">">&gt;</a-option>
                      <a-option value=">=">&ge;</a-option>
                      <a-option value="<">&lt;</a-option>
                      <a-option value="<=">&le;</a-option>
                      <a-option value="in">包含</a-option>
                      <a-option value="not in">不包含</a-option>
                      <a-option value="empty">为空</a-option>
                      <a-option value="not empty">不为空</a-option>
                      <a-option value="starts_with">开头是</a-option>
                      <a-option value="ends_with">结尾是</a-option>
                    </a-select>
                  </div>
                  <div class="flex-1 items-center w-[180px]">
                    <a-space direction="vertical" fill>
                      <a-select size="mini" v-model="cg.variable" class="rounded-lg">
                        <a-option v-for="item in form?.inputs" :key="item.name" :value="item.name">
                          {{ item.name }}
                        </a-option>
                      </a-select>
                      <a-input
                        class="rounded-lg"
                        :disabled="
                          cg.condition_type === 'empty' || cg.condition_type === 'not empty'
                        "
                        size="mini"
                        v-model="cg.parameter"
                        allow-clear
                      />
                    </a-space>
                  </div>
                  <div class="flex-1 items-center">
                    <a-button
                      v-if="cgIdx !== 0"
                      type="text"
                      size="mini"
                      class="!text-gray-700"
                      @click="() => removeCondition(classifier.source_handle_id, cgIdx)"
                    >
                      <template #icon>
                        <icon-delete />
                      </template>
                    </a-button>
                  </div>
                </a-space>
              </div>
              <a-button
                v-if="idx !== classesLength - 1"
                type="primary"
                size="mini"
                @click="() => addCondition(classifier.source_handle_id)"
              >
                <template #icon>
                  <icon-plus />
                </template>
                新增
              </a-button>
            </div>
          </div>
        </div>
        <!-- 空数据状态 -->
        <a-empty v-if="form?.classes.length <= 0" class="my-4">该节点暂无条件选择</a-empty>
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

<style scoped>
.arco-select-option {
  font-size: 10px !important;
}

.arco-select-view-suffix {
  width: 12px !important;
  height: 12px !important;
}
</style>
