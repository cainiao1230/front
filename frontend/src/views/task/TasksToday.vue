<template>
  <div class="tasks-today-page">
    <el-row :gutter="16">
      <el-col :span="6">
        <StatCard 
          title="今日总任务" 
          :value="stats.total" 
          suffix="项"
          :icon="List"
          type="primary"
        />
      </el-col>
      <el-col :span="6">
        <StatCard 
          title="待处理" 
          :value="stats.pending" 
          suffix="项"
          :icon="Clock"
          type="warning"
        />
      </el-col>
      <el-col :span="6">
        <StatCard 
          title="进行中" 
          :value="stats.inProgress" 
          suffix="项"
          :icon="Loading"
          type="primary"
        />
      </el-col>
      <el-col :span="6">
        <StatCard 
          title="已完成" 
          :value="stats.completed" 
          suffix="项"
          :icon="CircleCheck"
          type="success"
        />
      </el-col>
    </el-row>

    <PageCard title="今日护理任务" style="margin-top: 16px">
      <template #actions>
        <el-radio-group v-model="filterStatus" @change="handleFilterChange">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="pending">待处理</el-radio-button>
          <el-radio-button value="in_progress">进行中</el-radio-button>
          <el-radio-button value="completed">已完成</el-radio-button>
        </el-radio-group>
      </template>

      <el-timeline>
        <el-timeline-item
          v-for="task in filteredTasks"
          :key="task.id"
          :timestamp="task.scheduled_time"
          placement="top"
          :type="getTimelineType(task.status)"
          :icon="getTimelineIcon(task.status)"
        >
          <el-card>
            <div class="task-item">
              <div class="task-header">
                <div>
                  <el-tag :type="mapTaskStatus(task.status, 'type')" size="small">
                    {{ mapTaskStatus(task.status) }}
                  </el-tag>
                  <span class="task-elderly">{{ task.elderly_name }}</span>
                  <el-tag type="info" size="small">{{ task.caregiver_name }}</el-tag>
                </div>
                <div class="task-actions">
                  <el-button v-if="task.status === 'pending'" type="primary" size="small" @click="startTask(task)">
                    开始任务
                  </el-button>
                  <el-button v-if="task.status === 'in_progress'" type="success" size="small" @click="completeTask(task)">
                    完成任务
                  </el-button>
                </div>
              </div>
              <div class="task-content">
                {{ task.task_content }}
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-if="filteredTasks.length === 0" description="暂无任务" />
    </PageCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { List, Clock, Loading, CircleCheck, Check, Close } from '@element-plus/icons-vue'
import { getTodayTasks, updateTaskStatus } from '@/api'
import { mapTaskStatus } from '@/utils/mapper'

const tasks = ref([])
const loading = ref(false)
const filterStatus = ref('all')

const stats = computed(() => {
  return {
    total: tasks.value.length,
    pending: tasks.value.filter(t => t.status === 'pending').length,
    inProgress: tasks.value.filter(t => t.status === 'in_progress').length,
    completed: tasks.value.filter(t => t.status === 'completed').length
  }
})

const filteredTasks = computed(() => {
  if (filterStatus.value === 'all') {
    return tasks.value
  }
  return tasks.value.filter(t => t.status === filterStatus.value)
})

const getTimelineType = (status) => {
  const map = {
    'pending': 'warning',
    'in_progress': 'primary',
    'completed': 'success'
  }
  return map[status] || ''
}

const getTimelineIcon = (status) => {
  const map = {
    'pending': Clock,
    'in_progress': Loading,
    'completed': CircleCheck
  }
  return map[status] || Clock
}

const loadTasks = async () => {
  loading.value = true
  try {
    const response = await getTodayTasks()
    tasks.value = response.data || []
  } catch (error) {
    ElMessage.error('加载任务失败')
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  // 筛选已通过computed实现
}

const startTask = async (task) => {
  try {
    await updateTaskStatus(task.id, 'in_progress')
    ElMessage.success('任务已开始')
    loadTasks()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const completeTask = async (task) => {
  try {
    await updateTaskStatus(task.id, 'completed')
    ElMessage.success('任务已完成')
    loadTasks()
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.tasks-today-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.task-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.task-elderly {
  margin: 0 8px;
  font-weight: 600;
  font-size: 16px;
}

.task-content {
  color: #606266;
  line-height: 1.6;
}

.task-actions {
  display: flex;
  gap: 8px;
}
</style>