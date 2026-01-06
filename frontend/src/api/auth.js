import request from './request'
import { USE_MOCK, mockRequest } from './config'
import { mockLoginResponse, mockUsers } from './mock/auth'

// 用户登录
export const login = (data) => {
  if (USE_MOCK) {
    const { username, password } = data
    const user = mockUsers.find(u => u.username === username && u.password === password)
    
    if (user) {
      const response = {
        access_token: 'mock-jwt-token-' + Date.now(),
        token_type: 'bearer',
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
          phone: user.phone,
          email: user.email
        }
      }
      return mockRequest(response)
    }
    
    return Promise.reject({ response: { status: 401, data: { detail: '用户名或密码错误' } } })
  }
  
  return request.post('/api/auth/login', data)
}

// 用户登出
export const logout = () => {
  if (USE_MOCK) {
    return mockRequest({ message: '登出成功' })
  }
  
  return request.post('/api/auth/logout')
}

// 获取当前用户信息
export const getCurrentUser = () => {
  if (USE_MOCK) {
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    return mockRequest(userInfo)
  }
  
  return request.get('/api/auth/me')
}

// 修改密码
export const changePassword = (data) => {
  if (USE_MOCK) {
    return mockRequest({ message: '密码修改成功' })
  }
  
  return request.post('/api/auth/change-password', data)
}

// 刷新 token
export const refreshToken = () => {
  if (USE_MOCK) {
    const response = {
      access_token: 'mock-jwt-token-' + Date.now(),
      token_type: 'bearer'
    }
    return mockRequest(response)
  }
  
  return request.post('/api/auth/refresh')
}
