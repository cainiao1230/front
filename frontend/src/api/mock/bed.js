// Mock 数据 - 床位管理
export const mockBedList = [
  {
    id: 101,
    bed_number: 'A101',
    floor: 1,
    room_number: 'A区101室',
    bed_type: 'single',
    status: 'occupied',
    elderly_id: 1,
    elderly_name: '张三',
    price: 3000,
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 102,
    bed_number: 'A102',
    floor: 1,
    room_number: 'A区102室',
    bed_type: 'single',
    status: 'available',
    elderly_id: null,
    elderly_name: null,
    price: 3000,
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 205,
    bed_number: 'B205',
    floor: 2,
    room_number: 'B区205室',
    bed_type: 'double',
    status: 'occupied',
    elderly_id: 2,
    elderly_name: '李四',
    price: 2500,
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 206,
    bed_number: 'B206',
    floor: 2,
    room_number: 'B区206室',
    bed_type: 'double',
    status: 'available',
    elderly_id: null,
    elderly_name: null,
    price: 2500,
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 308,
    bed_number: 'C308',
    floor: 3,
    room_number: 'C区308室',
    bed_type: 'vip',
    status: 'occupied',
    elderly_id: 3,
    elderly_name: '王五',
    price: 5000,
    created_at: '2024-01-01T10:00:00'
  },
  {
    id: 309,
    bed_number: 'C309',
    floor: 3,
    room_number: 'C区309室',
    bed_type: 'vip',
    status: 'maintenance',
    elderly_id: null,
    elderly_name: null,
    price: 5000,
    created_at: '2024-01-01T10:00:00'
  }
]

export const mockBedHistory = [
  {
    id: 1,
    bed_id: 101,
    bed_number: 'A101',
    elderly_id: 1,
    elderly_name: '张三',
    start_date: '2024-01-15',
    end_date: null,
    status: 'active',
    remarks: '正常入住',
    created_at: '2024-01-15T10:00:00'
  },
  {
    id: 2,
    bed_id: 205,
    bed_number: 'B205',
    elderly_id: 2,
    elderly_name: '李四',
    start_date: '2024-02-10',
    end_date: null,
    status: 'active',
    remarks: '正常入住',
    created_at: '2024-02-10T10:00:00'
  }
]
