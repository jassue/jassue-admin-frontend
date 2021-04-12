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

  updatePersonalInfo(data) {
    return request({
      url: '/' + this.uri + '/update_self',
      method: 'post',
      data: data
    })
  }
}

export default StaffResource
