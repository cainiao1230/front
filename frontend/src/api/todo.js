import request from './request'

// ========== 待办事项模块 ==========
// 后端状态值: open (待处理) / done (已完成)

// 获取待办列表
// 可选参数: status=open 或 status=done
export const getTodos = (params = {}) => {
  return request.get('/api/todos', { params })
}

// 获取待办详情
export const getTodoDetail = (id) => {
  return request.get(`/api/todos/${id}`)
}

// 创建待办
// 请求体: { title: string, due_at?: string }
export const createTodo = (data) => {
  return request.post('/api/todos', data)
}

// 更新待办
export const updateTodo = (id, data) => {
  return request.put(`/api/todos/${id}`, data)
}

// 完成待办
export const completeTodo = (id) => {
  return request.patch(`/api/todos/${id}/complete`)
}

// 删除待办
export const deleteTodo = (id) => {
  return request.delete(`/api/todos/${id}`)
}
