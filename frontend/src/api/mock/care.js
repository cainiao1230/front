// Mock 数据 - 护理管理
export const mockCareRecords = [
  {
    id: 1,
    elderly_id: 1,
    elderly_name: '张三',
    caregiver_id: 10,
    caregiver_name: '护工小王',
    care_type: 'daily',
    care_content: '协助洗漱、更换衣物',
    care_time: '2026-01-06 08:00:00',
    remarks: '老人状态良好',
    created_at: '2026-01-06T08:15:00'
  },
  {
    id: 2,
    elderly_id: 2,
    elderly_name: '李四',
    caregiver_id: 11,
    caregiver_name: '护工小李',
    care_type: 'medical',
    care_content: '测量血糖、注射胰岛素',
    care_time: '2026-01-06 09:00:00',
    remarks: '血糖值正常',
    created_at: '2026-01-06T09:10:00'
  },
  {
    id: 3,
    elderly_id: 3,
    elderly_name: '王五',
    caregiver_id: 10,
    caregiver_name: '护工小王',
    care_type: 'rehabilitation',
    care_content: '康复训练30分钟',
    care_time: '2026-01-06 10:00:00',
    remarks: '配合度良好',
    created_at: '2026-01-06T10:30:00'
  }
]

export const mockCareTasks = [
  {
    id: 1,
    elderly_id: 1,
    elderly_name: '张三',
    task_type: 'medication',
    task_content: '服用降压药',
    scheduled_time: '2026-01-06 14:00:00',
    status: 'pending',
    assigned_to: 10,
    caregiver_name: '护工小王',
    created_at: '2026-01-06T08:00:00'
  },
  {
    id: 2,
    elderly_id: 2,
    elderly_name: '李四',
    task_type: 'medical_check',
    task_content: '测量血糖',
    scheduled_time: '2026-01-06 16:00:00',
    status: 'pending',
    assigned_to: 11,
    caregiver_name: '护工小李',
    created_at: '2026-01-06T08:00:00'
  },
  {
    id: 3,
    elderly_id: 1,
    elderly_name: '张三',
    task_type: 'daily_care',
    task_content: '晚间洗漱',
    scheduled_time: '2026-01-06 20:00:00',
    status: 'completed',
    assigned_to: 10,
    caregiver_name: '护工小王',
    completed_at: '2026-01-06T20:15:00',
    created_at: '2026-01-06T08:00:00'
  }
]

export const mockMedicationRecords = [
  {
    id: 1,
    elderly_id: 1,
    elderly_name: '张三',
    medication_name: '硝苯地平缓释片',
    dosage: '30mg',
    frequency: '每日一次',
    start_date: '2024-01-15',
    end_date: null,
    status: 'active',
    prescribed_by: '张医生',
    remarks: '饭后服用',
    created_at: '2024-01-15T10:00:00'
  },
  {
    id: 2,
    elderly_id: 2,
    elderly_name: '李四',
    medication_name: '二甲双胍片',
    dosage: '500mg',
    frequency: '每日三次',
    start_date: '2024-02-10',
    end_date: null,
    status: 'active',
    prescribed_by: '李医生',
    remarks: '餐前服用',
    created_at: '2024-02-10T10:00:00'
  }
]
