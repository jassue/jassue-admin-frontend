import request from '@/utils/request'
import Resource from '@/api/resource'

class SettingResource extends Resource {
  constructor() {
    super('system/setting')
  }

  detail(data) {
    return request({
      url: '/' + this.uri + '/detail',
      method: 'post',
      data: data
    })
  }

  update(data) {
    return request({
      url: '/' + this.uri + '/update',
      method: 'post',
      data: data
    })
  }
}

export default SettingResource
