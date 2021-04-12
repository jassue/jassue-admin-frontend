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
  async login({ commit }, userInfo) {
    const { mobile, password } = userInfo
    const { access_token } = await login({ mobile: mobile.trim(), password: password })
    commit('SET_TOKEN', access_token)
    setToken(access_token)
  },
  async getInfo({ commit }) {
    const data = await getInfo()
    data.permissions = data.permissions.map(item => item.key)
    commit('SET_INFO', data.staff)
    commit('SET_ROLES', data.roles.map(item => item.name))
    commit('SET_PERMISSIONS', data.permissions)
    return data
  },
  async logout({ commit, state, dispatch }) {
    await logout(state.token)
    commit('SET_TOKEN', '')
    commit('SET_ROLES', [])
    commit('SET_PERMISSIONS', [])
    removeToken()
    resetRouter()
    dispatch('tagsView/delAllViews', null, { root: true })
  },
  resetToken({ commit }) {
    commit('SET_TOKEN', '')
    commit('SET_ROLES', [])
    commit('SET_PERMISSIONS', [])
    removeToken()
  },
  setInfo({ commit }, data) {
    commit('SET_INFO', data)
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
