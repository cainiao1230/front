// 数据映射工具函数
import {
  CARE_LEVEL_OPTIONS,
  BED_STATUS_OPTIONS,
  BED_TYPE_OPTIONS,
  CARE_TYPE_OPTIONS,
  TASK_STATUS_OPTIONS,
  GENDER_OPTIONS,
  ELDERLY_STATUS_OPTIONS,
  USER_ROLE_OPTIONS
} from './constants'

/**
 * 通用映射函数
 * @param {string} value - 值
 * @param {Array} options - 选项数组
 * @param {string} field - 返回字段 (label, type)
 */
function mapValue(value, options, field = 'label') {
  const option = options.find(opt => opt.value === value)
  return option ? option[field] : value
}

// 护理等级映射
export const mapCareLevel = (value, field = 'label') => mapValue(value, CARE_LEVEL_OPTIONS, field)

// 床位状态映射
export const mapBedStatus = (value, field = 'label') => mapValue(value, BED_STATUS_OPTIONS, field)

// 床位类型映射
export const mapBedType = (value, field = 'label') => mapValue(value, BED_TYPE_OPTIONS, field)

// 护理类型映射
export const mapCareType = (value, field = 'label') => mapValue(value, CARE_TYPE_OPTIONS, field)

// 任务状态映射
export const mapTaskStatus = (value, field = 'label') => mapValue(value, TASK_STATUS_OPTIONS, field)

// 性别映射
export const mapGender = (value, field = 'label') => mapValue(value, GENDER_OPTIONS, field)

// 老人状态映射
export const mapElderlyStatus = (value, field = 'label') => mapValue(value, ELDERLY_STATUS_OPTIONS, field)

// 用户角色映射
export const mapUserRole = (value, field = 'label') => mapValue(value, USER_ROLE_OPTIONS, field)

// 导出所有映射函数的对象形式（方便批量使用）
export default {
  careLevel: mapCareLevel,
  bedStatus: mapBedStatus,
  bedType: mapBedType,
  careType: mapCareType,
  taskStatus: mapTaskStatus,
  gender: mapGender,
  elderlyStatus: mapElderlyStatus,
  userRole: mapUserRole
}
