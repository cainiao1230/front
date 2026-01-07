<template>
  <div class="elderly-search-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">快速查询老人</span>
          <el-tag type="info">支持姓名、电话、身份证号搜索</el-tag>
        </div>
      </template>

      <!-- 搜索框 -->
      <div class="search-box">
        <el-input
          v-model="keyword"
          placeholder="请输入老人姓名、电话或身份证号"
          clearable
          size="large"
          @keyup.enter="handleSearch"
          @clear="handleClear"
        >
          <template #prepend>
            <el-icon><Search /></el-icon>
          </template>
          <template #append>
            <el-button type="primary" @click="handleSearch">
              搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 搜索结果 -->
      <div v-loading="loading" class="search-results">
        <!-- 未搜索状态 -->
        <el-empty
          v-if="!hasSearched"
          description="请输入关键词开始搜索"
          :image-size="120"
        />

        <!-- 无结果状态 -->
        <el-empty
          v-else-if="results.length === 0"
          description="未找到相关老人信息"
          :image-size="120"
        />

        <!-- 搜索结果列表 -->
        <div v-else class="result-list">
          <el-card
            v-for="elderly in results"
            :key="elderly.id"
            shadow="hover"
            class="result-card"
            @click="viewDetail(elderly)"
          >
            <div class="elderly-info">
              <div class="avatar">
                <el-avatar :size="60" :icon="User">
                  {{ elderly.name.charAt(0) }}
                </el-avatar>
                <el-tag
                  :type="elderly.status === 'in' ? 'success' : 'info'"
                  size="small"
                  class="status-tag"
                >
                  {{ elderly.status === 'in' ? '在住' : '已退' }}
                </el-tag>
              </div>

              <div class="info-content">
                <div class="name-row">
                  <h3>{{ elderly.name }}</h3>
                  <el-tag
                    :type="getCareTypeColor(elderly.care_level)"
                    size="small"
                  >
                    {{ getCareTypeText(elderly.care_level) }}
                  </el-tag>
                </div>

                <el-descriptions :column="2" size="small" class="details">
                  <el-descriptions-item label="性别">
                    {{ elderly.gender === 'male' ? '男' : '女' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="年龄">
                    {{ calculateAge(elderly.birthday) }} 岁
                  </el-descriptions-item>
                  <el-descriptions-item label="床位">
                    床位 {{ elderly.bed_id || '未分配' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="电话">
                    {{ elderly.phone }}
                  </el-descriptions-item>
                  <el-descriptions-item label="紧急联系人">
                    {{ elderly.emergency_contact_name }}
                  </el-descriptions-item>
                  <el-descriptions-item label="联系人电话">
                    {{ elderly.emergency_contact_phone }}
                  </el-descriptions-item>
                  <el-descriptions-item label="入住日期" :span="2">
                    {{ elderly.admission_date }}
                  </el-descriptions-item>
                </el-descriptions>

                <div v-if="elderly.medical_history" class="medical-history">
                  <el-text type="warning" size="small">
                    <el-icon><Warning /></el-icon>
                    病史：{{ elderly.medical_history }}
                  </el-text>
                </div>
              </div>

              <div class="actions">
                <el-button type="primary" link @click.stop="viewDetail(elderly)">
                  查看详情
                </el-button>
                <el-button type="primary" link @click.stop="editElderly(elderly)">
                  编辑
                </el-button>
                <el-button type="info" link @click.stop="viewCareRecords(elderly)">
                  护理记录
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, User, Warning } from '@element-plus/icons-vue'
import { searchElderly } from '@/api'

const router = useRouter()
const keyword = ref('')
const loading = ref(false)
const hasSearched = ref(false)
const results = ref([])

// 搜索
const handleSearch = async () => {
  if (!keyword.value.trim()) {
    ElMessage.warning('请输入搜索关键词')
    return
  }

  loading.value = true
  hasSearched.value = true

  try {
    const response = await searchElderly(keyword.value.trim())
    const data = response?.data ?? response ?? []
    results.value = data.items || data.list || data || []
    
    if (results.value.length === 0) {
      ElMessage.info('未找到相关老人信息')
    }
  } catch (error) {
    ElMessage.error('搜索失败')
    results.value = []
  } finally {
    loading.value = false
  }
}

// 清空
const handleClear = () => {
  results.value = []
  hasSearched.value = false
}

// 护理等级文本
const getCareTypeText = (level) => {
  const map = {
    'self_care': '自理',
    'semi_care': '半护理',
    'full_care': '全护理'
  }
  return map[level] || level
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

// 查看详情
const viewDetail = (elderly) => {
  router.push(`/elderly/detail/${elderly.id}`)
}

// 编辑
const editElderly = (elderly) => {
  router.push(`/elderly/edit/${elderly.id}`)
}

// 查看护理记录
const viewCareRecords = (elderly) => {
  router.push(`/care/records?elderly_id=${elderly.id}`)
}
</script>

<style scoped>
.elderly-search-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.search-box {
  margin-bottom: 24px;
}

.search-results {
  min-height: 400px;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-card {
  cursor: pointer;
  transition: all 0.3s;
}

.result-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.elderly-info {
  display: flex;
  gap: 20px;
}

.avatar {
  position: relative;
  flex-shrink: 0;
}

.status-tag {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.info-content {
  flex: 1;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.name-row h3 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.details {
  margin-bottom: 12px;
}

.medical-history {
  padding: 8px 12px;
  background-color: #fef0f0;
  border-radius: 4px;
  border-left: 3px solid #f56c6c;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-shrink: 0;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
}
</style>