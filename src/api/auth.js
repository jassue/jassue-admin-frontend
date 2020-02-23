import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/login',
    method: 'post',
    data: data
  })
}

export function getInfo() {
  return request({
    url: '/admin',
    method: 'get'
  })
}

export function logout() {
  return request({
    url: '/logout',
    method: 'post'
  })
}

export function updateInfo(data) {
  return request({
    url: '/update-info',
    method: 'put',
    data: data
  })
}
