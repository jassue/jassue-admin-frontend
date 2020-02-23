import request from '@/utils/request'
import Resource from '@/api/resource'

class RoleResource extends Resource {
  constructor() {
    super('roles')
  }

  getPermissionTree() {
    return request({
      url: '/' + this.uri + '/permissions',
      method: 'get'
    })
  }
}

export default RoleResource
