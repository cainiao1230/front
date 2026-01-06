// Mock 数据 - 系统管理
export const mockSystemUsers = [
  {
    id: 1,
    username: 'admin',
    name: '系统管理员',
    role: 'admin',
    phone: '13800000001',
    email: 'admin@example.com',
    status: 'active',
    last_login: '2026-01-06 09:30:00',
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 2,
    username: 'nurse01',
    name: '护工小王',
    role: 'caregiver',
    phone: '13800000002',
    email: 'nurse01@example.com',
    status: 'active',
    last_login: '2026-01-06 08:00:00',
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 3,
    username: 'nurse02',
    name: '护工小李',
    role: 'caregiver',
    phone: '13800000003',
    email: 'nurse02@example.com',
    status: 'active',
    last_login: '2026-01-06 08:00:00',
    created_at: '2024-01-01T10:00:00'
  }
]

export const mockSystemRoles = [
  {
    id: 1,
    name: '管理员',
    code: 'admin',
    description: '系统管理员，拥有所有权限',
    permissions: ['all'],
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 2,
    name: '护工',
    code: 'caregiver',
    description: '护理人员，负责日常护理工作',
    permissions: ['elderly:read', 'care:write', 'task:write'],
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 3,
    name: '家属',
    code: 'family',
    description: '老人家属，查看相关信息',
    permissions: ['elderly:read', 'care:read'],
    created_at: '2024-01-01T10:00:00'
  }
]

export const mockSystemLogs = [
  {
    id: 1,
    user_id: 1,
    username: 'admin',
    action: 'login',
    description: '用户登录系统',
    ip: '192.168.1.100',
    created_at: '2026-01-06T09:30:00'
  },
  {
    id: 2,
    user_id: 1,
    username: 'admin',
    action: 'create_elderly',
    description: '新增老人：张三',
    ip: '192.168.1.100',
    created_at: '2026-01-06T10:15:00'
  },
  {
    id: 3,
    user_id: 2,
    username: 'nurse01',
    action: 'add_care_record',
    description: '添加护理记录：老人张三',
    ip: '192.168.1.101',
    created_at: '2026-01-06T08:15:00'
  }
]
