import request from './request'
import { USE_MOCK, mockRequest, mockPagination } from './config'
import { mockSystemUsers, mockSystemRoles, mockSystemLogs } from './mock/system'

// ========== 用户管理 ==========

// 获取用户列表
export const getSystemUsers = (params = {}) => {
  if (USE_MOCK) {
    const { page = 1, page_size = 10, role, status } = params
    
    let filteredList = [...mockSystemUsers]
    if (role) {
      filteredList = filteredList.filter(item => item.role === role)
    }
    if (status) {
      filteredList = filteredList.filter(item => item.status === status)
    }
    
    const paginationData = mockPagination(filteredList, page, page_size)
    return mockRequest(paginationData)
  }
  
  return request.get('/api/system/users', { params })
}

// 创建用户
export const createSystemUser = (data) => {
  if (USE_MOCK) {
    const newUser = {
      id: mockSystemUsers.length + 1,
      ...data,
      status: 'active',
      created_at: new Date().toISOString()
    }
    mockSystemUsers.push(newUser)
    return mockRequest(newUser)
  }
  
  return request.post('/api/system/users', data)
}

// 更新用户
export const updateSystemUser = (id, data) => {
  if (USE_MOCK) {
    const index = mockSystemUsers.findIndex(item => item.id === id)
    if (index !== -1) {
      mockSystemUsers[index] = {
        ...mockSystemUsers[index],
        ...data,
        updated_at: new Date().toISOString()
      }
      return mockRequest(mockSystemUsers[index])
    }
    return mockRequest(null)
  }
  
  return request.put(`/api/system/users/${id}`, data)
}

// 删除用户
export const deleteSystemUser = (id) => {
  if (USE_MOCK) {
    const index = mockSystemUsers.findIndex(item => item.id === id)
    if (index !== -1) {
      mockSystemUsers.splice(index, 1)
      return mockRequest({ message: '用户已删除' })
    }
    return mockRequest(null)
  }
  
  return request.delete(`/api/system/users/${id}`)
}

// ========== 角色管理 ==========

// 获取角色列表
export const getSystemRoles = () => {
  if (USE_MOCK) {
    return mockRequest(mockSystemRoles)
  }
  
  return request.get('/api/system/roles')
}

// 创建角色
export const createSystemRole = (data) => {
  if (USE_MOCK) {
    const newRole = {
      id: mockSystemRoles.length + 1,
      ...data,
      created_at: new Date().toISOString()
    }
    mockSystemRoles.push(newRole)
    return mockRequest(newRole)
  }
  
  return request.post('/api/system/roles', data)
}

// 更新角色
export const updateSystemRole = (id, data) => {
  if (USE_MOCK) {
    const index = mockSystemRoles.findIndex(item => item.id === id)
    if (index !== -1) {
      mockSystemRoles[index] = {
        ...mockSystemRoles[index],
        ...data,
        updated_at: new Date().toISOString()
      }
      return mockRequest(mockSystemRoles[index])
    }
    return mockRequest(null)
  }
  
  return request.put(`/api/system/roles/${id}`, data)
}

// 删除角色
export const deleteSystemRole = (id) => {
  if (USE_MOCK) {
    const index = mockSystemRoles.findIndex(item => item.id === id)
    if (index !== -1) {
      mockSystemRoles.splice(index, 1)
      return mockRequest({ message: '角色已删除' })
    }
    return mockRequest(null)
  }
  
  return request.delete(`/api/system/roles/${id}`)
}

// 保存角色权限
export const updateRolePermissions = (roleId, permissionIds) => {
  if (USE_MOCK) {
    const roleIndex = mockSystemRoles.findIndex(item => item.id === roleId)
    if (roleIndex !== -1) {
      mockSystemRoles[roleIndex].permissions = permissionIds
      return mockRequest({ message: '权限已保存' })
    }
    return mockRequest(null)
  }
  
  return request.post(`/api/system/roles/${roleId}/permissions`, { permission_ids: permissionIds })
}

// 批量更新用户状态
export const batchUpdateUserStatus = (userIds, status) => {
  if (USE_MOCK) {
    userIds.forEach(userId => {
      const index = mockSystemUsers.findIndex(item => item.id === userId)
      if (index !== -1) {
        mockSystemUsers[index].status = status
      }
    })
    return mockRequest({ message: '状态已更新' })
  }
  
  return request.post('/api/system/users/batch-status', { user_ids: userIds, status })
}

// 批量更新用户角色
export const batchUpdateUserRole = (userIds, role) => {
  if (USE_MOCK) {
    userIds.forEach(userId => {
      const index = mockSystemUsers.findIndex(item => item.id === userId)
      if (index !== -1) {
        mockSystemUsers[index].role = role
      }
    })
    return mockRequest({ message: '角色已更新' })
  }
  
  return request.post('/api/system/users/batch-role', { user_ids: userIds, role })
}

// ========== 系统日志 ==========

// 获取系统日志
export const getSystemLogs = (params = {}) => {
  if (USE_MOCK) {
    const { page = 1, page_size = 10, action, user_id } = params
    
    let filteredList = [...mockSystemLogs]
    if (action) {
      filteredList = filteredList.filter(item => item.action === action)
    }
    if (user_id) {
      filteredList = filteredList.filter(item => item.user_id === Number(user_id))
    }
    
    const paginationData = mockPagination(filteredList, page, page_size)
    return mockRequest(paginationData)
  }
  
  return request.get('/api/system/logs', { params })
}
