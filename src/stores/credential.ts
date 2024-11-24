import storage from '@/utils/storage'
import { defineStore } from 'pinia'
import { ref } from 'vue'

const initCredential = {
  access_token: '',
  expire_at: 0,
}

export const useCredentialStore = defineStore('credential', () => {
  const credential = ref(storage.get('credential', initCredential))
  const update = (params: any) => {
    credential.value = params
    storage.set('credential', params)
  }
  const clear = () => {
    credential.value = initCredential
    storage.remove('credential')
  }
  return { credential, update, clear }
})
