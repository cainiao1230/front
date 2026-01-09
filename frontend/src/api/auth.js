import request from './request'

// 用户登录
export const login = (data) => {
  return request.post('/api/auth/login', data)
}

// 用户登出
export const logout = () => {
  return request.post('/api/auth/logout')
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return request.get('/api/auth/me')
}

// 修改密码
export const changePassword = (data) => {
  return request.post('/api/auth/change-password', data)
}

// 刷新 token
export const refreshToken = () => {
  return request.post('/api/auth/refresh')
}

