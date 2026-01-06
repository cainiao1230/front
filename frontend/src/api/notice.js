import request from './request'
import { USE_MOCK, mockRequest, mockPagination } from './config'
import { mockNotices } from './mock/notice'

// 通知列表
export const getNotices = (params = {}) => {
  if (USE_MOCK) {
    const { page = 1, page_size = 10, type, status } = params
    
    let filteredList = [...mockNotices]
    if (type) {
      filteredList = filteredList.filter(item => item.type === type)
    }
    if (status) {
      filteredList = filteredList.filter(item => item.status === status)
    }
    
    const paginationData = mockPagination(filteredList, page, page_size)
    return mockRequest(paginationData)
  }
  
  return request.get('/api/notices', { params })
}

// 获取通知详情
export const getNoticeDetail = (id) => {
  if (USE_MOCK) {
    const notice = mockNotices.find(item => item.id === id)
    return mockRequest(notice)
  }
  
  return request.get(`/api/notices/${id}`)
}

// 发布通知
export const createNotice = (data) => {
  if (USE_MOCK) {
    const newNotice = {
      id: mockNotices.length + 1,
      ...data,
      status: 'published',
      publish_time: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
    mockNotices.push(newNotice)
    return mockRequest(newNotice)
  }
  
  return request.post('/api/notices', data)
}

// 更新通知
export const updateNotice = (id, data) => {
  if (USE_MOCK) {
    const index = mockNotices.findIndex(item => item.id === id)
    if (index !== -1) {
      mockNotices[index] = {
        ...mockNotices[index],
        ...data,
        updated_at: new Date().toISOString()
      }
      return mockRequest(mockNotices[index])
    }
    return mockRequest(null)
  }
  
  return request.put(`/api/notices/${id}`, data)
}

// 删除通知
export const deleteNotice = (id) => {
  if (USE_MOCK) {
    const index = mockNotices.findIndex(item => item.id === id)
    if (index !== -1) {
      mockNotices.splice(index, 1)
      return mockRequest({ message: '通知已删除' })
    }
    return mockRequest(null)
  }
  
  return request.delete(`/api/notices/${id}`)
}
