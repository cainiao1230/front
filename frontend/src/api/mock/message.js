// Mock 数据 - 消息管理
export const mockMessages = [
  {
    id: 1,
    title: '护理任务提醒',
    content: '您有一个待完成的护理任务：老人张三14:00服药',
    type: 'task',
    status: 'unread',
    from_user_id: 1,
    from_user_name: '系统',
    to_user_id: 2,
    to_user_name: '护工小王',
    created_at: '2026-01-06 10:00:00'
  },
  {
    id: 2,
    title: '床位变更通知',
    content: '老人李四的床位已更换为B206',
    type: 'notification',
    status: 'read',
    from_user_id: 1,
    from_user_name: '管理员',
    to_user_id: 2,
    to_user_name: '护工小王',
    created_at: '2026-01-05 16:30:00'
  },
  {
    id: 3,
    title: '紧急情况',
    content: '老人王五出现不适，请立即查看',
    type: 'urgent',
    status: 'read',
    from_user_id: 1,
    from_user_name: '系统',
    to_user_id: 2,
    to_user_name: '护工小王',
    created_at: '2026-01-05 14:20:00'
  }
]
