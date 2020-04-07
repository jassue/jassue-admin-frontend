import Router from 'vue-router'
import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress'
NProgress.configure({ showSpinner: false })

// vue-router3.1.0 Uncaught (in promise)
const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}

router.beforeEach(async(to, from, next) => {
  NProgress.start()
  if (store.getters.token) {
    if (to.path === '/login') {
      next({ path: '/' })
      NProgress.done()
    } else {
      if (store.getters.permissions.length === 0) {
        try {
          const data = await store.dispatch('user/getInfo')
          const accessRoutes = await store.dispatch('permission/generateRoutes', data)
          router.addRoutes(accessRoutes)
          next({ ...to, replace: true })
        } catch (error) {
          store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      } else {
        next()
      }
    }
  } else {
    if (to.path === '/login') {
      next()
    } else {
      next('/login')
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  NProgress.done()
})
