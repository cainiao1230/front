import request from './request'

// 护理记录列表
export const getCareRecords = (params = {}) => {
  return request.get('/api/care/records', { params })
}

// 添加护理记录
export const createCareRecord = (data) => {
  return request.post('/api/care/records', data)
}

// 护理任务列表
export const getCareTasks = (params = {}) => {
  return request.get('/api/care/tasks', { params })
}

// 创建护理任务
export const createCareTask = (data) => {
  return request.post('/api/care/tasks', data)
}

// 更新任务状态
export const updateTaskStatus = (id, status) => {
  return request.patch(`/api/care/tasks/${id}/status`, { status })
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

// 更新用药记录
export const updateMedicationRecord = (id, data) => {
  return request.put(`/api/care/medications/${id}`, data)
}

// 标记用药已服用
export const markMedicationTaken = (id) => {
  return request.patch(`/api/care/medications/${id}/taken`)
}
