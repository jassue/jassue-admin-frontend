import store from '@/store'

export default function checkPermission(permission) {
  if (permission) {
    const permissions = store.getters && store.getters.permissions
    if (permissions.indexOf(permission) >= 0) {
      return true
    }
    return false
  } else {
    console.error(`need permissions! Like v-permission="DASHBOARD"`)
    return false
  }
}
