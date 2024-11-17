<script setup lang="ts">
import moment from 'moment'
const documents = [
  {
    character_count: 128,
    created_at: 1730791138,
    disabled_at: 0,
    enabled: true,
    error: '',
    hit_count: 7,
    id: 'f425bf62-f3ae-4d24-8e0c-5133d450f506',
    name: '满江红.md',
    position: 6,
    status: 'completed',
    updated_at: 1730791138,
  },
  {
    character_count: 217,
    created_at: 1730790923,
    disabled_at: 0,
    enabled: true,
    error: '',
    hit_count: 2,
    id: '72d5a696-d1fd-4139-9ef4-4ccf93ddc6ca',
    name: '将进酒.md',
    position: 5,
    status: 'completed',
    updated_at: 1730790923,
  },
  {
    character_count: 0,
    created_at: 1730790654,
    disabled_at: 0,
    enabled: false,
    error: 'failed to find libmagic.  Check your installation',
    hit_count: 0,
    id: '04fc03c5-b43c-4fbb-8371-418574dc190f',
    name: '将进酒.txt',
    position: 4,
    status: 'error',
    updated_at: 1730790654,
  },
  {
    character_count: 1029,
    created_at: 1730596443,
    disabled_at: 0,
    enabled: true,
    error: '',
    hit_count: 8,
    id: '796d1f5b-79ac-478c-a07c-0f7565a450b8',
    name: '长恨歌.md',
    position: 3,
    status: 'completed',
    updated_at: 1730596443,
  },
  {
    character_count: 1029,
    created_at: 1730596212,
    disabled_at: 0,
    enabled: false,
    error: '',
    hit_count: 0,
    id: '5b98dd22-4d51-4b43-aba3-8c5ca3616f9a',
    name: '长恨歌.md',
    position: 2,
    status: 'indexing',
    updated_at: 1730596212,
  },
  {
    character_count: 67576,
    created_at: 1730596067,
    disabled_at: 0,
    enabled: true,
    error: '',
    hit_count: 14,
    id: '38d5df91-4cdc-4407-931b-283eebb836f8',
    name: '长恨歌.md',
    position: 1,
    status: 'completed',
    updated_at: 1730596067,
  },
]
</script>

<template>
  <div class="p-6">
    <!-- 顶部知识库详情 -->
    <div class="flex items-center w-full gap-2 mb-6">
      <!-- 左侧回退按钮 -->
      <router-link :to="{ name: 'space-datasets-list' }">
        <a-button size="mini" type="text" class="!text-gray-700">
          <template #icon>
            <icon-left />
          </template>
        </a-button>
      </router-link>
      <!-- 右侧知识库信息 -->
      <div class="flex items-center gap-3">
        <!-- 知识库图标 -->
        <a-avatar :size="40" shape="square" class="rounded-lg" image-url="" />
        <!-- 知识库信息 -->
        <div class="flex flex-col justify-between h-[40px]">
          <div class="text-gray-700">知识库 / LLMOPS知识库</div>
          <div class="flex items-center gap-2">
            <a-tag size="small" class="rounded h-[18px] leading-[18px] bg-gray-200 text-gray-500">
              10 文档
            </a-tag>
            <a-tag size="small" class="rounded h-[18px] leading-[18px] bg-gray-200 text-gray-500">
              145命中
            </a-tag>
            <a-tag size="small" class="rounded h-[18px] leading-[18px] bg-gray-200 text-gray-500">
              10 关联应用
            </a-tag>
          </div>
        </div>
      </div>
    </div>
    <!-- 中间检索以及召回测试 -->
    <div class="flex items-center justify-between mb-6">
      <!-- 左侧搜索框 -->
      <a-input-search
        placeholder="请输入关键词搜索文档"
        class="w-[240px] bg-white rounded-lg border-gray-200"
      />
      <!-- 右侧按钮 -->
      <a-space :size="12">
        <a-button class="rounded-lg">召回测试</a-button>
        <a-button type="primary" class="rounded-lg">添加文件</a-button>
      </a-space>
    </div>
    <!-- 底部表格 -->
    <div>
      <!-- 表格内容 -->
      <a-table
        hoverable
        :pagination="{
          total: 50,
          current: 1,
          defaultCurrent: 1,
          pageSize: 20,
          defaultPageSize: 20,
        }"
        :data="documents"
        :bordered="{
          wrapper: false,
        }"
      >
        <template #columns>
          <a-table-column
            title="#"
            data-index="position"
            align="center"
            :width="80"
            header-cell-class="rounded-tl-lg !bg-gray-200 text-gray-700"
            cell-class="bg-transparent text-gray-700"
          />
          <a-table-column
            title="文档名"
            data-index="name"
            :width="400"
            header-cell-class="!bg-gray-200 text-gray-700"
            cell-class="bg-transparent text-gray-700"
          >
            <template #cell="{ record }">
              <div class="line-clamp-1">
                {{ record.name }}
              </div>
            </template>
          </a-table-column>
          <a-table-column
            title="字符数"
            data-index="character_count"
            header-cell-class="!bg-gray-200 text-gray-700"
            cell-class="bg-transparent text-gray-700"
          >
            <template #cell="{ record }">
              {{ (record.character_count / 1000).toFixed(1) }}k
            </template>
          </a-table-column>
          <a-table-column
            title="召回次数"
            data-index="hit_count"
            header-cell-class="!bg-gray-200 text-gray-700"
            cell-class="bg-transparent text-gray-700"
          />
          <a-table-column
            title="上传时间"
            data-index="created_at"
            header-cell-class="!bg-gray-200 text-gray-700"
            cell-class="bg-transparent text-gray-700"
          >
            <template #cell="{ record }">
              {{ moment(record.created_at * 1000).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </a-table-column>
          <a-table-column
            title="状态"
            data-index="enabled"
            header-cell-class="!bg-gray-200 text-gray-700"
            cell-class="bg-transparent text-gray-700"
          >
            <template #cell="{ record }">
              <a-space>
                <div
                  v-if="record.enabled"
                  class="w-2 h-2 bg-green-500 rounded-sm border border-green-700"
                ></div>
                <div v-else class="w-2 h-2 bg-gray-500 rounded-sm border border-gray-700"></div>
                <div v-if="record.enabled" class="text-gray-700">可用</div>
                <div v-else class="text-gray-700">已禁用</div>
              </a-space>
            </template>
          </a-table-column>
          <a-table-column
            title="操作"
            data-index="operator"
            header-cell-class="rounded-tr-lg !bg-gray-200 text-gray-700"
            cell-class="bg-transparent text-gray-700 !h-[40px]"
            :width="100"
          >
            <template #cell="{ record }">
              <a-space :size="0">
                <template #split>
                  <a-divider direction="vertical" />
                </template>
                <a-tooltip
                  position="left"
                  v-if="record.status === 'error'"
                  :content="`错误信息: ${record.error}`"
                >
                  <a-switch size="small" type="round" :default-checked="false" disabled />
                </a-tooltip>
                <a-switch
                  v-else
                  size="small"
                  type="round"
                  :model-value="record.enabled"
                  @change="(value) => {}"
                />
                <a-dropdown position="br">
                  <a-button type="text" size="mini" class="!text-gray-700">
                    <template #icon>
                      <icon-more />
                    </template>
                  </a-button>
                  <template #content>
                    <a-doption @click="() => {}">重命名 </a-doption>
                    <a-doption class="!text-red-700" @click="() => {}"> 删除 </a-doption>
                  </template>
                </a-dropdown>
              </a-space>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>
  </div>
</template>

<style scoped></style>
