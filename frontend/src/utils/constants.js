// 通用常量配置

// 护理等级
export const CARE_LEVELS = {
  SELF_CARE: 'self_care',
  SEMI_CARE: 'semi_care',
  FULL_CARE: 'full_care'
}

export const CARE_LEVEL_OPTIONS = [
  { label: '自理', value: CARE_LEVELS.SELF_CARE, type: 'success', desc: '生活完全自理' },
  { label: '半护理', value: CARE_LEVELS.SEMI_CARE, type: 'warning', desc: '需部分协助' },
  { label: '全护理', value: CARE_LEVELS.FULL_CARE, type: 'danger', desc: '需全面照料' }
]

// 床位状态
export const BED_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance'
}

export const BED_STATUS_OPTIONS = [
  { label: '空闲', value: BED_STATUS.AVAILABLE, type: 'success' },
  { label: '已占用', value: BED_STATUS.OCCUPIED, type: 'warning' },
  { label: '维护中', value: BED_STATUS.MAINTENANCE, type: 'info' }
]

// 床位类型
export const BED_TYPES = {
  SINGLE: 'single',
  DOUBLE: 'double',
  VIP: 'vip'
}

export const BED_TYPE_OPTIONS = [
  { label: '单人间', value: BED_TYPES.SINGLE, type: '' },
  { label: '双人间', value: BED_TYPES.DOUBLE, type: 'success' },
  { label: 'VIP', value: BED_TYPES.VIP, type: 'warning' }
]

// 护理类型
export const CARE_TYPES = {
  DAILY: 'daily',
  MEDICAL: 'medical',
  REHABILITATION: 'rehabilitation',
  PSYCHOLOGICAL: 'psychological'
}

export const CARE_TYPE_OPTIONS = [
  { label: '日常护理', value: CARE_TYPES.DAILY, type: '' },
  { label: '医疗护理', value: CARE_TYPES.MEDICAL, type: 'danger' },
  { label: '康复训练', value: CARE_TYPES.REHABILITATION, type: 'warning' },
  { label: '心理疏导', value: CARE_TYPES.PSYCHOLOGICAL, type: 'success' }
]

// 任务状态
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
}

export const TASK_STATUS_OPTIONS = [
  { label: '待处理', value: TASK_STATUS.PENDING, type: '' },
  { label: '进行中', value: TASK_STATUS.IN_PROGRESS, type: 'primary' },
  { label: '已完成', value: TASK_STATUS.COMPLETED, type: 'success' },
  { label: '已取消', value: TASK_STATUS.CANCELLED, type: 'info' }
]

// 性别
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female'
}

export const GENDER_OPTIONS = [
  { label: '男', value: GENDER.MALE },
  { label: '女', value: GENDER.FEMALE }
]

// 老人状态
export const ELDERLY_STATUS = {
  IN: 'in',
  OUT: 'out',
  PENDING: 'pending'
}

export const ELDERLY_STATUS_OPTIONS = [
  { label: '在住', value: ELDERLY_STATUS.IN, type: 'success' },
  { label: '已退', value: ELDERLY_STATUS.OUT, type: 'info' },
  { label: '待审核', value: ELDERLY_STATUS.PENDING, type: 'warning' }
]

// 用户角色
export const USER_ROLES = {
  ADMIN: 'admin',
  CAREGIVER: 'caregiver',
  FAMILY: 'family'
}

export const USER_ROLE_OPTIONS = [
  { label: '管理员', value: USER_ROLES.ADMIN, type: 'danger' },
  { label: '护工', value: USER_ROLES.CAREGIVER, type: 'primary' },
  { label: '家属', value: USER_ROLES.FAMILY, type: 'success' }
]

// 楼层配置
export const FLOORS = [1, 2, 3, 4]

// 分页配置
export const PAGE_SIZES = [10, 20, 50, 100]
export const DEFAULT_PAGE_SIZE = 10

// 正则表达式
export const REGEX = {
  PHONE: /^1[3-9]\d{9}$/,
  ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/,
  EMAIL: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
}
