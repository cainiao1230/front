import request from './request'

// ========== 仪表盘模块 ==========

// 获取仪表盘统计数据
export const getDashboardStats = () => {
  return request.get('/api/dashboard/stats')
}
