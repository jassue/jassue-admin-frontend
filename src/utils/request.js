import axios from 'axios'
import { getToken } from './auth'
import store from '@/store'
import { Message } from 'element-ui'
import i18nInstance from '@/lang'
import routerInstance from '@/router'

// axios instance
const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API + '/api/admin', // baseUrl
  timeout: 5000, // request timeout
  headers: { 'X-Requested-With': 'XMLHttpRequest' }
})

// Add a request interceptor
instance.interceptors.request.use(
  config => {
    // Do something before request is sent
    config.headers['Language'] = store.getters.language
    if (getToken()) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
  },
  error => {
    // Do something with response error
    console.log(error) // for debug
    return Promise.reject(error)
  }
)

// Add a response interceptor
instance.interceptors.response.use(
  response => {
    // Do something with response data
    return response.data
  },
  error => {
    // Do something with response error
    let message = ''
    if (error.response === undefined) {
      message = error.toString()
    } else {
      if (error.response.data.error_code === 40100) {
        store.dispatch('user/resetToken')
        Message({
          message: i18nInstance.t('token_expired'),
          type: 'error',
          duration: 3 * 1000
        })
        routerInstance.push('/login')
      }
      if (error.response.status === 400 || error.response.status === 403 || error.response.status === 422) {
        message = error.response.data.message
      }
      if (error.response.status === 500) {
        message = i18nInstance.t('system_error') + error.response.data.message
      }
    }
    if (message !== '') {
      Message({
        message: message,
        type: 'error',
        duration: 3 * 1000
      })
    }
    return Promise.reject(error)
  }
)

export default instance
