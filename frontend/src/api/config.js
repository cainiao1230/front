// 配置是否使用 Mock 数据
// 开发阶段设置为 true，后端接口就绪后设置为 false
export const USE_MOCK = true

// Mock 数据延迟时间（毫秒）- 模拟真实网络请求延迟
export const MOCK_DELAY = 300

// 模拟 API 请求的帮助函数
export const mockRequest = (data, delay = MOCK_DELAY) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: 'success',
        data
      })
    }, delay)
  })
}

// 模拟分页数据
export const mockPagination = (list, page = 1, pageSize = 10) => {
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const items = list.slice(start, end)
  
  return {
    items,
    total: list.length,
    page,
    page_size: pageSize,
    pages: Math.ceil(list.length / pageSize)
  }
}

// 模拟筛选数据
export const mockFilter = (list, filters) => {
  return list.filter(item => {
    return Object.keys(filters).every(key => {
      if (!filters[key]) return true
      if (typeof item[key] === 'string') {
        return item[key].includes(filters[key])
      }
      return item[key] === filters[key]
    })
  })
}
