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

// 删除床位
export const deleteBed = (id) => {
  return request.delete(`/api/beds/${id}`)
}

// 分配床位
export const allocateBed = (data) => {
  return request.post('/api/beds/allocate', data)
}

// 释放床位
export const releaseBed = (bedId) => {
  return request.post(`/api/beds/${bedId}/release`)
}

// 床位使用历史
export const getBedHistory = (params = {}) => {
  return request.get('/api/beds/history', { params })
}

// 按楼层统计床位
export const getBedStatsByFloor = () => {
  return request.get('/api/beds/stats/floor')
}
// 获取指定楼层的所有床位（按房间分组）
export const getFloorBeds = (floor) => {
  return request.get(`/api/beds/floor/${floor}`)
}