import { constantRouterMap, asyncRouterMap } from '@/router'

function hasPermission(permissions, route) {
  if (route.meta && route.meta.permission) {
    return permissions.indexOf(route.meta.permission) >= 0
  } else {
    return true
  }
}

function filterAsyncRoutes(routes, permissions) {
  const res = []
  routes.forEach(route => {
    const tmp = { ...route }
    if (hasPermission(permissions, tmp)) {
      if (tmp.children && tmp.children.length > 0) {
        tmp.children = filterAsyncRoutes(tmp.children, permissions)
      }
      res.push(tmp)
    }
  })
  return res
}

const permission = {
  namespaced: true,
  state: {
    routes: [],
    addRoutes: []
  },
  mutations: {
    SET_ROUTES: (state, routes) => {
      state.addRoutes = routes
      state.routes = constantRouterMap.concat(routes)
    }
  },
  actions: {
    generateRoutes({ commit }, data) {
      return new Promise(resolve => {
        const { permissions } = data
        const accessRoutes = filterAsyncRoutes(asyncRouterMap, permissions)
        commit('SET_ROUTES', accessRoutes)
        resolve(accessRoutes)
      })
    }
  }
}

export default permission
