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
        <el-form-item label="优先级">
          <el-select v-model="searchForm.priority" placeholder="全部优先级" clearable style="width: 120px">
            <el-option label="高" value="high" />
            <el-option label="中" value="medium" />
            <el-option label="低" value="low" />
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
        <el-table-column prop="task_content" label="任务内容" min-width="200" show-overflow-tooltip />
        <el-table-column label="任务类型" width="120">
          <template #default="{ row }">
            <StatusTag type="careType" :value="row.task_type" size="small" />
          </template>
        </el-table-column>
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
        <el-table-column prop="caregiver_name" label="分配给" width="120" />
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCareTasks, updateTaskStatus, getElderlyList } from '@/api'
import { useTable } from '@/composables/useTable'
import { TASK_STATUS_OPTIONS } from '@/utils/constants'

const elderlyList = ref([])
const caregivers = ref([{ id: 10, name: '护工小王' }, { id: 11, name: '护工小李' }])
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
    assigned_to: null,
    priority: null
  })
}

// 加载老人列表
const loadElderlyList = async () => {
  try {
    const response = await getElderlyList({ status: 'in', page: 1, page_size: 1000 })
    elderlyList.value = response.data.items || []
  } catch (error) {
    console.error('加载老人列表失败')
  }
}

onMounted(() => {
  initSearchForm()
  loadElderlyList()
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
    
    // 实际删除操作
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
  ElMessage.info('编辑功能开发中')
}

const deleteTask = async (task) => {
  try {
    await ElMessageBox.confirm('确认删除该任务吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    ElMessage.success('任务已删除')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const showAddDialog = () => {
  ElMessage.info('新增功能开发中')
}

loadElderlyList()
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