import request from '@/utils/request'
import Resource from '@/api/resource'

class WidgetResource extends Resource {
  constructor() {
    super('widget')
  }

  listDept(data) {
    return request({
      url: '/' + this.uri + '/list_dept',
      method: 'post',
      data: data
    })
  }

  listStaff(data) {
    return request({
      url: '/' + this.uri + '/list_staff',
      method: 'post',
      data: data
    })
  }
}

export default WidgetResource
