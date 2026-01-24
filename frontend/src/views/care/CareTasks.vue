<template>
  <div class="care-tasks-page">
    <PageCard title="护理任务管理">
      <template #actions>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon> 新增任务
        </el-button>
      </template>

      <SearchForm v-model="searchForm" @search="handleSearch" @reset="handleReset">
        <el-form-item label="老人">
          <el-select v-model="searchForm.elderly_id" placeholder="全部" clearable filterable style="width: 180px">
            <el-option v-for="e in elderlyList" :key="e.id" :label="e.name" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option v-for="opt in TASK_STATUS_OPTIONS" :key="opt.value" :label="opt.label" :value="opt.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="分配护工">
          <el-select v-model="searchForm.assigned_to" placeholder="全部护工" clearable style="width: 150px">
            <el-option v-for="c in caregivers" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <!-- 批量操作按钮 -->
      <div v-if="selectedTasks.length > 0" class="batch-actions">
        <span>已选择 {{ selectedTasks.length }} 项</span>
        <el-divider direction="vertical" />
        <el-button type="primary" size="small" @click="batchStart">批量开始</el-button>
        <el-button type="success" size="small" @click="batchComplete">批量完成</el-button>
        <el-button type="danger" size="small" @click="batchDelete">批量删除</el-button>
      </div>

      <DataTable 
        :data="tableData" 
        :loading="loading"
        :total="total"
        v-model:page="pagination.page"
        v-model:page-size="pagination.page_size"
        @change="loadData"
      >
        <el-table-column type="selection" width="50" @selection-change="handleSelectionChange" />
        <el-table-column prop="id" label="任务ID" width="80" />
        <el-table-column prop="elderly_name" label="老人" width="120" />
        <el-table-column prop="title" label="任务标题" width="150" show-overflow-tooltip />
        <el-table-column prop="description" label="任务内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="优先级" width="100">
          <template #default="{ row }">
            <el-tag 
              :type="getPriorityColor(row.priority)"
              size="small"
            >
              {{ getPriorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag type="taskStatus" :value="row.status" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="assigned_to_name" label="分配给" width="120" />
        <el-table-column prop="scheduled_time" label="计划时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'pending'" type="primary" size="small" link @click="startTask(row)">
              开始
            </el-button>
            <el-button v-if="row.status === 'in_progress'" type="success" size="small" link @click="completeTask(row)">
              完成
            </el-button>
            <el-button size="small" link @click="editTask(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="deleteTask(row)">删除</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </PageCard>

    <!-- 新增/编辑任务对话框 -->
    <el-dialog 
      v-model="taskDialogVisible" 
      :title="isEditMode ? '编辑护理任务' : '新增护理任务'"
      width="600px"
    >
      <el-form 
        ref="taskFormRef" 
        :model="taskForm" 
        :rules="taskFormRules" 
        label-width="100px"
      >
        <el-form-item label="选择老人" prop="elderly_id">
          <el-select 
            v-model="taskForm.elderly_id" 
            placeholder="请选择老人" 
            filterable 
            style="width: 100%"
          >
            <el-option 
              v-for="e in elderlyList" 
              :key="e.id" 
              :label="e.name" 
              :value="e.id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="任务标题" prop="title">
          <el-select 
            v-model="taskForm.title" 
            placeholder="请选择任务类型" 
            allow-create
            filterable
            style="width: 100%"
          >
            <el-option 
              v-for="opt in TASK_TYPE_OPTIONS" 
              :key="opt.value" 
              :label="opt.label" 
              :value="opt.label" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="任务描述" prop="description">
          <el-input 
            v-model="taskForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请输入任务详细描述（可选）"
          />
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="taskForm.priority">
            <el-radio label="high">高</el-radio>
            <el-radio label="medium">中</el-radio>
            <el-radio label="low">低</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="分配护工" prop="assigned_to">
          <el-select 
            v-model="taskForm.assigned_to" 
            placeholder="请选择护工" 
            style="width: 100%"
          >
            <el-option 
              v-for="c in caregivers" 
              :key="c.id" 
              :label="c.name" 
              :value="c.id" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="计划时间" prop="scheduled_time">
          <el-date-picker
            v-model="taskForm.scheduled_time"
            type="datetime"
            placeholder="选择计划执行时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCareTasks, updateTaskStatus, getElderlyList, getSystemUsers } from '@/api'
import { useTable } from '@/composables/useTable'
import { TASK_STATUS_OPTIONS } from '@/utils/constants'

// 任务类型选项
const TASK_TYPE_OPTIONS = [
  { label: '晨间护理', value: 'morning_care' },
  { label: '协助就餐', value: 'meal_assist' },
  { label: '用药提醒', value: 'medication' },
  { label: '清洁卫生', value: 'cleaning' },
  { label: '陪同就医', value: 'medical' },
  { label: '康复训练', value: 'rehabilitation' }
]

const elderlyList = ref([])
const caregivers = ref([])
const selectedTasks = ref([])

const {
  loading,
  tableData,
  total,
  pagination,
  searchForm,
  loadData,
  handleSearch,
  handleReset
} = useTable(getCareTasks, { immediate: false })

// 初始化搜索表单
const initSearchForm = () => {
  Object.assign(searchForm, {
    elderly_id: null,
    status: null,
    assigned_to: null
  })
}

// 加载老人列表
const loadElderlyList = async () => {
  try {
    const response = await getElderlyList({ status: 'in', page: 1, page_size: 1000 })
    // 兼容多种响应格式
    let items = []
    if (response?.data?.items) {
      items = response.data.items
    } else if (response?.items) {
      items = response.items
    } else if (Array.isArray(response?.data)) {
      items = response.data
    } else if (Array.isArray(response)) {
      items = response
    }
    elderlyList.value = items
    console.log('[护理任务] 老人列表加载成功:', items.length, '人')
  } catch (error) {
    console.error('加载老人列表失败:', error)
    ElMessage.error('加载老人列表失败')
  }
}

// 加载护工和护士列表
const loadCaregivers = async () => {
  try {
    // 同时获取护工和护士
    const [caregiverRes, nurseRes] = await Promise.all([
      getSystemUsers({ role: 'caregiver', page: 1, page_size: 1000 }).catch(() => null),
      getSystemUsers({ role: 'nurse', page: 1, page_size: 1000 }).catch(() => null)
    ])
    
    // 解析响应数据的辅助函数
    const parseItems = (response) => {
      if (!response) return []
      if (response?.data?.items) return response.data.items
      if (response?.items) return response.items
      if (Array.isArray(response?.data)) return response.data
      if (Array.isArray(response)) return response
      return []
    }
    
    const caregiverItems = parseItems(caregiverRes)
    const nurseItems = parseItems(nurseRes)
    
    // 合并护工和护士列表
    const allItems = [...caregiverItems, ...nurseItems]
    
    // 如果没有数据，使用模拟数据
    if (allItems.length === 0) {
      caregivers.value = [
        { id: 10, name: '护工小王', role: 'caregiver' },
        { id: 11, name: '护工小李', role: 'caregiver' },
        { id: 12, name: '护士张三', role: 'nurse' },
        { id: 13, name: '护士王五', role: 'nurse' }
      ]
      console.log('[护理任务] 使用模拟护理人员数据')
    } else {
      caregivers.value = allItems.map(u => ({ 
        id: u.id, 
        name: u.username || u.name,
        role: u.role 
      }))
      console.log('[护理任务] 护理人员加载成功: 护工', caregiverItems.length, '人, 护士', nurseItems.length, '人')
    }
  } catch (error) {
    console.error('加载护理人员列表失败:', error)
    // 使用模拟数据
    caregivers.value = [
      { id: 10, name: '护工小王', role: 'caregiver' },
      { id: 11, name: '护工小李', role: 'caregiver' },
      { id: 12, name: '护士张三', role: 'nurse' },
      { id: 13, name: '护士王五', role: 'nurse' }
    ]
  }
}

onMounted(() => {
  initSearchForm()
  loadElderlyList()
  loadCaregivers()
  loadData()  // 加载任务列表数据
})

// 选择改变
const handleSelectionChange = (selection) => {
  selectedTasks.value = selection
}

// 优先级文本
const getPriorityText = (priority) => {
  const map = { 'high': '高', 'medium': '中', 'low': '低' }
  return map[priority] || priority
}

// 优先级颜色
const getPriorityColor = (priority) => {
  const map = { 'high': 'danger', 'medium': 'warning', 'low': 'info' }
  return map[priority] || ''
}

// 批量开始任务
const batchStart = async () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请先选择任务')
    return
  }
  
  try {
    for (const task of selectedTasks.value) {
      if (task.status === 'pending') {
        await updateTaskStatus(task.id, 'in_progress')
      }
    }
    ElMessage.success('批量操作成功')
    selectedTasks.value = []
    loadData()
  } catch (error) {
    ElMessage.error('批量操作失败')
  }
}

// 批量完成任务
const batchComplete = async () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请先选择任务')
    return
  }
  
  try {
    for (const task of selectedTasks.value) {
      if (task.status === 'in_progress') {
        await updateTaskStatus(task.id, 'completed')
      }
    }
    ElMessage.success('批量操作成功')
    selectedTasks.value = []
    loadData()
  } catch (error) {
    ElMessage.error('批量操作失败')
  }
}

// 批量删除任务
const batchDelete = async () => {
  if (selectedTasks.value.length === 0) {
    ElMessage.warning('请先选择任务')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确认删除 ${selectedTasks.value.length} 个任务吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 批量删除
    const { deleteCareTask } = await import('@/api')
    for (const task of selectedTasks.value) {
      await deleteCareTask(task.id)
    }
    
    ElMessage.success('任务已删除')
    selectedTasks.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const startTask = async (task) => {
  try {
    await updateTaskStatus(task.id, 'in_progress')
    ElMessage.success('任务已开始')
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const completeTask = async (task) => {
  try {
    await updateTaskStatus(task.id, 'completed')
    ElMessage.success('任务已完成')
    loadData()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const editTask = (task) => {
  isEditMode.value = true
  currentTaskId.value = task.id
  Object.assign(taskForm, {
    elderly_id: task.elderly_id,
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'medium',
    assigned_to: task.assigned_to,
    scheduled_time: task.scheduled_time || ''
  })
  taskDialogVisible.value = true
}

const deleteTask = async (task) => {
  try {
    await ElMessageBox.confirm('确认删除该任务吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const { deleteCareTask } = await import('@/api')
    await deleteCareTask(task.id)
    
    ElMessage.success('任务已删除')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
    }
  }
}

const showAddDialog = () => {
  isEditMode.value = false
  currentTaskId.value = null
  Object.assign(taskForm, {
    elderly_id: '',
    title: '',
    description: '',
    priority: 'medium',
    assigned_to: '',
    scheduled_time: ''
  })
  taskDialogVisible.value = true
}

// 任务表单
const taskDialogVisible = ref(false)
const taskFormRef = ref(null)
const isEditMode = ref(false)
const currentTaskId = ref(null)
const taskForm = reactive({
  elderly_id: '',
  title: '',
  description: '',
  priority: 'medium',
  assigned_to: '',
  scheduled_time: ''
})

const taskFormRules = {
  elderly_id: [{ required: true, message: '请选择老人', trigger: 'change' }],
  title: [{ required: true, message: '请输入任务标题', trigger: 'blur' }],
  description: [{ required: false, message: '请输入任务内容', trigger: 'blur' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  assigned_to: [{ required: true, message: '请选择分配护工', trigger: 'change' }],
  scheduled_time: [{ required: true, message: '请选择计划时间', trigger: 'change' }]
}

// 保存任务
const saveTask = async () => {
  try {
    await taskFormRef.value.validate()
    
    if (isEditMode.value) {
      // 编辑模式
      const { updateCareTask } = await import('@/api')
      await updateCareTask(currentTaskId.value, taskForm)
      ElMessage.success('任务更新成功')
    } else {
      // 新增模式
      const { createCareTask } = await import('@/api')
      await createCareTask(taskForm)
      ElMessage.success('任务创建成功')
    }
    
    taskDialogVisible.value = false
    loadData()
  } catch (error) {
    if (error !== false) {
      ElMessage.error((isEditMode.value ? '更新' : '创建') + '失败：' + (error.message || '未知错误'))
    }
  }
}
</script>

<style scoped>
.care-tasks-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.batch-actions {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #ecf5ff;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

.batch-actions span {
  color: #303133;
  font-weight: 500;
}
</style>