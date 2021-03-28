import request from '@/utils/request'
import Resource from '@/api/resource'

class DepartmentResource extends Resource {
  constructor() {
    super('dept')
  }

  listStaff(data) {
    return request({
      url: '/' + this.uri + '/list_staff',
      method: 'post',
      data: data
    })
  }

  updateName(data) {
    return request({
      url: '/' + this.uri + '/update_name',
      method: 'post',
      data: data
    })
  }

  delete(id) {
    return request({
      url: '/' + this.uri + '/delete',
      method: 'post',
      data: {id: id}
    })
  }
}

export default DepartmentResource
