import request from '@/utils/request'
import Resource from '@/api/resource'

class AdminResource extends Resource {
  constructor() {
    super('admin')
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
