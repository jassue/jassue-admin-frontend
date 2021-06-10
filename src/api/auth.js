import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/auth/login',
    method: 'post',
    data: data
  })
}

export function getInfo() {
  return request({
    url: '/auth/info',
    method: 'post'
  })
}

export function logout() {
  return request({
    url: '/auth/logout',
    method: 'post'
  })
}

export function setPassword(data) {
  return request({
    url: '/auth/set_password',
    method: 'post',
    data: data
  })
}

export function updatePersonalInfo(data) {
  return request({
    url: '/auth/update_profile',
    method: 'post',
    data: data
  })
}
