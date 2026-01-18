import request from './request'

// ========== 用户管理 ==========

// 获取用户列表
export const getSystemUsers = (params = {}) => {
  return request.get('/api/system/users', { params })
}

// 创建用户
export const createSystemUser = (data) => {
  return request.post('/api/system/users', data)
}

// 更新用户信息
export const updateSystemUser = (id, data) => {
  return request.put(`/api/system/users/${id}`, data)
}

// 更新用户角色
export const updateUserRole = (id, role) => {
  return request.patch(`/api/system/users/${id}/role`, { role })
}

// 更新用户状态
export const updateUserStatus = (id, status) => {
  return request.patch(`/api/system/users/${id}/status`, { status })
}

// 重置用户密码
export const resetUserPassword = (id, password = null) => {
  const data = password ? { password } : {}
  return request.post(`/api/system/users/${id}/reset-password`, data)
}

// 修改当前用户密码
export const changePassword = (oldPassword, newPassword) => {
  return request.post('/api/system/change-password', { oldPassword, newPassword })
}

// 删除用户
export const deleteSystemUser = (id) => {
  return request.delete(`/api/system/users/${id}`)
}

// 批量更新用户状态（循环调用单个接口）
export const batchUpdateUserStatus = async (userIds, status) => {
  const results = await Promise.allSettled(
    userIds.map(id => updateUserStatus(id, status))
  )
  const failed = results.filter(r => r.status === 'rejected')
  if (failed.length > 0) {
    throw new Error(`${failed.length} 个用户状态更新失败`)
  }
  return results
}

// 批量更新用户角色（循环调用单个接口）
export const batchUpdateUserRole = async (userIds, role) => {
  const results = await Promise.allSettled(
    userIds.map(id => updateUserRole(id, role))
  )
  const failed = results.filter(r => r.status === 'rejected')
  if (failed.length > 0) {
    throw new Error(`${failed.length} 个用户角色更新失败`)
  }
  return results
}

// ========== 角色管理 ==========

// 获取角色列表
export const getSystemRoles = () => {
  return request.get('/api/roles')
}

// 创建角色
export const createSystemRole = (data) => {
  return request.post('/api/roles', data)
}

// 更新角色
export const updateSystemRole = (id, data) => {
  return request.put(`/api/roles/${id}`, data)
}

// 删除角色
export const deleteSystemRole = (id) => {
  return request.delete(`/api/roles/${id}`)
}

// 获取单个角色详情（含权限）
export const getSystemRoleDetail = (id) => {
  return request.get(`/api/roles/${id}`)
}

// 保存角色权限
export const updateRolePermissions = (roleId, permissionIds) => {
  return request.put(`/api/roles/${roleId}/permissions`, { permissionIds })
}

// 获取所有权限列表（树形结构）
export const getSystemPermissions = () => {
  return request.get('/api/permissions')
}

// ========== 系统日志 ==========

// 获取系统日志
export const getSystemLogs = (params = {}) => {
  return request.get('/api/logs', { params })
}

// 获取指定用户的日志
export const getUserLogs = (userId) => {
  return request.get(`/api/system/logs/user/${userId}`)
}
