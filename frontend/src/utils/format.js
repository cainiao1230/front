// 格式化工具函数

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式 (date: YYYY-MM-DD, datetime: YYYY-MM-DD HH:mm:ss)
 */
export function formatDate(date, format = 'date') {
  if (!date) return ''
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  if (format === 'date') {
    return `${year}-${month}-${day}`
  }
  
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 计算年龄
 * @param {string} birthday - 出生日期 YYYY-MM-DD
 * @returns {number} 年龄
 */
export function calculateAge(birthday) {
  if (!birthday) return 0
  
  const birth = new Date(birthday)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age > 0 ? age : 0
}

/**
 * 格式化金额
 * @param {number} amount - 金额
 * @param {number} decimals - 小数位数
 */
export function formatMoney(amount, decimals = 2) {
  if (amount === null || amount === undefined) return '0.00'
  return Number(amount).toFixed(decimals)
}

/**
 * 格式化电话号码（隐藏中间4位）
 * @param {string} phone - 电话号码
 */
export function formatPhone(phone, hide = false) {
  if (!phone) return ''
  if (!hide) return phone
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}

/**
 * 格式化身份证号（隐藏中间部分）
 * @param {string} idCard - 身份证号
 */
export function formatIdCard(idCard, hide = false) {
  if (!idCard) return ''
  if (!hide) return idCard
  return idCard.replace(/(\d{6})\d{8}(\d{4})/, '$1********$2')
}

/**
 * 相对时间格式化
 * @param {string|Date} date - 日期
 */
export function formatRelativeTime(date) {
  if (!date) return ''
  
  const d = new Date(date)
  const now = new Date()
  const diff = now - d
  
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  
  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < 7 * day) {
    return `${Math.floor(diff / day)}天前`
  } else {
    return formatDate(date)
  }
}

/**
 * 文件大小格式化
 * @param {number} bytes - 字节数
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * 百分比格式化
 * @param {number} value - 数值
 * @param {number} total - 总数
 * @param {number} decimals - 小数位数
 */
export function formatPercentage(value, total, decimals = 1) {
  if (!total || total === 0) return '0%'
  return ((value / total) * 100).toFixed(decimals) + '%'
}
