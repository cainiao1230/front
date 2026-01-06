<template>
  <div class="profile-view-page">
    <el-row :gutter="16">
      <!-- 左侧：个人信息 -->
      <el-col :span="8">
        <PageCard title="个人信息">
          <div class="profile-content">
            <div class="avatar-section">
              <el-avatar :size="120" :src="userInfo.avatar" />
              <el-button type="primary" size="small" style="margin-top: 16px" @click="uploadAvatar">
                修改头像
              </el-button>
            </div>

            <el-descriptions :column="1" border style="margin-top: 24px">
              <el-descriptions-item label="用户名">{{ userInfo.username }}</el-descriptions-item>
              <el-descriptions-item label="真实姓名">{{ userInfo.realName }}</el-descriptions-item>
              <el-descriptions-item label="角色">
                <StatusTag type="userRole" :value="userInfo.role" size="small" />
              </el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ userInfo.phone }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ userInfo.email }}</el-descriptions-item>
              <el-descriptions-item label="注册时间">{{ userInfo.created_at }}</el-descriptions-item>
              <el-descriptions-item label="最后登录">{{ userInfo.last_login }}</el-descriptions-item>
            </el-descriptions>
          </div>
        </PageCard>
      </el-col>

      <!-- 右侧：数据统计 -->
      <el-col :span="16">
        <!-- 统计卡片 -->
        <el-row :gutter="16">
          <el-col :span="8">
            <StatCard 
              title="今日任务" 
              :value="stats.todayTasks" 
              suffix="项"
              type="primary"
            />
          </el-col>
          <el-col :span="8">
            <StatCard 
              title="本月任务" 
              :value="stats.monthTasks" 
              suffix="项"
              type="success"
            />
          </el-col>
          <el-col :span="8">
            <StatCard 
              title="待办事项" 
              :value="stats.pendingTodos" 
              suffix="项"
              type="warning"
            />
          </el-col>
        </el-row>

        <!-- 最近活动 -->
        <PageCard title="最近活动" style="margin-top: 16px">
          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.time"
              placement="top"
              :type="activity.type"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
        </PageCard>

        <!-- 快捷操作 -->
        <PageCard title="快捷操作" style="margin-top: 16px">
          <el-row :gutter="16">
            <el-col :span="6">
              <el-button class="quick-btn" @click="$router.push('/elderly/add')">
                <el-icon :size="24"><Plus /></el-icon>
                <span>添加老人</span>
              </el-button>
            </el-col>
            <el-col :span="6">
              <el-button class="quick-btn" @click="$router.push('/bed/allocate')">
                <el-icon :size="24"><House /></el-icon>
                <span>分配床位</span>
              </el-button>
            </el-col>
            <el-col :span="6">
              <el-button class="quick-btn" @click="$router.push('/care/records')">
                <el-icon :size="24"><Document /></el-icon>
                <span>护理记录</span>
              </el-button>
            </el-col>
            <el-col :span="6">
              <el-button class="quick-btn" @click="$router.push('/tasks/today')">
                <el-icon :size="24"><Calendar /></el-icon>
                <span>今日任务</span>
              </el-button>
            </el-col>
          </el-row>
        </PageCard>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, House, Document, Calendar } from '@element-plus/icons-vue'
import { useUserInfo } from '@/composables/useUserInfo'

const { userInfo } = useUserInfo()

const stats = ref({
  todayTasks: 8,
  monthTasks: 156,
  pendingTodos: 5
})

const recentActivities = ref([
  { id: 1, time: '2024-01-20 14:30', content: '完成了护理任务：王大爷血压测量', type: 'success' },
  { id: 2, time: '2024-01-20 10:20', content: '添加了新老人：李奶奶', type: 'primary' },
  { id: 3, time: '2024-01-19 16:45', content: '分配了床位：201-A', type: 'info' },
  { id: 4, time: '2024-01-19 09:15', content: '更新了护理记录', type: 'warning' }
])

const uploadAvatar = () => {
  ElMessage.info('上传头像功能开发中')
}
</script>

<style scoped>
.profile-view-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.profile-content {
  padding: 24px 0;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
}

.quick-btn {
  width: 100%;
  height: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
}
</style>