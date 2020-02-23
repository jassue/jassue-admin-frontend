import request from '@/utils/request'
import Resource from '@/api/resource'

class AdminResource extends Resource {
  constructor() {
    super('admins')
  }

  toggleStatus(data) {
    return request({
      url: '/' + this.uri + '/toggle-status',
      method: 'patch',
      data: data
    })
  }

  getRoleListForCreateOrUpdate() {
    return request({
      url: '/' + this.uri + '/roles',
      method: 'get'
    })
  }
}

export default AdminResource
