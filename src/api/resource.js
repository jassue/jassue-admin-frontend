import request from '@/utils/request'

class Resource {
  constructor(uri) {
    this.uri = uri
  }
  list(params) {
    return request({
      url: '/' + this.uri + '/list',
      method: 'post',
      data: params
    })
  }
  get(id) {
    return request({
      url: '/' + this.uri + '/detail',
      method: 'post',
      data: {
        id: id
      }
    })
  }
  create(params) {
    return request({
      url: '/' + this.uri + '/create',
      method: 'post',
      data: params
    })
  }
  update(params) {
    return request({
      url: '/' + this.uri + '/update',
      method: 'post',
      data: params
    })
  }
  delete(ids) {
    return request({
      url: '/' + this.uri + '/delete',
      method: 'post',
      data: {
        ids: ids
      }
    })
  }
}

export default Resource
