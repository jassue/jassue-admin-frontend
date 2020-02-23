import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import camelCase from 'camelcase'
Vue.use(Vuex)

const modulesFiles = require.context('./modules', false, /\.js$/)
const modules = modulesFiles.keys().reduce((module, modulePath) => {
  const moduleName = camelCase(modulePath.replace(/^\.\/(.*)\.\w+$/, '$1'))
  const value = modulesFiles(modulePath)
  module[moduleName] = value.default
  return module
}, {})

const store = new Vuex.Store({
  modules,
  getters
})

export default store
