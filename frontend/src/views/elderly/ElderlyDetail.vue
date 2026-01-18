<template>
  <div class="elderly-detail-page">
    <el-card shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
            <span class="title">老人详情</span>
          </div>
          <div class="header-right">
            <el-button type="primary" @click="handleEdit">
              <el-icon><Edit /></el-icon> 编辑信息
            </el-button>
            <el-button @click="viewCareRecords">
              <el-icon><Document /></el-icon> 护理记录
            </el-button>
          </div>
        </div>
      </template>

      <div v-if="elderly" class="detail-content">
        <!-- 基本信息 -->
        <div class="info-section">
          <div class="section-header">
            <el-icon><User /></el-icon>
            <h3>基本信息</h3>
          </div>
          <div class="profile-card">
            <el-avatar :size="100" :icon="User" class="profile-avatar">
              {{ elderly.name?.charAt(0) }}
            </el-avatar>
            <div class="profile-info">
              <h2>{{ elderly.name }}</h2>
              <div class="tags">
                <el-tag :type="elderly.status === 'in' ? 'success' : 'info'" size="large">
                  {{ elderly.status === 'in' ? '在住' : elderly.status === 'pending' ? '待审核' : '已退' }}
                </el-tag>
                <el-tag :type="getCareTypeColor(elderly.care_level)" size="large">
                  {{ getCareTypeText(elderly.care_level) }}
                </el-tag>
              </div>
            </div>
          </div>

          <el-descriptions :column="3" border class="info-descriptions">
            <el-descriptions-item label="性别">
              {{ elderly.gender === 'male' ? '男' : '女' }}
            </el-descriptions-item>
            <el-descriptions-item label="年龄">
              {{ calculateAge(elderly.birthday) }} 岁
            </el-descriptions-item>
            <el-descriptions-item label="出生日期">
              {{ formatDate(elderly.birthday) }}
            </el-descriptions-item>
            <el-descriptions-item label="身份证号">
              {{ elderly.id_number || '未填写' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ elderly.phone || '未填写' }}
            </el-descriptions-item>
            <el-descriptions-item label="床位">
              {{ elderly.bed_id ? `床位 ${elderly.bed_id}` : '未分配' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 紧急联系人 -->
        <div class="info-section">
          <div class="section-header">
            <el-icon><Phone /></el-icon>
            <h3>紧急联系人</h3>
          </div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="联系人姓名">
              {{ elderly.emergency_contact_name || '未填写' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ elderly.emergency_contact_phone || '未填写' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 健康信息 -->
        <div class="info-section">
          <div class="section-header">
            <el-icon><FirstAidKit /></el-icon>
            <h3>健康信息</h3>
          </div>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="病史">
              {{ elderly.medical_history || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="过敏史">
              {{ elderly.allergies || '无' }}
            </el-descriptions-item>
            <el-descriptions-item label="备注">
              {{ elderly.notes || '无' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 入住信息 -->
        <div class="info-section">
          <div class="section-header">
            <el-icon><Calendar /></el-icon>
            <h3>入住信息</h3>
          </div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请日期">
              {{ formatDateTime(elderly.applied_at || elderly.created_at) }}
            </el-descriptions-item>
            <el-descriptions-item label="入住日期">
              {{ formatDateTime(elderly.admission_date) || '未入住' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </div>

      <el-empty v-else description="未找到老人信息" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Edit, Document, User, Phone, FirstAidKit, Calendar } from '@element-plus/icons-vue'
import { getElderlyDetail } from '@/api'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const elderly = ref(null)

// 加载老人详情
const loadElderlyDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('缺少老人ID')
    return
  }

  loading.value = true
  try {
    const res = await getElderlyDetail(id)
    const data = res.data || res
    elderly.value = data
  } catch (error) {
    console.error('加载老人详情失败:', error)
    ElMessage.error('加载老人详情失败')
  } finally {
    loading.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 编辑
const handleEdit = () => {
  router.push(`/home/elderly/edit/${elderly.value.id}`)
}

// 查看护理记录
const viewCareRecords = () => {
  router.push(`/home/care/records?elderly_id=${elderly.value.id}`)
}

// 护理等级文本
const getCareTypeText = (level) => {
  const map = {
    'self_care': '自理',
    'semi_care': '半护理',
    'full_care': '全护理'
  }
  return map[level] || level || '未设置'
}

// 护理等级颜色
const getCareTypeColor = (level) => {
  const map = {
    'self_care': 'success',
    'semi_care': 'warning',
    'full_care': 'danger'
  }
  return map[level] || ''
}

// 计算年龄
const calculateAge = (birthday) => {
  if (!birthday) return 0
  const birth = new Date(birthday)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

// 格式化日期时间
const formatDateTime = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

onMounted(() => {
  loadElderlyDetail()
})
</script>

<style scoped>
.elderly-detail-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section {
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.profile-card {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: 20px;
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.profile-avatar {
  background: linear-gradient(135deg, #409eff 0%, #67c23a 100%);
  font-size: 36px;
  font-weight: 600;
}

.profile-info h2 {
  margin: 0 0 12px 0;
  font-size: 24px;
}

.tags {
  display: flex;
  gap: 8px;
}

.info-descriptions {
  background: white;
}
</style>
