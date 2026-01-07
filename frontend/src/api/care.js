import request from './request'
import { USE_MOCK, mockRequest, mockPagination } from './config'
import { mockCareRecords, mockCareTasks, mockMedicationRecords } from './mock/care'

// 护理记录列表
export const getCareRecords = (params = {}) => {
  if (USE_MOCK) {
    const { page = 1, page_size = 10, elderly_id, care_type, start_date, end_date } = params
    
    let filteredList = [...mockCareRecords]
    if (elderly_id) {
      filteredList = filteredList.filter(item => item.elderly_id === Number(elderly_id))
    }
    if (care_type) {
      filteredList = filteredList.filter(item => item.care_type === care_type)
    }
    
    const paginationData = mockPagination(filteredList, page, page_size)
    return mockRequest(paginationData)
  }
  
  return request.get('/api/care/records', { params })
}

// 添加护理记录
export const createCareRecord = (data) => {
  if (USE_MOCK) {
    const newRecord = {
      id: mockCareRecords.length + 1,
      ...data,
      created_at: new Date().toISOString()
    }
    mockCareRecords.push(newRecord)
    return mockRequest(newRecord)
  }
  
  return request.post('/api/care/records', data)
}

// 护理任务列表
export const getCareTasks = (params = {}) => {
  if (USE_MOCK) {
    const { page = 1, page_size = 10, elderly_id, status, assigned_to } = params
    
    let filteredList = [...mockCareTasks]
    if (elderly_id) {
      filteredList = filteredList.filter(item => item.elderly_id === Number(elderly_id))
    }
    if (status) {
      filteredList = filteredList.filter(item => item.status === status)
    }
    if (assigned_to) {
      filteredList = filteredList.filter(item => item.assigned_to === Number(assigned_to))
    }
    
    const paginationData = mockPagination(filteredList, page, page_size)
    return mockRequest(paginationData)
  }
  
  return request.get('/api/care/tasks', { params })
}

// 创建护理任务
export const createCareTask = (data) => {
  if (USE_MOCK) {
    const newTask = {
      id: mockCareTasks.length + 1,
      ...data,
      status: 'pending',
      created_at: new Date().toISOString()
    }
    mockCareTasks.push(newTask)
    return mockRequest(newTask)
  }
  
  return request.post('/api/care/tasks', data)
}

// 更新任务状态
export const updateTaskStatus = (id, status) => {
  if (USE_MOCK) {
    const index = mockCareTasks.findIndex(item => item.id === id)
    if (index !== -1) {
      mockCareTasks[index].status = status
      if (status === 'completed') {
        mockCareTasks[index].completed_at = new Date().toISOString()
      }
      return mockRequest(mockCareTasks[index])
    }
    return mockRequest(null)
  }
  
  return request.patch(`/api/care/tasks/${id}/status`, { status })
}

// 获取今日任务
export const getTodayTasks = () => {
  if (USE_MOCK) {
    const today = new Date().toISOString().split('T')[0]
    const todayTasks = mockCareTasks.filter(task => 
      task.scheduled_time.startsWith(today)
    )
    return mockRequest(todayTasks)
  }
  
  return request.get('/api/care/tasks/today')
}

// 用药记录列表
export const getMedicationRecords = (params = {}) => {
  if (USE_MOCK) {
    const { page = 1, page_size = 10, elderly_id, status } = params
    
    let filteredList = [...mockMedicationRecords]
    if (elderly_id) {
      filteredList = filteredList.filter(item => item.elderly_id === Number(elderly_id))
    }
    if (status) {
      filteredList = filteredList.filter(item => item.status === status)
    }
    
    const paginationData = mockPagination(filteredList, page, page_size)
    return mockRequest(paginationData)
  }
  
  return request.get('/api/care/medications', { params })
}

// 添加用药记录
export const createMedicationRecord = (data) => {
  if (USE_MOCK) {
    const newRecord = {
      id: mockMedicationRecords.length + 1,
      ...data,
      status: 'active',
      created_at: new Date().toISOString()
    }
    mockMedicationRecords.push(newRecord)
    return mockRequest(newRecord)
  }
  
  return request.post('/api/care/medications', data)
}

// 更新用药记录
export const updateMedicationRecord = (id, data) => {
  if (USE_MOCK) {
    const index = mockMedicationRecords.findIndex(item => item.id === id)
    if (index !== -1) {
      mockMedicationRecords[index] = {
        ...mockMedicationRecords[index],
        ...data,
        updated_at: new Date().toISOString()
      }
      return mockRequest(mockMedicationRecords[index])
    }
    return mockRequest(null)
  }
  
  return request.put(`/api/care/medications/${id}`, data)
}

// 标记用药已服用
export const markMedicationTaken = (id) => {
  if (USE_MOCK) {
    const index = mockMedicationRecords.findIndex(item => item.id === id)
    if (index !== -1) {
      mockMedicationRecords[index].status = 'taken'
      mockMedicationRecords[index].taken_at = new Date().toISOString()
      return mockRequest(mockMedicationRecords[index])
    }
    return mockRequest(null)
  }
  
  return request.patch(`/api/care/medications/${id}/taken`)
}
