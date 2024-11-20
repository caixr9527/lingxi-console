<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
const route = useRoute()

const currentStep = ref(1)
</script>

<template>
  <div class="p-6">
    <!-- 回退按钮与标题 -->
    <div class="flex items-center mb-6 gap-4">
      <router-link
        :to="{
          name: 'space-datasets-documents-list',
          params: { dataset_id: route.params?.dataset_id as string },
        }"
      >
        <a-button size="mini" type="text" class="!text-gray-700">
          <template #icon>
            <icon-left />
          </template>
        </a-button>
      </router-link>
      <div class="text-lg font-bold text-gray-700">添加文件</div>
    </div>
    <!-- 步骤条 -->
    <div class="w-[520px] mx-auto">
      <a-steps :current="currentStep">
        <a-step>上传</a-step>
        <a-step>分段设置</a-step>
        <a-step>数据处理</a-step>
      </a-steps>
    </div>
    <!-- 步骤条页面 -->
    <div class="min-h-[calc(100vh-160px)] p-[48px]">
      <!-- 上传页面 -->
      <div v-if="currentStep === 1" class="">
        <!-- 上传文件按钮 -->
        <a-upload
          draggable
          accept=".doc,.docx,.pdf,.txt,.md,.markdown"
          :limit="10"
          multiple
          tip="支持PDF、TXT、DOC、DOCX、MD，最多可上传10个文件，每个文件大小不超过10MB"
        />
      </div>
      <!-- 分段设置页面 -->
      <div v-if="currentStep === 2" class="">
        <!-- 自动分段与清洗 -->
        <div class="px-5 py-4 bg-white rounded-lg border cursor-pointer mb-4">
          <div class="font-bold text-gray-700 mb-2">自动分段与清洗</div>
          <div class="text-gray-500">自动分段与预处理规则</div>
        </div>
        <!-- 自定义 -->
        <div class="px-5 py-4 bg-white rounded-lg border cursor-pointer mb-4">
          <div class="font-bold text-gray-700 mb-2">自定义</div>
          <div class="text-gray-500">自定义分段规则、分段长度与预处理规则</div>
          <!-- 自定义表单 -->
          <div>
            <a-divider />
            <!-- 表单选项 -->
            <a-form layout="vertical">
              <a-form-item field="separators" label="分段标识符" required asterisk-position="end">
                <a-input-tag placeholder="请输入分段标识符，按下enter结束" />
              </a-form-item>
              <a-form-item field="chunk_size" label="分段最大长度" required asterisk-position="end">
                <a-input-number
                  :min="100"
                  :max="1000"
                  :step="1"
                  :default-value="500"
                  placeholder="请输入100-1000"
                />
              </a-form-item>
              <a-form-item field="chunk_overlap" label="块重叠数" required asterisk-position="end">
                <a-input-number
                  :min="0"
                  :max="500"
                  :step="1"
                  :default-value="50"
                  placeholder="请输入0-500"
                />
              </a-form-item>
              <a-form-item label="文本预处理规则">
                <a-checkbox-group direction="vertical">
                  <a-checkbox value="remove_extra_space">
                    替换掉连续的空格、换行符和制表符
                  </a-checkbox>
                  <a-checkbox value="remove_url_and_email"> 删除所有URL和电子邮件 </a-checkbox>
                </a-checkbox-group>
              </a-form-item>
            </a-form>
          </div>
        </div>
      </div>
      <!-- 数据处理页面 -->
      <div v-if="currentStep === 3" class="">
        <!-- 数据处理状态提示 -->
        <div class="text-gray-900 mb-4 text-base">数据正在处理中</div>
        <!-- 处理中的文档列表 -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between px-4 py-3 bg-white rounded-lg border">
            <!-- 左侧文件信息 -->
            <div class="flex items-center gap-2.5">
              <a-avatar shape="square" class="bg-blue-700" :size="32">
                <icon-file />
              </a-avatar>
              <div>
                <div class="text-gray-700">基于工具调用的智能体设计与实现.md</div>
                <div class="text-gray-500">15.63kb</div>
              </div>
            </div>
            <!-- 处理的百分比 -->
            <div class="text-gray-500">95%</div>
          </div>
        </div>
      </div>
    </div>
    <!-- 按钮：涵盖上一步和下一步 -->
    <div class="flex items-center justify-between ps-[48px]">
      <div class=""></div>
      <div class="flex items-center gap-2">
        <a-button
          class="rounded-lg"
          @click="
            () => {
              if (currentStep > 1) currentStep--
            }
          "
        >
          上一步
        </a-button>
        <a-button
          type="primary"
          class="rounded-lg"
          @click="
            () => {
              if (currentStep < 3) currentStep++
            }
          "
        >
          下一步
        </a-button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
