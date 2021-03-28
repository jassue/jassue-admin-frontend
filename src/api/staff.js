import request from '@/utils/request'
import Resource from '@/api/resource'

class StaffResource extends Resource {
  constructor() {
    super('staff')
  }

  excelImport(cacheKey) {
    return request({
      url: '/' + this.uri + '/excel_import',
      method: 'post',
      data: { cache_key: cacheKey}
    })
  }

  setDept(ids, departmentIds) {
    return request({
      url: '/' + this.uri + '/set_dept',
      method: 'post',
      data: {
        ids: ids,
        department_ids: departmentIds
      }
    })
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

  resetPassword(data) {
    return request({
      url: '/' + this.uri + '/batch/password',
      method: 'patch',
      data: data
    })
  }
}

export default StaffResource
