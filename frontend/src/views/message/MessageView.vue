<template>
  <div class="message-view-page">
    <PageCard title="消息中心">
      <template #actions>
        <el-badge :value="unreadCount" :hidden="unreadCount === 0" class="badge-item">
          <el-button @click="markAllAsRead">
            <el-icon><View /></el-icon> 全部标记已读
          </el-button>
        </el-badge>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部消息" name="all" />
        <el-tab-pane name="unread">
          <template #label>
            未读消息
            <el-badge v-if="unreadCount > 0" :value="unreadCount" class="tab-badge" />
          </template>
        </el-tab-pane>
        <el-tab-pane label="任务通知" name="task" />
        <el-tab-pane label="系统通知" name="notification" />
        <el-tab-pane label="紧急消息" name="urgent" />
      </el-tabs>

      <div v-loading="loading" class="message-list">
        <div
          v-for="message in messages"
          :key="message.id"
          class="message-item"
          :class="{ 'unread': message.status === 'unread' }"
          @click="handleMessageClick(message)"
        >
          <div class="message-icon">
            <el-icon :size="24" :color="getIconColor(message.type)">
              <component :is="getIcon(message.type)" />
            </el-icon>
          </div>
          <div class="message-content">
            <div class="message-header">
              <span class="message-title">{{ message.title }}</span>
              <el-tag v-if="message.type === 'urgent'" type="danger" size="small">紧急</el-tag>
              <span class="message-time">{{ formatRelativeTime(message.created_at) }}</span>
            </div>
            <div class="message-body">{{ message.content }}</div>
            <div class="message-footer">
              <span class="message-from">来自：{{ message.from_user_name }}</span>
            </div>
          </div>
          <div class="message-actions">
            <el-button v-if="message.status === 'unread'" type="primary" size="small" link @click.stop="markAsRead(message)">
              标记已读
            </el-button>
            <el-button type="danger" size="small" link @click.stop="deleteMessage(message)">
              删除
            </el-button>
          </div>
        </div>

        <el-empty v-if="messages.length === 0" description="暂无消息" />
      </div>

      <el-pagination
        v-if="total > 0"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadMessages"
        style="margin-top: 20px; justify-content: center"
      />
    </PageCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Bell, ChatLineSquare, Warning } from '@element-plus/icons-vue'
import { getMessages, markMessageAsRead, markAllMessagesAsRead, deleteMessage as deleteMessageApi, getUnreadCount } from '@/api'
import { formatRelativeTime } from '@/utils/format'

const loading = ref(false)
const messages = ref([])
const total = ref(0)
const activeTab = ref('all')
const unreadCount = ref(0)

const pagination = {
  page: ref(1),
  page_size: ref(10)
}

const getIcon = (type) => {
  const iconMap = {
    'task': Bell,
    'notification': ChatLineSquare,
    'urgent': Warning
  }
  return iconMap[type] || Bell
}

const getIconColor = (type) => {
  const colorMap = {
    'task': '#409eff',
    'notification': '#67c23a',
    'urgent': '#f56c6c'
  }
  return colorMap[type] || '#909399'
}

const loadMessages = async () => {
  loading.value = true
  try {
    const params = {
      type: activeTab.value === 'all' ? null : activeTab.value,
      status: activeTab.value === 'unread' ? 'unread' : null,
      page: pagination.page.value,
      page_size: pagination.page_size.value
    }
    const response = await getMessages(params)
    messages.value = response.data.items || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载消息失败')
  } finally {
    loading.value = false
  }
}

const loadUnreadCount = async () => {
  try {
    const response = await getUnreadCount()
    unreadCount.value = response.data.count || 0
  } catch (error) {
    console.error('获取未读数量失败')
  }
}

const handleTabChange = () => {
  pagination.page.value = 1
  loadMessages()
}

const handleMessageClick = async (message) => {
  if (message.status === 'unread') {
    await markAsRead(message)
  }
}

const markAsRead = async (message) => {
  try {
    await markMessageAsRead(message.id)
    message.status = 'read'
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    ElMessage.success('已标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const markAllAsRead = async () => {
  try {
    await markAllMessagesAsRead()
    messages.value.forEach(msg => {
      msg.status = 'read'
    })
    unreadCount.value = 0
    ElMessage.success('全部已标记为已读')
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const deleteMessage = async (message) => {
  try {
    await ElMessageBox.confirm('确认删除该消息吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteMessageApi(message.id)
    ElMessage.success('消息已删除')
    loadMessages()
    loadUnreadCount()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadMessages()
  loadUnreadCount()
})
</script>

<style scoped>
.message-view-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.badge-item {
  margin-right: 16px;
}

.tab-badge {
  margin-left: 8px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;
}

.message-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.message-item.unread {
  background: #ecf5ff;
  border-color: #b3d8ff;
}

.message-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.message-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.message-time {
  font-size: 13px;
  color: #909399;
  margin-left: auto;
}

.message-body {
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 8px;
}

.message-footer {
  font-size: 13px;
  color: #909399;
}

.message-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>