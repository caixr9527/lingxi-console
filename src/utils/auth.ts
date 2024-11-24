import storage from './storage'

export default {
  isLogin: (): boolean => {
    const credential = storage.get('credential')
    const now = Math.floor(Date.now() / 1000)
    if (
      !credential ||
      !credential.access_token ||
      !credential.expire_at ||
      credential.expire_at < now
    ) {
      storage.clear()
      return false
    }
    return true
  },
}
