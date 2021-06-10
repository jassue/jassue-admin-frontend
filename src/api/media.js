import request from '@/utils/request'

class MediaResource {
  downloadExcelTemplate(type) {
    return request({
      url: '/excel_template',
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
      url: '/excel_upload',
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
      url: '/image_upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default MediaResource
