import request from './request'

// 床位列表（带分页和筛选）
export const getBedList = (params = {}) => {
  return request.get('/api/beds', { params })
}

// 获取床位详情
export const getBedDetail = (id) => {
  return request.get(`/api/beds/${id}`)
}

// 新增床位
export const createBed = (data) => {
  return request.post('/api/beds', data)
}

// 更新床位信息
export const updateBed = (id, data) => {
  return request.put(`/api/beds/${id}`, data)
}

// 更新床位状态
export const updateBedStatus = (id, status) => {
  return request.patch(`/api/beds/${id}/status`, { status })
}

// 删除床位
export const deleteBed = (id) => {
  return request.delete(`/api/beds/${id}`)
}

// 分配床位（指定床位分配给老人）
export const assignBed = (bedId, elderlyId) => {
  return request.post(`/api/beds/${bedId}/assign`, { elderlyId })
}

// 分配床位（通用接口）
export const allocateBed = (data) => {
  return request.post('/api/beds/allocate', data)
}

// 释放床位（通过设置状态为free，可传原因）
export const releaseBed = (bedId, reason) => {
  const data = { status: 'free' }
  if (reason) data.reason = reason
  return request.patch(`/api/beds/${bedId}/status`, data)
}

// 床位使用历史
export const getBedHistory = (params = {}) => {
  return request.get('/api/beds/history', { params })
}

// 获取床位历史详情
export const getBedHistoryDetail = (id) => {
  return request.get(`/api/beds/history/${id}`)
}

// 按楼层统计床位（后端新增接口）
export const getBedStatsByFloor = () => {
  return request.get('/api/beds/floor-stats')
}

// 获取指定楼层的所有床位（按房间分组）
// 楼层格式: 1F, 2F, 3F...
export const getFloorBeds = (floor) => {
  return request.get(`/api/beds/floor/${floor}/grouped`)
}