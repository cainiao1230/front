<template>
  <div class="notice-view-page">
    <PageCard title="公告通知">
      <template #actions>
        <el-button v-if="isAdmin" type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon> 发布公告
        </el-button>
      </template>

      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="全部公告" name="all" />
        <el-tab-pane label="系统通知" name="system" />
        <el-tab-pane label="活动通知" name="activity" />
        <el-tab-pane label="紧急通知" name="urgent" />
      </el-tabs>

      <div v-loading="loading" class="notice-list">
        <div
          v-for="notice in notices"
          :key="notice.id"
          class="notice-item"
          @click="handleNoticeClick(notice)"
        >
          <div class="notice-header">
            <div class="notice-title-area">
              <el-icon v-if="notice.is_pinned" class="pin-icon" :size="16" color="#f56c6c">
                <Star />
              </el-icon>
              <span class="notice-title">{{ notice.title }}</span>
              <el-tag v-if="notice.type === 'urgent'" type="danger" size="small">紧急</el-tag>
              <el-tag v-else-if="notice.type === 'activity'" type="success" size="small">活动</el-tag>
              <el-tag v-else type="info" size="small">通知</el-tag>
            </div>
            <div class="notice-meta">
              <span class="notice-author">{{ notice.author_name }}</span>
              <span class="notice-time">{{ formatRelativeTime(notice.created_at) }}</span>
            </div>
          </div>
          <div class="notice-content">{{ notice.content }}</div>
          <div class="notice-footer">
            <span class="notice-views">
              <el-icon><View /></el-icon> {{ notice.views }}
            </span>
            <div class="notice-actions" v-if="isAdmin">
              <el-button size="small" link @click.stop="editNotice(notice)">编辑</el-button>
              <el-button type="danger" size="small" link @click.stop="deleteNotice(notice)">删除</el-button>
            </div>
          </div>
        </div>

        <el-empty v-if="notices.length === 0" description="暂无公告" />
      </div>

      <el-pagination
        v-if="total > 0"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadNotices"
        style="margin-top: 20px; justify-content: center"
      />
    </PageCard>

    <!-- 公告详情对话框 -->
    <el-dialog v-model="detailVisible" :title="currentNotice?.title" width="60%" @close="handleDialogClose">
      <div class="notice-detail">
        <div class="notice-detail-meta">
          <span>发布人：{{ currentNotice?.author_name }}</span>
          <span>发布时间：{{ formatDate(currentNotice?.created_at) }}</span>
          <span>阅读次数：{{ currentNotice?.views }}</span>
        </div>
        <el-divider />
        <div class="notice-detail-content" v-html="currentNotice?.content"></div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Star, View } from '@element-plus/icons-vue'
import { getNotices, deleteNotice as deleteNoticeApi } from '@/api'
import { useUserInfo } from '@/composables/useUserInfo'
import { formatRelativeTime, formatDate } from '@/utils/format'

const { isAdmin } = useUserInfo()

const loading = ref(false)
const notices = ref([])
const total = ref(0)
const activeTab = ref('all')
const detailVisible = ref(false)
const currentNotice = ref(null)

const pagination = {
  page: ref(1),
  page_size: ref(10)
}

const loadNotices = async () => {
  loading.value = true
  try {
    const params = {
      type: activeTab.value === 'all' ? null : activeTab.value,
      page: pagination.page.value,
      page_size: pagination.page_size.value
    }
    const response = await getNotices(params)
    notices.value = response.data.items || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载公告失败')
  } finally {
    loading.value = false
  }
}

const handleTabChange = () => {
  pagination.page.value = 1
  loadNotices()
}

const handleNoticeClick = (notice) => {
  currentNotice.value = notice
  detailVisible.value = true
  // 增加阅读数
  notice.views = (notice.views || 0) + 1
}

const handleDialogClose = () => {
  currentNotice.value = null
}

const showAddDialog = () => {
  ElMessage.info('发布功能开发中')
}

const editNotice = (notice) => {
  ElMessage.info('编辑功能开发中')
}

const deleteNotice = async (notice) => {
  try {
    await ElMessageBox.confirm('确认删除该公告吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteNoticeApi(notice.id)
    ElMessage.success('公告已删除')
    loadNotices()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

onMounted(() => {
  loadNotices()
})
</script>

<style scoped>
.notice-view-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.notice-item {
  padding: 20px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;
}

.notice-item:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.notice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.notice-title-area {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pin-icon {
  flex-shrink: 0;
}

.notice-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.notice-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 13px;
  color: #909399;
}

.notice-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.notice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.notice-views {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #909399;
}

.notice-actions {
  display: flex;
  gap: 8px;
}

.notice-detail-meta {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #606266;
}

.notice-detail-content {
  font-size: 15px;
  line-height: 2;
  color: #303133;
}
</style>