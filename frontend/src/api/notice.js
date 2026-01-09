import request from './request'

// 通知列表
export const getNotices = (params = {}) => {
  return request.get('/api/notices', { params })
}

// 获取通知详情
export const getNoticeDetail = (id) => {
  return request.get(`/api/notices/${id}`)
}

// 发布通知
export const createNotice = (data) => {
  return request.post('/api/notices', data)
}

// 更新通知
export const updateNotice = (id, data) => {
  return request.put(`/api/notices/${id}`, data)
}

// 删除通知
export const deleteNotice = (id) => {
  return request.delete(`/api/notices/${id}`)
}
