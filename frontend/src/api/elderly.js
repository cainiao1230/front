import request from './request'
import { USE_MOCK, mockRequest, mockPagination, mockFilter } from './config'
import { mockElderlyList, mockElderlyDetail } from './mock/elderly'

// 老人列表（带分页和筛选）
export const getElderlyList = (params = {}) => {
  if (USE_MOCK) {
    const { page = 1, page_size = 10, name, care_level, status } = params
    
    // 筛选
    let filteredList = [...mockElderlyList]
    if (name) {
      filteredList = filteredList.filter(item => item.name.includes(name))
    }
    if (care_level) {
      filteredList = filteredList.filter(item => item.care_level === care_level)
    }
    if (status) {
      filteredList = filteredList.filter(item => item.status === status)
    }
    
    // 分页
    const paginationData = mockPagination(filteredList, page, page_size)
    return mockRequest(paginationData)
  }
  
  return request.get('/api/elderly', { params })
}

// 获取老人详情
export const getElderlyDetail = (id) => {
  if (USE_MOCK) {
    const elderly = mockElderlyList.find(item => item.id === id) || mockElderlyDetail
    return mockRequest(elderly)
  }
  
  return request.get(`/api/elderly/${id}`)
}

// 新增老人
export const createElderly = (data) => {
  if (USE_MOCK) {
    const newElderly = {
      id: mockElderlyList.length + 1,
      ...data,
      status: 'pending',
      applied_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    mockElderlyList.push(newElderly)
    return mockRequest(newElderly)
  }
  
  return request.post('/api/elderly', data)
}

// 更新老人信息
export const updateElderly = (id, data) => {
  if (USE_MOCK) {
    const index = mockElderlyList.findIndex(item => item.id === id)
    if (index !== -1) {
      mockElderlyList[index] = {
        ...mockElderlyList[index],
        ...data,
        updated_at: new Date().toISOString()
      }
      return mockRequest(mockElderlyList[index])
    }
    return mockRequest(null)
  }
  
  return request.put(`/api/elderly/${id}`, data)
}

// 删除老人（退房）
export const deleteElderly = (id) => {
  if (USE_MOCK) {
    const index = mockElderlyList.findIndex(item => item.id === id)
    if (index !== -1) {
      mockElderlyList[index].status = 'out'
      mockElderlyList[index].updated_at = new Date().toISOString()
      return mockRequest({ message: '老人已退房' })
    }
    return mockRequest(null)
  }
  
  return request.delete(`/api/elderly/${id}`)
}

// 搜索老人
export const searchElderly = (keyword) => {
  if (USE_MOCK) {
    const results = mockElderlyList.filter(item => 
      item.name.includes(keyword) || 
      item.phone.includes(keyword) ||
      item.id_number.includes(keyword)
    )
    return mockRequest(results)
  }
  
  return request.get('/api/elderly/search', { params: { keyword } })
}

// 审批住房申请 - 通过
export const approveHousingApplication = (id, data = {}) => {
  if (USE_MOCK) {
    const index = mockElderlyList.findIndex(item => item.id === id)
    if (index !== -1) {
      mockElderlyList[index] = {
        ...mockElderlyList[index],
        ...data,
        status: 'in',
        admission_date: data.admission_date || mockElderlyList[index].admission_date || new Date().toISOString().split('T')[0],
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return mockRequest(mockElderlyList[index])
    }
    return mockRequest(null)
  }
  
  return request.patch(`/api/elderly/${id}/approve`, data)
}

// 审批住房申请 - 驳回
export const rejectHousingApplication = (id, reason) => {
  const payload = { reason }
  if (USE_MOCK) {
    const index = mockElderlyList.findIndex(item => item.id === id)
    if (index !== -1) {
      mockElderlyList[index] = {
        ...mockElderlyList[index],
        status: 'out',
        rejection_reason: reason,
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      return mockRequest(mockElderlyList[index])
    }
    return mockRequest(null)
  }
  
  return request.patch(`/api/elderly/${id}/reject`, payload)
}
