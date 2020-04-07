const state = {
  visitedViews: [],
  cachedViews: []
}

const mutations = {
  ADD_VISITED_VIEW: (state, view) => {
    if (state.visitedViews.some(v => v.path === view.path)) {
      return
    }
    state.visitedViews.push(
      Object.assign({}, view, { title: view.meta.title || 'no-name' })
    )
  },
  ADD_CACHED_VIEW: (state, view) => {
    if (state.cachedViews.includes(view.name)) {
      return
    }
    if (!view.meta.noCache) {
      state.cachedViews.push(view.name)
    }
  },
  DEL_VISITED_VIEW: (state, view) => {
    const index = state.visitedViews.findIndex(item => {
      if (item.path === view.path) {
        return true
      }
    })
    state.visitedViews.splice(index, 1)
  },
  DEL_CACHED_VIEW: (state, view) => {
    const index = state.cachedViews.findIndex(item => {
      if (item === view.name) {
        return true
      }
    })
    state.cachedViews.splice(index, 1)
  },
  DEL_ALL_VISITED_VIEWS: state => {
    // keep affix tags
    // const affixTags = state.visitedViews.filter(tag => tag.meta.affix)
    // state.visitedViews = affixTags
    state.visitedViews = []
  },
  DEL_ALL_CACHED_VIEWS: state => {
    state.cachedViews = []
  }
}

const actions = {
  addView({ dispatch }, view) {
    dispatch('addVisitedView', view)
    dispatch('addCachedView', view)
  },
  addVisitedView({ commit }, view) {
    commit('ADD_VISITED_VIEW', view)
  },
  addCachedView({ commit }, view) {
    commit('ADD_CACHED_VIEW', view)
  },
  delView({ dispatch, state }, view) {
    dispatch('delVisitedView', view)
    dispatch('delCachedView', view)
    return { visitedViews: [...state.visitedViews], cachedViews: [...state.cachedViews] }
  },
  delVisitedView({ commit, state }, view) {
    commit('DEL_VISITED_VIEW', view)
    return [...state.visitedViews]
  },
  delCachedView({ commit, state }, view) {
    commit('DEL_CACHED_VIEW', view)
    return [...state.cachedViews]
  },
  delAllViews({ dispatch, state }, view) {
    dispatch('delAllVisitedViews', view)
    dispatch('delAllCachedViews', view)
    return { visitedViews: [...state.visitedViews], cachedViews: [...state.cachedViews] }
  },
  delAllVisitedViews({ commit, state }) {
    commit('DEL_ALL_VISITED_VIEWS')
    return [...state.visitedViews]
  },
  delAllCachedViews({ commit, state }) {
    commit('DEL_ALL_CACHED_VIEWS')
    return [...state.cachedViews]
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
