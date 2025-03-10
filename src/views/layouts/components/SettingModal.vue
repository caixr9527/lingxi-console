<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAccountStore } from '@/stores/account'
import {
  useGetCurrentUser,
  useUpdateAvatar,
  useUpdateName,
  useUpdatePassword,
} from '@/hooks/use-account'
import { useUploadImage } from '@/hooks/use-upload-file'
import { useRouter } from 'vue-router'
const router = useRouter()
const props = defineProps({
  visible: { type: Boolean, required: true },
})
const emits = defineEmits(['update:visible'])
const updateName = ref(false)
const updatePassword = ref(false)
const accountStore = useAccountStore()
const { current_user, loadCurrentUser } = useGetCurrentUser()
const { handleUpdateAvatar } = useUpdateAvatar()
const { handleUpdateName } = useUpdateName()
const { handleUpdatePassword } = useUpdatePassword()
const { image_url, handleUploadImage } = useUploadImage()
const accountForm = ref({
  fileList: [{ uid: '1', name: '账号头像', url: accountStore.account.avatar }],
  name: accountStore.account.name,
  avatar: accountStore.account.avatar,
  password: '',
  email: accountStore.account.email,
})

const updateAccount = async () => {
  await loadCurrentUser()
  accountStore.update(current_user.value)
}

const handleCancel = () => emits('update:visible', false)

watch(
  () => props.visible,
  (newValue) => {
    if (!newValue) {
      updatePassword.value = false
      updateName.value = false
    }

    accountForm.value = {
      fileList: [{ uid: '1', name: '账号头像', url: accountStore.account.avatar }],
      name: accountStore.account.name,
      avatar: accountStore.account.avatar,
      password: '',
      email: accountStore.account.email,
    }
  },
)
</script>

<template>
  <a-modal :visible="visible" hide-title :footer="false" :width="1000" @cancel="handleCancel">
    <!-- 关闭按钮 -->
    <a-button
      type="text"
      class="!text-gray-700 absolute right-5 top-5"
      size="small"
      @click="handleCancel"
    >
      <template #icon>
        <icon-close />
      </template>
    </a-button>
    <!-- 内容容器 -->
    <div class="flex min-h-[500px]">
      <!-- 左侧导航 -->
      <div class="w-[200px] border-r pr-5">
        <!-- 导航版标题 -->
        <div class="text-xl font-bold text-gray-900 mb-5">设置</div>
        <!-- 导航列表 -->
        <div class="flex flex-col gap-2">
          <div
            class="cursor-pointer bg-gray-100 hover:bg-gray-200 rounded-lg h-8 leading-8 text-gray-700 hover:text-gray-900 px-4"
          >
            账号设置
          </div>
        </div>
      </div>
      <!-- 右侧内容 -->
      <div class="flex-1 px-8">
        <!-- 右侧标题 -->
        <div class="text-xl font-bold text-gray-700 mb-5">账号设置</div>
        <!-- 账号表单 -->
        <a-form :model="{}" layout="vertical">
          <a-form-item field="avatar">
            <template #label>
              <div class="flex items-center gap-1">
                账号头像
                <div class="text-red-700">*</div>
              </div>
            </template>
            <a-upload
              v-model:file-list="accountForm.fileList"
              list-type="picture-card"
              :limit="1"
              image-preview
              :custom-request="
                (option) => {
                  const uploadTask = async () => {
                    const { fileItem, onSuccess } = option
                    await handleUploadImage(fileItem.file as File)
                    accountForm.avatar = image_url
                    onSuccess(image_url)

                    await handleUpdateAvatar(String(accountForm.avatar))

                    await updateAccount()
                  }

                  uploadTask()

                  return {}
                }
              "
            />
          </a-form-item>
          <a-form-item field="name">
            <template #label>
              <div class="flex items-center gap-1">
                账号昵称
                <div class="text-red-700">*</div>
              </div>
            </template>
            <div v-if="updateName" class="flex items-center gap-2 w-full">
              <!-- 左侧输入框 -->
              <a-input
                v-model="accountForm.name"
                placeholder="请输入账号名称"
                :default-value="accountStore.account.name"
              />
              <!-- 取消&保存 -->
              <div class="flex items-center gap-1">
                <a-button
                  class="rounded-lg"
                  @click="
                    () => {
                      updateName = false
                      accountForm.name = accountStore.account.name
                    }
                  "
                >
                  取消
                </a-button>
                <a-button
                  type="primary"
                  class="rounded-lg"
                  @click="
                    async () => {
                      // 发起请求更新账号名称
                      await handleUpdateName(accountForm.name)

                      // 成功更新则重新获取账号数据并隐藏输入框
                      await updateAccount()
                      updateName = false
                    }
                  "
                >
                  保存
                </a-button>
              </div>
            </div>
            <div v-else class="flex items-center gap-1">
              <div class="">{{ accountStore.account.name }}</div>
              <a-button size="mini" type="text" class="!text-gray-700" @click="updateName = true">
                <template #icon>
                  <icon-edit />
                </template>
              </a-button>
            </div>
          </a-form-item>
          <a-form-item field="password">
            <template #label>
              <div class="flex items-center gap-1">
                账号密码
                <div class="text-red-700">*</div>
              </div>
            </template>
            <div v-if="updatePassword" class="flex items-center gap-2 w-full">
              <!-- 左侧输入框 -->
              <a-input-password v-model="accountForm.password" placeholder="请输入账号密码" />
              <!-- 取消&保存 -->
              <div class="flex items-center gap-1">
                <a-button
                  class="rounded-lg"
                  @click="
                    () => {
                      updatePassword = false
                      accountForm.password = ''
                    }
                  "
                >
                  取消
                </a-button>
                <a-button
                  type="primary"
                  class="rounded-lg"
                  @click="
                    async () => {
                      await handleUpdatePassword(accountForm.password)
                      await router.push({ name: 'auth-login' })

                      accountForm.password = ''
                      updatePassword = false
                    }
                  "
                >
                  保存
                </a-button>
              </div>
            </div>
            <div v-else class="flex items-center gap-1">
              <div class="">******</div>
              <a-button
                size="mini"
                type="text"
                class="!text-gray-700"
                @click="updatePassword = true"
              >
                <template #icon>
                  <icon-edit />
                </template>
              </a-button>
            </div>
          </a-form-item>
          <a-form-item field="email" label="绑定邮箱">
            <a-input readonly v-model="accountForm.email" />
          </a-form-item>
        </a-form>
      </div>
    </div>
  </a-modal>
</template>

<style scoped></style>
