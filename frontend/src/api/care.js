import request from './request'

// 护理记录列表
export const getCareRecords = (params = {}) => {
  return request.get('/api/care/records', { params })
}

// 添加护理记录
export const createCareRecord = (data) => {
  return request.post('/api/care/records', data)
}

// 获取护理记录详情
export const getCareRecordDetail = (id) => {
  return request.get(`/api/care/records/${id}`)
}

// 更新护理记录
export const updateCareRecord = (id, data) => {
  return request.put(`/api/care/records/${id}`, data)
}

// 删除护理记录
export const deleteCareRecord = (id) => {
  return request.delete(`/api/care/records/${id}`)
}

// 护理任务列表
export const getCareTasks = (params = {}) => {
  return request.get('/api/care/tasks', { params })
}

// 创建护理任务
export const createCareTask = (data) => {
  return request.post('/api/care/tasks', data)
}

// 获取护理任务详情
export const getCareTaskDetail = (id) => {
  return request.get(`/api/care/tasks/${id}`)
}

// 更新护理任务
export const updateCareTask = (id, data) => {
  return request.put(`/api/care/tasks/${id}`, data)
}

// 更新任务状态
export const updateTaskStatus = (id, status) => {
  return request.patch(`/api/care/tasks/${id}/status`, { status })
}

// 删除护理任务
export const deleteCareTask = (id) => {
  return request.delete(`/api/care/tasks/${id}`)
}

// 获取今日任务
export const getTodayTasks = () => {
  return request.get('/api/care/tasks/today')
}

// 用药记录列表
export const getMedicationRecords = (params = {}) => {
  return request.get('/api/care/medications', { params })
}

// 添加用药记录
export const createMedicationRecord = (data) => {
  return request.post('/api/care/medications', data)
}

// 获取用药记录详情
export const getMedicationRecordDetail = (id) => {
  return request.get(`/api/care/medications/${id}`)
}

// 更新用药记录
export const updateMedicationRecord = (id, data) => {
  return request.put(`/api/care/medications/${id}`, data)
}

// 删除用药记录
export const deleteMedicationRecord = (id) => {
  return request.delete(`/api/care/medications/${id}`)
}

// 标记用药已服用
export const markMedicationTaken = (id) => {
  return request.patch(`/api/care/medications/${id}/taken`)
}
