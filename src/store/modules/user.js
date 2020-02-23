import { login, getInfo, logout } from '@/api/auth'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  info: null,
  token: getToken(),
  roles: [],
  permissions: []
}

const mutations = {
  SET_INFO: (state, info) => {
    state.info = info
  },
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions
  }
}

const actions = {
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password })
        .then(data => {
          const token = data.access_token
          commit('SET_TOKEN', token)
          setToken(token)
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  getInfo({ commit }) {
    return new Promise((resolve, reject) => {
      getInfo()
        .then(data => {
          const { roles, permissions } = data
          const info = { id: data.id, name: data.name, username: data.username }
          commit('SET_INFO', info)
          commit('SET_ROLES', roles.map(item => item.name))
          commit('SET_PERMISSIONS', permissions)
          resolve(data)
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  logout({ commit, state, dispatch }) {
    return new Promise((resolve, reject) => {
      logout(state.token)
        .then(() => {
          commit('SET_TOKEN', '')
          commit('SET_ROLES', [])
          commit('SET_PERMISSIONS', [])
          removeToken()
          resetRouter()
          dispatch('tagsView/delAllViews', null, { root: true })
          resolve()
        })
        .catch(error => {
          reject(error)
        })
    })
  },
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      commit('SET_ROLES', [])
      commit('SET_PERMISSIONS', [])
      removeToken()
      resolve()
    })
  },
  setInfo({ commit }, data) {
    return new Promise(resolve => {
      commit('SET_INFO', data)
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
