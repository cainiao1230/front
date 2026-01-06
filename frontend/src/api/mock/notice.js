// Mock 数据 - 通知公告
export const mockNotices = [
  {
    id: 1,
    title: '春节放假通知',
    content: '根据国家规定，春节期间正常营业，护理人员轮班制度',
    type: 'announcement',
    status: 'published',
    priority: 'high',
    publisher_id: 1,
    publisher_name: '管理员',
    publish_time: '2026-01-05 10:00:00',
    created_at: '2026-01-05T10:00:00'
  },
  {
    id: 2,
    title: '健康讲座活动',
    content: '本周五下午2点，在一楼活动室举办老年健康讲座',
    type: 'activity',
    status: 'published',
    priority: 'normal',
    publisher_id: 1,
    publisher_name: '管理员',
    publish_time: '2026-01-04 15:00:00',
    created_at: '2026-01-04T15:00:00'
  },
  {
    id: 3,
    title: '系统维护通知',
    content: '本周六凌晨2点-4点进行系统维护，期间可能无法访问',
    type: 'system',
    status: 'published',
    priority: 'high',
    publisher_id: 1,
    publisher_name: '管理员',
    publish_time: '2026-01-03 16:00:00',
    created_at: '2026-01-03T16:00:00'
  }
]
