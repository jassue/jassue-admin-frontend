import axios from 'axios'
import { getToken } from './auth'
import store from '@/store'
import { Message } from 'element-ui'
import i18nInstance from '@/lang'
import routerInstance from '@/router'

// axios instance
const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // baseUrl
  timeout: 5000 // request timeout
})

// Add a request interceptor
instance.interceptors.request.use(
  config => {
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    // Do something before request is sent
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
    // let message = error.message
    // if (error.response.data && error.response.data.message) {
    //   message = error.response.data.message
    // }
    if (error.response.data.error_code === 40100) {
      store.dispatch('user/resetToken')
      Message({
        message: i18nInstance.t('token_expired'),
        type: 'error',
        duration: 3 * 1000
      })
      routerInstance.push('/login')
    }
    // Message({
    //   message: message,
    //   type: 'error',
    //   duration: 3 * 1000
    // })
    return Promise.reject(error)
  }
)

export default instance
