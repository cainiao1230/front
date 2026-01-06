import request from './request'
import { USE_MOCK, mockRequest, mockPagination } from './config'
import { mockBedList, mockBedHistory } from './mock/bed'

// 床位列表（带分页和筛选）
export const getBedList = (params = {}) => {
  if (USE_MOCK) {
    const { page = 1, page_size = 10, floor, status, bed_type } = params
    
    // 筛选
    let filteredList = [...mockBedList]
    if (floor) {
      filteredList = filteredList.filter(item => item.floor === Number(floor))
    }
    if (status) {
      filteredList = filteredList.filter(item => item.status === status)
    }
    if (bed_type) {
      filteredList = filteredList.filter(item => item.bed_type === bed_type)
    }
    
    // 分页
    const paginationData = mockPagination(filteredList, page, page_size)
    return mockRequest(paginationData)
  }
  
  return request.get('/api/beds', { params })
}

// 获取床位详情
export const getBedDetail = (id) => {
  if (USE_MOCK) {
    const bed = mockBedList.find(item => item.id === id)
    return mockRequest(bed)
  }
  
  return request.get(`/api/beds/${id}`)
}

// 新增床位
export const createBed = (data) => {
  if (USE_MOCK) {
    const newBed = {
      id: mockBedList.length + 101,
      ...data,
      status: 'available',
      elderly_id: null,
      elderly_name: null,
      created_at: new Date().toISOString()
    }
    mockBedList.push(newBed)
    return mockRequest(newBed)
  }
  
  return request.post('/api/beds', data)
}

// 更新床位信息
export const updateBed = (id, data) => {
  if (USE_MOCK) {
    const index = mockBedList.findIndex(item => item.id === id)
    if (index !== -1) {
      mockBedList[index] = {
        ...mockBedList[index],
        ...data,
        updated_at: new Date().toISOString()
      }
      return mockRequest(mockBedList[index])
    }
    return mockRequest(null)
  }
  
  return request.put(`/api/beds/${id}`, data)
}

// 删除床位
export const deleteBed = (id) => {
  if (USE_MOCK) {
    const index = mockBedList.findIndex(item => item.id === id)
    if (index !== -1) {
      mockBedList.splice(index, 1)
      return mockRequest({ message: '床位已删除' })
    }
    return mockRequest(null)
  }
  
  return request.delete(`/api/beds/${id}`)
}

// 分配床位
export const allocateBed = (data) => {
  if (USE_MOCK) {
    const { bed_id, elderly_id, elderly_name } = data
    const index = mockBedList.findIndex(item => item.id === bed_id)
    if (index !== -1) {
      mockBedList[index].status = 'occupied'
      mockBedList[index].elderly_id = elderly_id
      mockBedList[index].elderly_name = elderly_name
      return mockRequest(mockBedList[index])
    }
    return mockRequest(null)
  }
  
  return request.post('/api/beds/allocate', data)
}

// 释放床位
export const releaseBed = (bedId) => {
  if (USE_MOCK) {
    const index = mockBedList.findIndex(item => item.id === bedId)
    if (index !== -1) {
      mockBedList[index].status = 'available'
      mockBedList[index].elderly_id = null
      mockBedList[index].elderly_name = null
      return mockRequest(mockBedList[index])
    }
    return mockRequest(null)
  }
  
  return request.post(`/api/beds/${bedId}/release`)
}

// 床位使用历史
export const getBedHistory = (params = {}) => {
  if (USE_MOCK) {
    const { page = 1, page_size = 10, bed_id } = params
    
    let filteredList = [...mockBedHistory]
    if (bed_id) {
      filteredList = filteredList.filter(item => item.bed_id === Number(bed_id))
    }
    
    const paginationData = mockPagination(filteredList, page, page_size)
    return mockRequest(paginationData)
  }
  
  return request.get('/api/beds/history', { params })
}

// 按楼层统计床位
export const getBedStatsByFloor = () => {
  if (USE_MOCK) {
    const stats = {}
    mockBedList.forEach(bed => {
      if (!stats[bed.floor]) {
        stats[bed.floor] = {
          floor: bed.floor,
          total: 0,
          available: 0,
          occupied: 0,
          maintenance: 0
        }
      }
      stats[bed.floor].total++
      stats[bed.floor][bed.status]++
    })
    return mockRequest(Object.values(stats))
  }
  
  return request.get('/api/beds/stats/floor')
}
// 获取指定楼层的所有床位（按房间分组）
export const getFloorBeds = (floor) => {
  if (USE_MOCK) {
    // 筛选该楼层的床位
    const floorBeds = mockBedList.filter(bed => bed.floor === floor)
    
    // 按房间号分组
    const roomsMap = {}
    floorBeds.forEach(bed => {
      if (!roomsMap[bed.room_number]) {
        roomsMap[bed.room_number] = {
          room_number: bed.room_number,
          floor: bed.floor,
          total_count: 0,
          occupied_count: 0,
          beds: []
        }
      }
      roomsMap[bed.room_number].total_count++
      if (bed.status === 'occupied') {
        roomsMap[bed.room_number].occupied_count++
      }
      roomsMap[bed.room_number].beds.push({
        id: bed.id,
        bed_number: bed.bed_number,
        room_number: bed.room_number,
        floor: bed.floor,
        status: bed.status,
        elderly_name: bed.elderly_name,
        bed_type: bed.bed_type,
        price: bed.price
      })
    })
    
    return mockRequest({
      data: Object.values(roomsMap)
    })
  }
  
  return request.get(`/api/beds/floor/${floor}`)
}