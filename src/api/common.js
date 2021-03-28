import request from '@/utils/request'

class CommonResource {
  constructor() {
    this.uri = 'common'
  }

  downloadExcelTemplate(type) {
    return request({
      baseURL: '/api',
      url: '/' + this.uri + '/excel_template',
      method: 'get',
      params: {
        type: type
      },
      responseType: 'blob'
    })
  }

  excelUpload(file, onUploadProgress) {
    const formData = new FormData()
    formData.append('file', file)
    return request({
      baseURL: '/api',
      url: '/' + this.uri + '/excel_upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    })
  }

  imageUpload(imgFile, business) {
    const formData = new FormData()
    formData.append('image', imgFile)
    formData.append('image_type', 2)
    formData.append('business', business)
    return request({
      baseURL: '/api',
      url: '/' + this.uri + '/image_upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default CommonResource
