import Vue from 'vue'
import 'normalize.css/normalize.css' // a modern alternative to CSS resets
import ElementUI from 'element-ui'
import './styles/index.scss' // global css
import App from './App.vue'
import store from './store'
import router from './router'
import i18n from './lang'
import './utils/icons'
import './permission'

import * as filters from './filters' // global filters

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(ElementUI, {
  size: 'small',
  i18n: (key, value) => i18n.t(key, value)
})
Vue.config.productionTip = false

new Vue({
  store,
  router,
  i18n,
  render: h => h(App),
}).$mount('#app')
