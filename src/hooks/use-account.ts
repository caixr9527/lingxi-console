import { ref } from 'vue'
import { getCurrentUser, updateAvatar, updateName, updatePassword } from '@/services/account'
import { Message } from '@arco-design/web-vue'
import JSEncrypt from 'jsencrypt'

export const useGetCurrentUser = () => {
  const loading = ref(false)
  const current_user = ref<Record<string, any>>({})

  const loadCurrentUser = async () => {
    try {
      loading.value = true
      const resp = await getCurrentUser()
      current_user.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, current_user, loadCurrentUser }
}

export const useUpdateAvatar = () => {
  const loading = ref(false)

  const handleUpdateAvatar = async (avatar: string) => {
    try {
      loading.value = true
      const resp = await updateAvatar(avatar)
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateAvatar }
}

export const useUpdateName = () => {
  const loading = ref(false)

  const handleUpdateName = async (name: string) => {
    try {
      loading.value = true
      await updateName(name)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdateName }
}

export const useUpdatePassword = () => {
  const loading = ref(false)

  const handleUpdatePassword = async (password: string) => {
    try {
      const encryptor = new JSEncrypt()
      encryptor.setPublicKey(`-----BEGIN PUBLIC KEY-----
        MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAowxB6KlOBUx2ary8Rjjt
        Y4vQ1BMpH40FwvpTk2gmB5/edvFDTzW9X38HLkVgiKWWSTdErc1EI6qZ0i1eh0zQ
        GXfKr+WsFhm3CadsAAKt2duxKtQqmPryyttJEUqluZANJxVkrjhCJVMNOU3/adGr
        UTYg3XBY4nboO5ndeu5Ui1ecyUDto6ly2zID6AvC2xrMNTKtSbQxy1bWjy50sGYE
        3dg6+VrizkVIyPwe9iWqMEbGFdNqRODRgmwBJT2+64EqXig+O3Z8w+4/SyagpUDY
        iReAufHqabKuBOOZw9r6SWHewMmVVY2NrR1bZ86BOs/KydIug1VHUhpQolSn7XaJ
        wQIDAQAB
        -----END PUBLIC KEY-----
        `)
      loading.value = true
      const resp = await updatePassword(String(encryptor.encrypt(password)))
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleUpdatePassword }
}
