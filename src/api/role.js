import request from '@/utils/request'
import Resource from '@/api/resource'

class RoleResource extends Resource {
  constructor() {
    super('role')
  }

  getPermissionTree() {
    return request({
      url: '/' + this.uri + '/permissions',
      method: 'post'
    })
  }

  delete(id) {
    return request({
      url: '/' + this.uri + '/delete',
      method: 'post',
      data: {
        role_id: id
      }
    })
  }
}

export default RoleResource
