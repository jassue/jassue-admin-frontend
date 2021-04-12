import request from '@/utils/request'
import Resource from '@/api/resource'

class AdminResource extends Resource {
  constructor() {
    super('admin')
  }

  setPassword(data) {
    return request({
      url: '/' + this.uri + '/set_password',
      method: 'post',
      data: data
    })
  }

  resetPassword(data) {
    return request({
      url: '/' + this.uri + '/reset_password',
      method: 'post',
      data: data
    })
  }
}

export default AdminResource
