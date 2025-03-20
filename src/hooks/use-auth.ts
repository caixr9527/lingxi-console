import { ref } from 'vue'
import { logout, passwordLogin } from '@/services/auth'
import { Message } from '@arco-design/web-vue'
import JSEncrypt from 'jsencrypt'

export const useLogout = () => {
  const loading = ref(false)

  const handleLogout = async () => {
    try {
      loading.value = true
      const resp = await logout()
      Message.success(resp.message)
    } finally {
      loading.value = false
    }
  }

  return { loading, handleLogout }
}

export const usePasswordLogin = () => {
  const loading = ref(false)
  const authorization = ref<Record<string, any>>({})

  const handlePasswordLogin = async (email: string, password: string) => {
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
      const resp = await passwordLogin(email, String(encryptor.encrypt(password)))
      authorization.value = resp.data
    } finally {
      loading.value = false
    }
  }

  return { loading, authorization, handlePasswordLogin }
}
