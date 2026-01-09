import request from './request'

// 消息列表
export const getMessages = (params = {}) => {
  return request.get('/api/messages', { params })
}

// 获取消息详情
export const getMessageDetail = (id) => {
  return request.get(`/api/messages/${id}`)
}

// 标记消息已读
export const markMessageAsRead = (id) => {
  return request.patch(`/api/messages/${id}/read`)
}

// 批量标记已读
export const markAllMessagesAsRead = () => {
  return request.post('/api/messages/read-all')
}

// 删除消息
export const deleteMessage = (id) => {
  return request.delete(`/api/messages/${id}`)
}

// 获取未读消息数量
export const getUnreadCount = () => {
  return request.get('/api/messages/unread-count')
}
