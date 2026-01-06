// 表单验证规则
import { REGEX } from './constants'

/**
 * 必填验证
 */
export const required = (message) => ({
  required: true,
  message: message || '此项为必填项',
  trigger: 'blur'
})

/**
 * 手机号验证
 */
export const phoneValidator = {
  pattern: REGEX.PHONE,
  message: '请输入正确的手机号',
  trigger: 'blur'
}

/**
 * 身份证号验证
 */
export const idCardValidator = {
  pattern: REGEX.ID_CARD,
  message: '请输入正确的身份证号',
  trigger: 'blur'
}

/**
 * 邮箱验证
 */
export const emailValidator = {
  pattern: REGEX.EMAIL,
  message: '请输入正确的邮箱地址',
  trigger: 'blur'
}

/**
 * 长度验证
 */
export const lengthValidator = (min, max, message) => ({
  min,
  max,
  message: message || `长度在 ${min} 到 ${max} 个字符`,
  trigger: 'blur'
})

/**
 * 数字范围验证
 */
export const rangeValidator = (min, max, message) => ({
  type: 'number',
  min,
  max,
  message: message || `请输入 ${min} 到 ${max} 之间的数字`,
  trigger: 'blur'
})

/**
 * 自定义验证函数
 */
export const customValidator = (validator, message) => ({
  validator: (rule, value, callback) => {
    if (validator(value)) {
      callback()
    } else {
      callback(new Error(message))
    }
  },
  trigger: 'blur'
})

// 常用表单验证规则组合
export const commonRules = {
  name: [
    required('请输入姓名'),
    lengthValidator(2, 20)
  ],
  phone: [
    required('请输入手机号'),
    phoneValidator
  ],
  idCard: [
    required('请输入身份证号'),
    idCardValidator
  ],
  email: [
    required('请输入邮箱'),
    emailValidator
  ],
  password: [
    required('请输入密码'),
    lengthValidator(6, 20)
  ]
}
