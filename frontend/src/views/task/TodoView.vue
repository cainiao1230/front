<template>
  <div class="todo-view-page">
    <PageCard title="我的待办">
      <template #actions>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon> 新增待办
        </el-button>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane name="all">
          <template #label>
            全部 <el-badge :value="todos.length" :hidden="todos.length === 0" class="tab-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane name="pending">
          <template #label>
            待办 <el-badge :value="pendingCount" :hidden="pendingCount === 0" class="tab-badge" type="warning" />
          </template>
        </el-tab-pane>
        <el-tab-pane name="completed">
          <template #label>
            已完成 <el-badge :value="completedCount" :hidden="completedCount === 0" class="tab-badge" type="success" />
          </template>
        </el-tab-pane>
      </el-tabs>

      <div class="todo-list">
        <transition-group name="todo" tag="div">
          <div
            v-for="todo in filteredTodos"
            :key="todo.id"
            class="todo-item"
            :class="{ 
              'completed': todo.completed,
              'overdue': isOverdue(todo.due_date),
              'due-soon': isDueSoon(todo.due_date)
            }"
            draggable="true"
            @dragstart="startDrag(todo)"
            @dragover.prevent="dragOver"
            @drop.prevent="drop(todo)"
          >
            <div class="todo-checkbox">
              <el-checkbox v-model="todo.completed" @change="toggleTodo(todo)" size="large" />
            </div>
            <div class="todo-content">
              <div class="todo-title">{{ todo.title }}</div>
              <div class="todo-meta">
                <el-tag v-if="todo.priority === 'high'" type="danger" size="small">高优先级</el-tag>
                <el-tag v-else-if="todo.priority === 'medium'" type="warning" size="small">中优先级</el-tag>
                <el-tag v-else type="info" size="small">低优先级</el-tag>
                <span class="todo-due-date" v-if="todo.due_date">
                  <el-icon><Clock /></el-icon> {{ formatDate(todo.due_date) }}
                  <el-tag v-if="isOverdue(todo.due_date)" type="danger" size="small">已逾期</el-tag>
                  <el-tag v-else-if="isDueSoon(todo.due_date)" type="warning" size="small">即将截止</el-tag>
                </span>
              </div>
            </div>
            <div class="todo-actions">
              <el-button size="small" link @click="editTodo(todo)">编辑</el-button>
              <el-button type="danger" size="small" link @click="deleteTodo(todo)">删除</el-button>
            </div>
          </div>
        </transition-group>

        <el-empty v-if="filteredTodos.length === 0" :description="getEmptyDescription()" />
      </div>
    </PageCard>

    <!-- 添加/编辑对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑待办' : '新增待办'" width="500px">
      <el-form :model="todoForm" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="待办标题" prop="title">
          <el-input v-model="todoForm.title" placeholder="请输入待办事项" />
        </el-form-item>
        <el-form-item label="优先级" prop="priority">
          <el-select v-model="todoForm.priority" style="width: 100%">
            <el-option label="高优先级" value="high" />
            <el-option label="中优先级" value="medium" />
            <el-option label="低优先级" value="low" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止日期" prop="due_date">
          <el-date-picker
            v-model="todoForm.due_date"
            type="datetime"
            placeholder="选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTodo">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Clock } from '@element-plus/icons-vue'
import { formatDate } from '@/utils/format'
import { required } from '@/utils/validators'

const activeTab = ref('all')
const dialogVisible = ref(false)
const isEdit = ref(false)
const formRef = ref(null)

const todos = ref([
  {
    id: 1,
    title: '检查王大爹的血压记录',
    priority: 'high',
    due_date: '2024-01-20 14:00',
    completed: false
  },
  {
    id: 2,
    title: '准备下周的康复计划',
    priority: 'medium',
    due_date: '2024-01-22 10:00',
    completed: false
  },
  {
    id: 3,
    title: '更新老人健康档案',
    priority: 'low',
    due_date: '2024-01-25 16:00',
    completed: true
  }
])

let draggedTodo = null

const todoForm = ref({
  title: '',
  priority: 'medium',
  due_date: null
})

const rules = {
  title: [required('请输入待办标题')],
  priority: [required('请选择优先级')]
}

const pendingCount = computed(() => {
  return todos.value.filter(t => !t.completed).length
})

const completedCount = computed(() => {
  return todos.value.filter(t => t.completed).length
})

const filteredTodos = computed(() => {
  if (activeTab.value === 'pending') {
    return todos.value.filter(t => !t.completed)
  }
  if (activeTab.value === 'completed') {
    return todos.value.filter(t => t.completed)
  }
  return todos.value
})

const handleTabChange = () => {
  // 筛选已通过 computed 实现
}

const getEmptyDescription = () => {
  if (activeTab.value === 'pending') return '暂无待办事项'
  if (activeTab.value === 'completed') return '暂无已完成事项'
  return '暂无待办'
}

// 检查是否逾期
const isOverdue = (dueDate) => {
  if (!dueDate) return false
  const due = new Date(dueDate).getTime()
  const now = new Date().getTime()
  return due < now
}

// 检查是否即将截止（24小时内）
const isDueSoon = (dueDate) => {
  if (!dueDate || isOverdue(dueDate)) return false
  const due = new Date(dueDate).getTime()
  const now = new Date().getTime()
  const twentyFourHours = 24 * 60 * 60 * 1000
  return (due - now) < twentyFourHours && (due - now) > 0
}

// 拖拽开始
const startDrag = (todo) => {
  draggedTodo = todo
}

// 拖拽中
const dragOver = (e) => {
  e.preventDefault()
}

// 拖拽结束 - 交换位置
const drop = (targetTodo) => {
  if (!draggedTodo || draggedTodo.id === targetTodo.id) return
  
  const draggedIndex = todos.value.findIndex(t => t.id === draggedTodo.id)
  const targetIndex = todos.value.findIndex(t => t.id === targetTodo.id)
  
  if (draggedIndex > -1 && targetIndex > -1) {
    // 交换位置
    const temp = todos.value[draggedIndex]
    todos.value[draggedIndex] = todos.value[targetIndex]
    todos.value[targetIndex] = temp
    ElMessage.success('顺序已更新')
  }
  
  draggedTodo = null
}

const toggleTodo = (todo) => {
  if (todo.completed) {
    ElMessage.success('已完成')
  } else {
    ElMessage.info('已标讴为未完成')
  }
}

const showAddDialog = () => {
  isEdit.value = false
  todoForm.value = {
    title: '',
    priority: 'medium',
    due_date: null
  }
  dialogVisible.value = true
}

const editTodo = (todo) => {
  isEdit.value = true
  todoForm.value = { ...todo }
  dialogVisible.value = true
}

const saveTodo = async () => {
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      const index = todos.value.findIndex(t => t.id === todoForm.value.id)
      if (index > -1) {
        todos.value[index] = { ...todoForm.value }
      }
      ElMessage.success('编辑成功')
    } else {
      todos.value.push({
        id: Date.now(),
        ...todoForm.value,
        completed: false
      })
      ElMessage.success('添加成功')
    }
    
    dialogVisible.value = false
  } catch (error) {
    console.error('表单验证失败')
  }
}

const deleteTodo = async (todo) => {
  try {
    await ElMessageBox.confirm('确认删除该待办事项吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = todos.value.findIndex(t => t.id === todo.id)
    if (index > -1) {
      todos.value.splice(index, 1)
    }
    ElMessage.success('删除成功')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.todo-view-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.tab-badge {
  margin-left: 8px;
}

.todo-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.todo-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  transition: all 0.3s;
}

.todo-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.todo-item.completed {
  opacity: 0.6;
}

.todo-item.completed .todo-title {
  text-decoration: line-through;
  color: #909399;
}

.todo-checkbox {
  flex-shrink: 0;
  padding-top: 2px;
}

.todo-content {
  flex: 1;
  min-width: 0;
}

.todo-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.todo-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.todo-due-date {
  display: flex;
  align-items: center;
  gap: 4px;
}

.todo-actions {
  flex-shrink: 0;
  display: flex;
  gap: 8px;
}

.todo-item.overdue {
  border-color: #f56c6c;
  background-color: #fef0f0;
}

.todo-item.due-soon {
  border-color: #e6a23c;
  background-color: #fdf6ec;
}

/* 拖拽动画 */
.todo-enter-active,
.todo-leave-active {
  transition: all 0.3s ease;
}

.todo-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.todo-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.todo-move {
  transition: transform 0.3s ease;
}
</style>