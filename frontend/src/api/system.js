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

// 更新用户
export const updateSystemUser = (id, data) => {
  return request.put(`/api/system/users/${id}`, data)
}

// 删除用户
export const deleteSystemUser = (id) => {
  return request.delete(`/api/system/users/${id}`)
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

// 保存角色权限
export const updateRolePermissions = (roleId, permissionIds) => {
  return request.put(`/api/roles/${roleId}/permissions`, { permissions: permissionIds })
}

// 获取单个角色详情（含权限）
export const getSystemRoleDetail = (id) => {
  return request.get(`/api/roles/${id}`)
}

// 获取权限列表（树形结构）
export const getSystemPermissions = () => {
  return request.get('/api/system/permissions')
}

// 批量更新用户状态
export const batchUpdateUserStatus = (userIds, status) => {
  return request.post('/api/system/users/batch-status', { user_ids: userIds, status })
}

// 批量更新用户角色
export const batchUpdateUserRole = (userIds, role) => {
  return request.post('/api/system/users/batch-role', { user_ids: userIds, role })
}

// ========== 系统日志 ==========

// 获取系统日志
export const getSystemLogs = (params = {}) => {
  return request.get('/api/system/logs', { params })
}
