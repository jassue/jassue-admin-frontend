import axios from 'axios'
import { getToken } from './auth'
import store from '@/store'
import { Message } from 'element-ui'
import i18nInstance from '@/lang'
import routerInstance from '@/router'

// axios instance
const instance = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // baseUrl
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
    if (response.config.responseType === 'blob') {
      downloadBlob(response)
      return
    }

    if (response.data.error_code === 0) {
      return response.data.data
    } else {
      if (response.data.error_code === 40100) {
        store.dispatch('user/resetToken')
        Message({
          message: i18nInstance.t('token_expired'),
          type: 'error',
          duration: 3 * 1000
        })
        routerInstance.push('/login')
      } else {
        Message({
          message: response.data.message,
          type: 'error',
          duration: 3 * 1000
        })
      }
      return Promise.reject(response.data)
    }
  },
  error => {
    // Do something with response error
    let message = ''
    if (error.response === undefined) {
      message = error.toString()
    } else {
      if (error.response.status === 500) {
        message = i18nInstance.t('system_error') + error.response.data.message
      } else {
        message = error.response.data.message
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

// 下载文件
export function downloadBlob(response) {
  // 提取文件名
  const fileName = response.headers['content-disposition'].match(/''(.*)/)[1]
  // 将二进制流转为blob
  const blob = new Blob([response.data], { type: 'application/octet-stream' })
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    // 兼容IE，window.navigator.msSaveBlob：以本地方式保存文件
    window.navigator.msSaveBlob(blob, decodeURI(fileName))
  } else {
    // 创建新的URL并指向File对象或者Blob对象的地址
    const blobURL = window.URL.createObjectURL(blob)
    // 创建a标签，用于跳转至下载链接
    const tempLink = document.createElement('a')
    tempLink.style.display = 'none'
    tempLink.href = blobURL
    tempLink.setAttribute('download', decodeURI(fileName))
    // 兼容：某些浏览器不支持HTML5的download属性
    if (typeof tempLink.download === 'undefined') {
      tempLink.setAttribute('target', '_blank')
    }
    // 挂载a标签
    document.body.appendChild(tempLink)
    tempLink.click()
    document.body.removeChild(tempLink)
    // 释放blob URL地址
    window.URL.revokeObjectURL(blobURL)
  }
}

export default instance
