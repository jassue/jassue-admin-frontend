import store from '@/store'

function checkPermission(el, binding) {
  let { value } = binding
  const permissions = store.getters && store.getters.permissions

  if (typeof value === 'string') value = [value]

  if (value && value instanceof Array) {
    if (value.length > 0) {
      const hasPermission = permissions.some(permission => {
        return value.includes(permission)
      })
      if (!hasPermission) {
        el.parentNode && el.parentNode.removeChild(el)
      }
    }
  } else {
    console.error(`need permission! Like v-permission="'permission'" or v-permission="['permission']"`)
  }
}

export default {
  inserted(el, binding) {
    checkPermission(el, binding)
  },
  update(el, binding) {
    checkPermission(el, binding)
  }
}
