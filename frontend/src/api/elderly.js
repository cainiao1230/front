import request from './request'

// 老人列表（带分页和筛选）
export const getElderlyList = (params = {}) => {
  return request.get('/api/elderly', { params })
}

// 获取老人详情
export const getElderlyDetail = (id) => {
  return request.get(`/api/elderly/${id}`)
}

// 新增老人申请
export const createElderly = (data) => {
  return request.post('/api/elderly', data)
}

// 更新老人信息
export const updateElderly = (id, data) => {
  return request.put(`/api/elderly/${id}`, data)
}

// 删除老人
export const deleteElderly = (id) => {
  return request.delete(`/api/elderly/${id}`)
}

// 搜索老人
export const searchElderly = (keyword) => {
  return request.get('/api/elderly/search', { params: { keyword } })
}

// 审批住房申请 - 通过（状态变为 in）
export const approveHousingApplication = (id, admissionDate) => {
  const data = admissionDate ? { admission_date: admissionDate } : {}
  return request.patch(`/api/elderly/${id}/approve`, data)
}

// 审批住房申请 - 拒绝
export const rejectHousingApplication = (id, reason) => {
  return request.patch(`/api/elderly/${id}/reject`, { reason })
}
