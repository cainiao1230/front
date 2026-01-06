import request from './request'
import { USE_MOCK, mockRequest, mockPagination } from './config'
import { mockMessages } from './mock/message'

// 消息列表
export const getMessages = (params = {}) => {
  if (USE_MOCK) {
    const { page = 1, page_size = 10, type, status } = params
    
    let filteredList = [...mockMessages]
    if (type) {
      filteredList = filteredList.filter(item => item.type === type)
    }
    if (status) {
      filteredList = filteredList.filter(item => item.status === status)
    }
    
    const paginationData = mockPagination(filteredList, page, page_size)
    return mockRequest(paginationData)
  }
  
  return request.get('/api/messages', { params })
}

// 获取消息详情
export const getMessageDetail = (id) => {
  if (USE_MOCK) {
    const message = mockMessages.find(item => item.id === id)
    return mockRequest(message)
  }
  
  return request.get(`/api/messages/${id}`)
}

// 标记消息已读
export const markMessageAsRead = (id) => {
  if (USE_MOCK) {
    const index = mockMessages.findIndex(item => item.id === id)
    if (index !== -1) {
      mockMessages[index].status = 'read'
      return mockRequest(mockMessages[index])
    }
    return mockRequest(null)
  }
  
  return request.patch(`/api/messages/${id}/read`)
}

// 批量标记已读
export const markAllMessagesAsRead = () => {
  if (USE_MOCK) {
    mockMessages.forEach(msg => {
      msg.status = 'read'
    })
    return mockRequest({ message: '已全部标记为已读' })
  }
  
  return request.post('/api/messages/read-all')
}

// 删除消息
export const deleteMessage = (id) => {
  if (USE_MOCK) {
    const index = mockMessages.findIndex(item => item.id === id)
    if (index !== -1) {
      mockMessages.splice(index, 1)
      return mockRequest({ message: '消息已删除' })
    }
    return mockRequest(null)
  }
  
  return request.delete(`/api/messages/${id}`)
}

// 获取未读消息数量
export const getUnreadCount = () => {
  if (USE_MOCK) {
    const count = mockMessages.filter(item => item.status === 'unread').length
    return mockRequest({ count })
  }
  
  return request.get('/api/messages/unread-count')
}
