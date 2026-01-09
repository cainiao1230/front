import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 登录/刷新/登出接口不携带 Authorization
    const url = config.url || ''
    const skipAuthPaths = ['/api/auth/login', '/api/auth/refresh', '/api/auth/logout']
    const shouldSkipAuth = skipAuthPaths.some(p => url.includes(p))

    if (!shouldSkipAuth) {
      // 从 localStorage 获取 token（忽略 mock token）
      const token = localStorage.getItem('access_token')
      if (token && !String(token).startsWith('mock-jwt-token')) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  error => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    const res = response.data
    // 后端统一返回 { code, message, data }，成功码可能为 0 或 200
    if (res && Object.prototype.hasOwnProperty.call(res, 'code')) {
      if (res.code === 0 || res.code === 200) {
        return res.data ?? res
      }
      console.warn('[API][biz-error]', response.config?.method, response.config?.url, {
        params: response.config?.params,
        data: response.config?.data,
        code: res.code,
        message: res.message
      })
      ElMessage.error(res.message || '请求失败')
      return Promise.reject({ response: { data: res, status: response.status } })
    }
    return res
  },
  error => {
    const businessCodeMessages = {
      '40901': '床位已被占用，请刷新后重试',
      '40902': '床位处于锁定或维护状态，无法分配',
      '40903': '老人已有床位未释放，无法重复分配',
      '42201': '请求参数缺失或校验失败，请检查必填项',
      '42202': '用药开始/结束日期不合法，请检查填写',
      '42203': '请求参数格式不符合要求，请检查后重试',
      '40310': '您无权限访问该记录',
      '40010': '请求参数缺失或格式错误'
    }

    // 处理错误响应
    if (error.response) {
      const { status, data } = error.response
      const code = data?.code?.toString()
      console.error('[API][http-error]', error.config?.method, error.config?.url, {
        params: error.config?.params,
        data: error.config?.data,
        status,
        code,
        message: data?.message || data?.detail
      })

      if (code && businessCodeMessages[code]) {
        ElMessage.error(businessCodeMessages[code])
        return Promise.reject(error)
      }
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          localStorage.removeItem('access_token')
          localStorage.removeItem('userInfo')
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 409:
          ElMessage.error(data?.detail || data?.message || '资源状态冲突')
          break
        case 422:
          ElMessage.error(data?.detail || data?.message || '请求参数校验失败')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error(data?.detail || data?.message || '请求失败')
      }
    } else if (error.request) {
      ElMessage.error('网络错误，请检查您的网络连接')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

export default request
