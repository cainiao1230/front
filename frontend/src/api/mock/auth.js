// Mock 数据 - 认证授权
export const mockUsers = [
  {
    id: 1,
    username: 'admin',
    password: 'admin123', // 实际开发中不应该明文存储
    name: '管理员',
    role: 'admin',
    phone: '13800000001',
    email: 'admin@example.com',
    status: 'active',
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 2,
    username: 'nurse01',
    password: 'nurse123',
    name: '护工小王',
    role: 'caregiver',
    phone: '13800000002',
    email: 'nurse01@example.com',
    status: 'active',
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 3,
    username: 'family01',
    password: 'family123',
    name: '张小明',
    role: 'family',
    phone: '13900139001',
    email: 'family01@example.com',
    status: 'active',
    created_at: '2024-01-01T10:00:00'
  }
]

export const mockLoginResponse = {
  access_token: 'mock-jwt-token-' + Date.now(),
  token_type: 'bearer',
  user: {
    id: 1,
    username: 'admin',
    name: '管理员',
    role: 'admin',
    phone: '13800000001',
    email: 'admin@example.com'
  }
}
