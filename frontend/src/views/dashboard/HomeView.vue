<!-- src/views/HomeView.vue -->
<template>
  <div class="home-container">
    <!-- 🚨 模块1：实时安全预警栏 -->
    <div class="alert-section">
      <div class="section-header">
        <el-icon class="section-icon"><Warning /></el-icon>
        <h3>实时安全预警</h3>
        <el-tag v-if="alerts.length > 0" type="danger" size="small">
          {{ alerts.length }}条未处理
        </el-tag>
      </div>
      
      <div v-loading="alertsLoading" class="alert-content">
        <div v-if="alerts.length === 0" class="empty-alerts">
          <el-icon><CircleCheck /></el-icon>
          <span>暂无紧急事件</span>
        </div>
        
        <div v-else class="alert-list">
          <div 
            v-for="alert in alerts" 
            :key="alert.id"
            class="alert-item"
            @click="goToElderlyDetail(alert.elderlyId)"
          >
            <el-tag 
              :type="alert.level === 'critical' ? 'danger' : 'warning'"
              size="small"
            >
              {{ alert.level === 'critical' ? '紧急' : '预警' }}
            </el-tag>
            <span class="alert-text">{{ alert.description }}</span>
            <span class="alert-time">{{ formatTime(alert.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 📊 模块3：关键运营指标卡片 -->
    <div class="metrics-section">
      <div class="section-header">
        <el-icon class="section-icon"><DataAnalysis /></el-icon>
        <h3>运营概览</h3>
      </div>
      
      <el-row :gutter="16" v-loading="metricsLoading">
        <el-col :xs="24" :sm="12" :md="6" v-for="metric in metrics" :key="metric.id">
          <el-card shadow="hover" class="metric-card" :class="`metric-${metric.id}`">
            <div class="metric-content">
              <div class="metric-icon">
                <el-icon :size="24">
                  <component :is="metric.icon" />
                </el-icon>
              </div>
              <div class="metric-info">
                <div class="metric-title">{{ metric.title }}</div>
                <div class="metric-value">
                  <el-statistic :value="metric.value" />
                </div>
                <div v-if="metric.trend" class="metric-trend" :class="metric.trend.type">
                  <el-icon :size="12">
                    <CaretTop v-if="metric.trend.type === 'up'" />
                    <CaretBottom v-else />
                  </el-icon>
                  {{ metric.trend.value }}
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <el-row :gutter="16" class="main-content">
      <!-- 👥 模块2：今日照护任务 -->
      <el-col :xs="24" :lg="12">
        <div class="task-section">
          <div class="section-header">
            <el-icon class="section-icon"><List /></el-icon>
            <h3>今日照护安排</h3>
            <el-select 
              v-model="taskFilter" 
              size="small" 
              style="width: 120px; margin-left: auto;"
            >
              <el-option label="全部" value="all" />
              <el-option label="未开始" value="pending" />
              <el-option label="进行中" value="in_progress" />
              <el-option label="已完成" value="completed" />
            </el-select>
          </div>
          
          <el-table 
            :data="filteredTasks" 
            v-loading="tasksLoading"
            style="width: 100%"
            :row-class-name="tableRowClassName"
          >
            <el-table-column prop="elderlyName" label="老人信息" width="120">
              <template #default="{ row }">
                <div class="elderly-info">
                  <div class="elderly-name">{{ row.elderlyName }}</div>
                  <div class="room-number">{{ row.roomNumber }}</div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="taskType" label="任务类型" width="100">
              <template #default="{ row }">
                <el-tag :type="getTaskTypeTag(row.taskType)" size="small">
                  {{ row.taskType }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="scheduledTime" label="执行时间" width="80" />
            
            <el-table-column prop="assignee" label="责任人" width="80" />
            
            <el-table-column prop="status" label="状态" width="90">
              <template #default="{ row }">
                <el-tag 
                  :type="getStatusTag(row.status)" 
                  size="small"
                  :effect="row.status === 'overdue' ? 'dark' : 'light'"
                >
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <!-- 🛏️ 模块4：床位使用概览 -->
      <el-col :xs="24" :lg="12">
        <div class="bed-section">
          <div class="section-header">
            <el-icon class="section-icon"><OfficeBuilding /></el-icon>
            <h3>各楼层床位使用情况</h3>
          </div>
          
          <el-table 
            :data="floors" 
            v-loading="floorsLoading"
            style="width: 100%"
            @row-click="goToFloorBeds"
          >
            <el-table-column prop="floorName" label="楼层" width="80" />
            
            <el-table-column prop="totalBeds" label="总床位" width="80" />
            
            <el-table-column prop="occupiedBeds" label="已占用" width="80" />
            
            <el-table-column prop="availableBeds" label="空余" width="80" />
            
            <el-table-column prop="occupancyRate" label="使用率" width="120">
              <template #default="{ row }">
                <div class="progress-cell">
                  <el-progress 
                    :percentage="row.occupancyRate" 
                    :color="getProgressColor(row.occupancyRate)"
                    :show-text="false"
                  />
                  <span class="progress-text">{{ row.occupancyRate }}%</span>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="16" class="secondary-content">
      <!-- 📝 模块5：待办事项中心 -->
      <el-col :xs="24" :lg="12">
        <div class="todo-section">
          <div class="section-header">
            <el-icon class="section-icon"><Checked /></el-icon>
            <h3>我的待办事项</h3>
          </div>
          
          <div v-loading="todosLoading" class="todo-list">
            <div v-if="todos.length === 0" class="empty-todos">
              <el-empty description="暂无待办事项" />
            </div>
            
            <div v-else>
              <div v-for="todo in todos" :key="todo.id" class="todo-item">
                <div class="todo-header">
                  <span class="todo-title">{{ todo.title }}</span>
                  <el-tag 
                    :type="getTodoStatusTag(todo.status)" 
                    size="small"
                  >
                    {{ getTodoStatusText(todo.status) }}
                  </el-tag>
                </div>
                
                <div class="todo-body">
                  <div class="todo-deadline">
                    <el-icon><Clock /></el-icon>
                    截止时间：{{ formatDateTime(todo.deadline) }}
                  </div>
                  
                  <div class="todo-actions">
                    <el-button 
                      v-if="todo.status === 'pending'"
                      type="primary" 
                      size="small"
                      @click.stop="markTodoComplete(todo.id)"
                    >
                      标记完成
                    </el-button>
                    <el-button 
                      type="info" 
                      size="small"
                      @click.stop="viewTodoDetail(todo.id)"
                    >
                      查看详情
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <!-- 📣 模块6：机构公告栏 -->
      <el-col :xs="24" :lg="12">
        <div class="notice-section">
          <div class="section-header">
            <el-icon class="section-icon"><Bell /></el-icon>
            <h3>最新通知</h3>
            <el-button 
              type="text" 
              size="small"
              @click="goToNotices"
            >
              查看更多
            </el-button>
          </div>
          
          <div v-loading="noticesLoading" class="notice-list">
            <div v-if="notices.length === 0" class="empty-notices">
              <el-empty description="暂无通知" />
            </div>
            
            <div v-else>
              <el-card 
                v-for="notice in notices" 
                :key="notice.id"
                shadow="hover"
                class="notice-card"
                :class="{ pinned: notice.isPinned }"
                @click="viewNoticeDetail(notice.id)"
              >
                <div class="notice-header">
                  <span class="notice-title">
                    <el-icon v-if="notice.isPinned" class="pin-icon"><Star /></el-icon>
                    {{ notice.title }}
                  </span>
                  <span class="notice-time">{{ formatDateTime(notice.publishTime) }}</span>
                </div>
                <div class="notice-summary">{{ notice.summary }}</div>
              </el-card>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 📱 模块7：家属服务快捷入口 -->
    <div v-if="showFamilyServices" class="family-services-section">
      <div class="section-header">
        <el-icon class="section-icon"><Phone /></el-icon>
        <h3>家属服务</h3>
      </div>
      
      <div class="service-buttons">
        <el-button 
          type="primary" 
          plain 
          class="service-button"
          @click="goToMessages"
        >
          <el-icon><ChatDotRound /></el-icon>
          查看家属留言
        </el-button>
        
        <el-button 
          type="success" 
          plain 
          class="service-button"
          @click="showVisitInvitationDialog"
        >
          <el-icon><Promotion /></el-icon>
          发送探视邀请
        </el-button>
        
        <el-button 
          type="warning" 
          plain 
          class="service-button"
          @click="exportCareReport"
        >
          <el-icon><Download /></el-icon>
          下载护理报告
        </el-button>
      </div>
    </div>

    <!-- 探视邀请对话框 -->
    <el-dialog 
      v-model="visitDialogVisible" 
      title="发送探视邀请"
      width="500px"
    >
      <el-form :model="visitForm" label-width="80px">
        <el-form-item label="家属姓名" required>
          <el-input v-model="visitForm.familyName" placeholder="请输入家属姓名" />
        </el-form-item>
        
        <el-form-item label="老人姓名" required>
          <el-input v-model="visitForm.elderlyName" placeholder="请输入老人姓名" />
        </el-form-item>
        
        <el-form-item label="探视时间" required>
          <el-date-picker
            v-model="visitForm.visitTime"
            type="datetime"
            placeholder="选择探视时间"
            style="width: 100%"
          />
        </el-form-item>
        
        <el-form-item label="备注">
          <el-input 
            v-model="visitForm.remarks" 
            type="textarea" 
            :rows="3"
            placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="visitDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="sendVisitInvitation">发送</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getDashboardStats } from '@/api/dashboard'
import { getTodayTasks } from '@/api/care'
import { getTodos, completeTodo as completeTodoApi } from '@/api/todo'
import { getNotices } from '@/api/notice'
import { getMessages } from '@/api/message'
import { getBedStatsByFloor } from '@/api/bed'
import {
  Warning,
  CircleCheck,
  DataAnalysis,
  CaretTop,
  CaretBottom,
  List,
  OfficeBuilding,
  Checked,
  Clock,
  Bell,
  Star,
  Phone,
  ChatDotRound,
  Promotion,
  Download,
  User,
  Goods,
  Sunny,
  Message
} from '@element-plus/icons-vue'

const router = useRouter()

// 🚨 模块1：实时安全预警栏
const alerts = ref([])
const alertsLoading = ref(false)
let alertsInterval = null

// 👥 模块2：今日照护任务
const tasks = ref([])
const tasksLoading = ref(false)
const taskFilter = ref('all')

// 📊 模块3：关键运营指标卡片
const metrics = ref([])
const metricsLoading = ref(false)

// 🛏️ 模块4：床位使用概览
const floors = ref([])
const floorsLoading = ref(false)

// 📝 模块5：待办事项中心
const todos = ref([])
const todosLoading = ref(false)

// 📣 模块6：机构公告栏
const notices = ref([])
const noticesLoading = ref(false)

// 📱 模块7：家属服务快捷入口
const showFamilyServices = computed(() => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.role === 'admin' || user.role === 'nurse'
})

// 探视邀请对话框
const visitDialogVisible = ref(false)
const visitForm = ref({
  familyName: '',
  elderlyName: '',
  visitTime: '',
  remarks: ''
})

// 过滤后的任务
const filteredTasks = computed(() => {
  if (taskFilter.value === 'all') return tasks.value
  return tasks.value.filter(task => task.status === taskFilter.value)
})

// 获取用户信息
const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')
  } catch {
    return {}
  }
}

// 🚨 加载安全预警数据
const loadAlerts = async () => {
  alertsLoading.value = true
  try {
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 模拟数据
    alerts.value = [
      {
        id: 'A001',
        level: 'critical',
        description: '[302房间] 张建国跌倒报警',
        elderlyId: 'E001',
        createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      },
      {
        id: 'A002',
        level: 'warning',
        description: '[205房间] 李秀英离床超时',
        elderlyId: 'E002',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        id: 'A003',
        level: 'warning',
        description: '[108房间] 王奶奶心率异常',
        elderlyId: 'E003',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  } catch (error) {
    console.error('加载安全预警失败:', error)
    alerts.value = []
  } finally {
    alertsLoading.value = false
  }
}

// 👥 加载今日照护任务
const loadTasks = async () => {
  tasksLoading.value = true
  try {
    const res = await getTodayTasks()
    if (res.code === 0 && res.data) {
      // 将后端数据转换为前端格式
      tasks.value = (res.data.items || []).map(task => ({
        id: task.id,
        elderlyName: task.elderlyName,
        roomNumber: task.roomNumber || '--',
        taskType: task.title,
        scheduledTime: task.scheduledTime ? new Date(task.scheduledTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '--',
        assignee: task.assignedToName,
        status: task.status
      }))
    } else {
      tasks.value = []
    }
  } catch (error) {
    console.error('加载任务失败:', error)
    tasks.value = []
  } finally {
    tasksLoading.value = false
  }
}

// 📊 加载运营指标
const loadMetrics = async () => {
  metricsLoading.value = true
  try {
    const res = await getDashboardStats()
    if (res.code === 0 && res.data) {
      const { elderly, beds, tasks: taskStats } = res.data
      
      // 同时获取未读消息数量
      let unreadCount = 0
      try {
        const msgRes = await getMessages({ isRead: false })
        if (msgRes.code === 0 && msgRes.data) {
          unreadCount = msgRes.data.unreadCount || msgRes.data.items?.length || 0
        }
      } catch (e) {
        console.warn('获取消息数量失败:', e)
      }
      
      metrics.value = [
        {
          id: 'elderly',
          title: '在住老人',
          value: elderly?.inResidence || 0,
          icon: User,
          trend: { type: 'up', value: `${elderly?.total || 0}人` }
        },
        {
          id: 'beds',
          title: '空余床位',
          value: beds?.free || 0,
          icon: Goods,
          trend: { type: beds?.occupancyRate > 80 ? 'down' : 'up', value: `占用率${beds?.occupancyRate || 0}%` }
        },
        {
          id: 'tasks',
          title: '今日任务',
          value: taskStats?.todayTotal || 0,
          icon: Sunny,
          trend: { type: 'up', value: `已完成${taskStats?.todayCompleted || 0}` }
        },
        {
          id: 'messages',
          title: '未读消息',
          value: unreadCount,
          icon: Message,
          trend: { type: unreadCount > 0 ? 'up' : 'down', value: unreadCount > 0 ? '待处理' : '已清空' }
        }
      ]
    }
  } catch (error) {
    console.error('加载运营指标失败:', error)
    metrics.value = []
  } finally {
    metricsLoading.value = false
  }
}

// 🛏️ 加载床位使用情况（按楼层统计）
const loadFloors = async () => {
  floorsLoading.value = true
  try {
    // 使用后端新增的楼层统计接口
    const res = await getBedStatsByFloor()
    if (res.code === 200 && res.data) {
      // 后端返回格式: [{ floor, total, occupied, free, maintenance, locked, usage_rate }]
      floors.value = res.data.map(item => ({
        id: item.floor,
        floorName: item.floor,
        totalBeds: item.total || 0,
        occupiedBeds: item.occupied || 0,
        availableBeds: item.free || 0,
        occupancyRate: item.usage_rate || 0
      }))
    } else {
      // 如果新接口不可用，回退到dashboard统计
      const dashRes = await getDashboardStats()
      if (dashRes.code === 0 && dashRes.data && dashRes.data.beds) {
        const { beds } = dashRes.data
        floors.value = [{
          id: 'total',
          floorName: '全部床位',
          totalBeds: beds.total || 0,
          occupiedBeds: beds.occupied || 0,
          availableBeds: beds.free || 0,
          occupancyRate: beds.occupancyRate || 0
        }]
      } else {
        floors.value = []
      }
    }
  } catch (error) {
    console.error('加载楼层数据失败:', error)
    // 发生错误时回退到dashboard统计
    try {
      const dashRes = await getDashboardStats()
      if (dashRes.code === 0 && dashRes.data && dashRes.data.beds) {
        const { beds } = dashRes.data
        floors.value = [{
          id: 'total',
          floorName: '全部床位',
          totalBeds: beds.total || 0,
          occupiedBeds: beds.occupied || 0,
          availableBeds: beds.free || 0,
          occupancyRate: beds.occupancyRate || 0
        }]
      }
    } catch (e) {
      floors.value = []
    }
  } finally {
    floorsLoading.value = false
  }
}

// 📝 加载待办事项
const loadTodos = async () => {
  todosLoading.value = true
  try {
    // 后端状态: open (待处理) / done (已完成)
    const res = await getTodos({ status: 'open' })
    // 兼容不同的响应格式
    const data = res.data || res
    const items = data.items || data || []
    
    if (Array.isArray(items)) {
      todos.value = items.map(todo => ({
        id: todo.id,
        title: todo.title,
        deadline: todo.due_at || todo.dueDate,
        status: todo.status === 'done' ? 'completed' : 'pending',
        priority: todo.priority || 'medium'
      }))
    } else {
      todos.value = []
    }
  } catch (error) {
    console.error('加载待办事项失败:', error)
    todos.value = []
  } finally {
    todosLoading.value = false
  }
}

// 📣 加载机构公告
const loadNotices = async () => {
  noticesLoading.value = true
  try {
    const res = await getNotices({ status: 'published', page_size: 5 })
    if (res.code === 0 && res.data) {
      notices.value = (res.data.items || []).map(notice => ({
        id: notice.id,
        title: notice.title,
        publishTime: notice.publishedAt,
        summary: notice.content?.substring(0, 100) + (notice.content?.length > 100 ? '...' : ''),
        isPinned: notice.type === 'important'
      }))
    } else {
      notices.value = []
    }
  } catch (error) {
    console.error('加载公告失败:', error)
    notices.value = []
  } finally {
    noticesLoading.value = false
  }
}

// 初始化加载所有数据
const loadAllData = () => {
  loadAlerts()
  loadTasks()
  loadMetrics()
  loadFloors()
  loadTodos()
  loadNotices()
}

// 启动预警轮询
const startAlertsPolling = () => {
  // 每30秒轮询一次
  alertsInterval = setInterval(() => {
    loadAlerts()
  }, 30000)
}

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMinutes = Math.floor((now - date) / (1000 * 60))
  
  if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`
  } else if (diffMinutes < 24 * 60) {
    return `${Math.floor(diffMinutes / 60)}小时前`
  } else {
    return `${Math.floor(diffMinutes / (24 * 60))}天前`
  }
}

// 格式化日期时间
const formatDateTime = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).replace(/\//g, '-')
}

// 获取任务类型标签样式
const getTaskTypeTag = (type) => {
  const map = {
    '测血压': 'primary',
    '康复训练': 'success',
    '用药提醒': 'warning',
    '健康检查': 'info'
  }
  return map[type] || 'default'
}

// 获取状态标签样式
const getStatusTag = (status) => {
  const map = {
    'pending': 'info',
    'in_progress': 'warning',
    'completed': 'success',
    'overdue': 'danger'
  }
  return map[status] || 'default'
}

// 获取状态文本
const getStatusText = (status) => {
  const map = {
    'pending': '未开始',
    'in_progress': '进行中',
    'completed': '已完成',
    'overdue': '已逾期'
  }
  return map[status] || status
}

// 获取待办事项状态标签
const getTodoStatusTag = (status) => {
  const map = {
    'pending': 'warning',
    'overdue': 'danger',
    'completed': 'success'
  }
  return map[status] || 'default'
}

// 获取待办事项状态文本
const getTodoStatusText = (status) => {
  const map = {
    'pending': '待处理',
    'overdue': '已逾期',
    'completed': '已完成'
  }
  return map[status] || status
}

// 获取进度条颜色
const getProgressColor = (percentage) => {
  if (percentage >= 90) return '#f56c6c'
  if (percentage >= 70) return '#e6a23c'
  return '#67c23a'
}

// 表格行类名
const tableRowClassName = ({ row }) => {
  if (row.status === 'overdue') {
    return 'overdue-row'
  }
  return ''
}

// 跳转到老人详情
const goToElderlyDetail = (elderlyId) => {
  router.push(`/elderlies/${elderlyId}`)
}

// 跳转到楼层床位管理
const goToFloorBeds = (row) => {
  router.push(`/beds?floor=${row.floorName}`)
}

// 跳转到消息页面
const goToMessages = () => {
  router.push('/messages')
}

// 跳转到通知页面
const goToNotices = () => {
  router.push('/notices')
}

// 查看待办事项详情
const viewTodoDetail = (todoId) => {
  // 这里可以打开详情对话框或跳转到详情页
  console.log('查看待办事项详情:', todoId)
}

// 标记待办事项完成
const markTodoComplete = async (todoId) => {
  try {
    const res = await completeTodoApi(todoId)
    if (res.code === 0) {
      const index = todos.value.findIndex(todo => todo.id === todoId)
      if (index !== -1) {
        todos.value[index].status = 'completed'
      }
      ElMessage.success('待办事项已完成')
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch (error) {
    console.error('标记待办事项完成失败:', error)
    ElMessage.error('操作失败')
  }
}

// 查看公告详情
const viewNoticeDetail = (noticeId) => {
  // 这里可以打开详情对话框或跳转到详情页
  console.log('查看公告详情:', noticeId)
}

// 显示探视邀请对话框
const showVisitInvitationDialog = () => {
  visitDialogVisible.value = true
}

// 发送探视邀请
const sendVisitInvitation = () => {
  // 这里应该调用API发送邀请
  console.log('发送探视邀请:', visitForm.value)
  visitDialogVisible.value = false
  visitForm.value = {
    familyName: '',
    elderlyName: '',
    visitTime: '',
    remarks: ''
  }
  
  // 显示成功提示
  ElMessage.success('探视邀请发送成功')
}

// 导出护理报告
const exportCareReport = () => {
  // 这里应该调用API导出报告
  console.log('导出护理报告')
  ElMessage.info('正在生成报告，请稍候...')
}

// 生命周期钩子
onMounted(() => {
  loadAllData()
  startAlertsPolling()
})

onUnmounted(() => {
  if (alertsInterval) {
    clearInterval(alertsInterval)
  }
})
</script>

<style scoped>
.home-container {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

/* 通用样式 */
.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.section-icon {
  margin-right: 8px;
  color: #409eff;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

/* 🚨 模块1：实时安全预警栏 */
.alert-section {
  margin-bottom: 24px;
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.alert-content {
  min-height: 60px;
}

.empty-alerts {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: #67c23a;
}

.empty-alerts .el-icon {
  margin-right: 8px;
}

.alert-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.alert-item:hover {
  background: #f0f2f5;
}

.alert-text {
  flex: 1;
  margin: 0 12px;
  font-size: 14px;
  color: #606266;
}

.alert-time {
  font-size: 12px;
  color: #909399;
}

/* 📊 模块3：关键运营指标卡片 */
.metrics-section {
  margin-bottom: 24px;
}

.metric-card {
  border-radius: 8px;
  margin-bottom: 16px;
}

.metric-content {
  display: flex;
  align-items: center;
}

.metric-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  margin-right: 16px;
}

.metric-elderly .metric-icon {
  background: #ecf5ff;
  color: #409eff;
}

.metric-beds .metric-icon {
  background: #f0f9eb;
  color: #67c23a;
}

.metric-new .metric-icon {
  background: #fdf6ec;
  color: #e6a23c;
}

.metric-messages .metric-icon {
  background: #fef0f0;
  color: #f56c6c;
}

.metric-info {
  flex: 1;
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 4px;
}

.metric-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.metric-trend {
  display: flex;
  align-items: center;
  font-size: 12px;
}

.metric-trend.up {
  color: #f56c6c;
}

.metric-trend.down {
  color: #67c23a;
}

.metric-trend .el-icon {
  margin-right: 2px;
}

/* 👥 模块2：今日照护任务 & 🛏️ 模块4：床位使用概览 */
.main-content {
  margin-bottom: 24px;
}

.task-section,
.bed-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
}

.elderly-info {
  display: flex;
  flex-direction: column;
}

.elderly-name {
  font-weight: 500;
  color: #303133;
}

.room-number {
  font-size: 12px;
  color: #909399;
}

.progress-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.progress-text {
  font-size: 14px;
  color: #606266;
  min-width: 40px;
}

/* 📝 模块5：待办事项中心 & 📣 模块6：机构公告栏 */
.secondary-content {
  margin-bottom: 24px;
}

.todo-section,
.notice-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  height: 100%;
}

.todo-list {
  min-height: 200px;
}

.empty-todos {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.todo-item {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
}

.todo-item:last-child {
  border-bottom: none;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.todo-title {
  font-weight: 500;
  color: #303133;
  flex: 1;
}

.todo-body {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.todo-deadline {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: #909399;
}

.todo-deadline .el-icon {
  margin-right: 4px;
}

.todo-actions {
  display: flex;
  gap: 8px;
}

.notice-list {
  min-height: 200px;
}

.empty-notices {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notice-card {
  margin-bottom: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.notice-card:hover {
  transform: translateY(-2px);
}

.notice-card.pinned {
  border-left: 4px solid #f56c6c;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.notice-title {
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
}

.pin-icon {
  color: #f56c6c;
  margin-right: 4px;
}

.notice-time {
  font-size: 12px;
  color: #909399;
}

.notice-summary {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
}

/* 📱 模块7：家属服务快捷入口 */
.family-services-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.service-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.service-button {
  flex: 1;
  min-width: 200px;
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}

.service-button .el-icon {
  font-size: 24px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .home-container {
    padding: 16px;
  }
  
  .service-button {
    min-width: 100%;
  }
  
  .metric-card {
    margin-bottom: 12px;
  }
}

/* 表格行样式 */
:deep(.overdue-row) {
  background-color: #fef0f0;
}

:deep(.overdue-row:hover > td) {
  background-color: #fde2e2 !important;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 加载状态样式 */
:deep(.el-loading-mask) {
  border-radius: 8px;
}

/* 卡片悬停效果 */
.el-card {
  transition: all 0.3s ease;
}

.el-card:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.15) !important;
}

/* 按钮样式优化 */
.el-button {
  transition: all 0.2s ease;
}

.el-button:hover {
  transform: translateY(-1px);
}

/* 标签样式优化 */
.el-tag {
  transition: all 0.2s ease;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header) {
  background-color: #f5f7fa;
}

:deep(.el-table__row) {
  transition: background-color 0.2s ease;
}

:deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

/* 进度条样式优化 */
:deep(.el-progress-bar) {
  border-radius: 4px;
}

:deep(.el-progress-bar__inner) {
  border-radius: 4px;
}

/* 统计组件样式优化 */
:deep(.el-statistic__number) {
  font-weight: 600;
}

/* 下拉选择器样式优化 */
:deep(.el-select) {
  width: 100%;
}

/* 输入框样式优化 */
:deep(.el-input__inner) {
  border-radius: 6px;
}

/* 日期选择器样式优化 */
:deep(.el-date-editor) {
  width: 100%;
}

/* 文本域样式优化 */
:deep(.el-textarea__inner) {
  border-radius: 6px;
  resize: vertical;
}

/* 空状态样式优化 */
:deep(.el-empty__description) {
  color: #909399;
}

/* 图标样式优化 */
.el-icon {
  vertical-align: middle;
}

/* 移动端优化 */
@media (max-width: 576px) {
  .section-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .section-header h3 {
    font-size: 15px;
  }
  
  .alert-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .alert-text {
    margin: 0;
    width: 100%;
  }
  
  .alert-time {
    align-self: flex-end;
  }
  
  .metric-content {
    flex-direction: column;
    text-align: center;
  }
  
  .metric-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .todo-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .todo-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .notice-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .notice-time {
    align-self: flex-end;
  }
  
  .service-buttons {
    flex-direction: column;
  }
  
  .service-button {
    width: 100%;
  }
}

/* 平板端优化 */
@media (min-width: 577px) and (max-width: 992px) {
  .metric-content {
    flex-direction: column;
    text-align: center;
  }
  
  .metric-icon {
    margin-right: 0;
    margin-bottom: 12px;
  }
  
  .service-buttons {
    flex-wrap: wrap;
  }
  
  .service-button {
    min-width: calc(50% - 8px);
  }
}

/* 打印样式优化 */
@media print {
  .home-container {
    padding: 0;
    background: white;
  }
  
  .alert-section,
  .metrics-section,
  .task-section,
  .bed-section,
  .todo-section,
  .notice-section,
  .family-services-section {
    box-shadow: none;
    border: 1px solid #ddd;
    page-break-inside: avoid;
  }
  
  .service-buttons,
  .todo-actions,
  .el-select {
    display: none;
  }
}

/* 深色模式适配（如果启用） */
@media (prefers-color-scheme: dark) {
  .home-container {
    background-color: #1a1a1a;
  }
  
  .alert-section,
  .task-section,
  .bed-section,
  .todo-section,
  .notice-section,
  .family-services-section,
  .metric-card {
    background: #2d2d2d;
    color: #e0e0e0;
  }
  
  .section-header h3,
  .elderly-name,
  .todo-title,
  .notice-title {
    color: #e0e0e0;
  }
  
  .alert-item {
    background: #3d3d3d;
  }
  
  .alert-item:hover {
    background: #4d4d4d;
  }
  
  :deep(.el-table__header) {
    background-color: #3d3d3d;
  }
  
  :deep(.el-table__row:hover) {
    background-color: #3d3d3d;
  }
}

/* 无障碍优化 */
.alert-item:focus,
.notice-card:focus,
.service-button:focus {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

/* 高对比度模式优化 */
@media (prefers-contrast: high) {
  .alert-item,
  .todo-item,
  .notice-card {
    border: 1px solid #000;
  }
  
  .section-header {
    border-bottom: 2px solid #000;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-item,
.metric-card,
.todo-item,
.notice-card {
  animation: fadeIn 0.3s ease-out;
}

/* 延迟动画 */
.alert-item:nth-child(1) { animation-delay: 0.1s; }
.alert-item:nth-child(2) { animation-delay: 0.2s; }
.alert-item:nth-child(3) { animation-delay: 0.3s; }

.metric-card:nth-child(1) { animation-delay: 0.1s; }
.metric-card:nth-child(2) { animation-delay: 0.2s; }
.metric-card:nth-child(3) { animation-delay: 0.3s; }
.metric-card:nth-child(4) { animation-delay: 0.4s; }

/* 滚动条样式优化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 性能优化 */
.will-change {
  will-change: transform, opacity;
}

/* 打印时隐藏不需要的元素 */
@media print {
  .no-print {
    display: none !important;
  }
  
  .print-only {
    display: block !important;
  }
}
</style>