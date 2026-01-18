<template>
  <div class="housing-approval-page">
    <PageCard title="住房申请审批">

      <SearchForm v-model="searchForm" @search="handleSearch" @reset="resetFilters">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="输入姓名" clearable />
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="searchForm.phone" placeholder="输入联系电话" clearable />
        </el-form-item>
        <el-form-item label="护理等级">
          <el-select v-model="searchForm.care_level" placeholder="选择护理等级" clearable style="width: 150px">
            <el-option label="自理" value="self_care" />
            <el-option label="半护理" value="semi_care" />
            <el-option label="全护理" value="full_care" />
          </el-select>
        </el-form-item>
        <el-form-item label="审批状态">
          <el-select v-model="searchForm.approval_status" placeholder="选择状态" clearable style="width: 120px">
            <el-option label="待处理" value="pending" />
            <el-option label="已入住" value="in" />
            <el-option label="已退住" value="out" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <!-- 统计卡片 -->
      <div class="stats-row">
        <div class="stat-card pending" @click="filterByStatus('pending')">
          <div class="stat-number">{{ stats.pending }}</div>
          <div class="stat-label">待处理</div>
        </div>
        <div class="stat-card approved" @click="filterByStatus('in')">
          <div class="stat-number">{{ stats.in }}</div>
          <div class="stat-label">已入住</div>
        </div>
        <div class="stat-card rejected" @click="filterByStatus('out')">
          <div class="stat-number">{{ stats.out }}</div>
          <div class="stat-label">已退住</div>
        </div>
      </div>

      <DataTable
        :data="tableData"
        :loading="loading"
        :total="total"
        :page="pagination.page"
        :page-size="pagination.page_size"
        @update:page="pagination.page = $event"
        @update:pageSize="pagination.page_size = $event"
        @change="loadData"
      >
        <el-table-column prop="name" label="姓名" width="100">
          <template #default="{ row }">
            <span class="name-link" @click="viewDetail(row)">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="70">
          <template #default="{ row }">
            {{ row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column label="年龄" width="70">
          <template #default="{ row }">{{ row.age || getAge(row.birthday) }}</template>
        </el-table-column>
        <el-table-column label="护理等级" width="100">
          <template #default="{ row }">
            <el-tag :type="getCareLevelColor(row.care_level)" size="small">{{ getCareLevelText(row.care_level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="联系电话" width="130">
          <template #default="{ row }">{{ row.phone || '—' }}</template>
        </el-table-column>
        <el-table-column label="紧急联系人" width="160">
          <template #default="{ row }">
            <div class="contact-cell">
              <span>{{ row.emergency_contact_name || '—' }}</span>
              <span class="contact-phone">{{ row.emergency_contact_phone }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="150">
          <template #default="{ row }">{{ formatDateTime(row.applied_at || row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="审批状态" width="160">
          <template #default="{ row }">
            <div class="approval-status">
              <el-tag v-if="getApprovalStatus(row) === 'approved'" type="success" size="small">
                <el-icon><Check /></el-icon> 已入住
              </el-tag>
              <el-tag v-else-if="getApprovalStatus(row) === 'out'" type="info" size="small">
                <el-icon><Close /></el-icon> 已退住
              </el-tag>
              <el-tag v-else type="warning" size="small">
                <el-icon><Clock /></el-icon> 待处理
              </el-tag>
              <div v-if="row.approved_at" class="status-time">{{ formatDateTime(row.approved_at) }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <template v-if="getApprovalStatus(row) === 'pending'">
              <el-button type="primary" size="small" @click="handleApprove(row)">
                <el-icon><Check /></el-icon> 通过
              </el-button>
              <el-button type="danger" size="small" @click="handleReject(row)">
                <el-icon><Close /></el-icon> 驳回
              </el-button>
            </template>
            <template v-else>
              <el-button size="small" @click="viewDetail(row)">
                <el-icon><View /></el-icon> 查看
              </el-button>
              <el-button v-if="getApprovalStatus(row) === 'approved'" type="success" size="small" @click="allocateBed(row)">
                <el-icon><House /></el-icon> 分配床位
              </el-button>
            </template>
          </template>
        </el-table-column>
      </DataTable>
    </PageCard>

    <!-- 详情弹窗 -->
    <el-dialog v-model="detailVisible" title="申请详情" width="600px">
      <div v-if="currentRow" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="姓名">{{ currentRow.name }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ currentRow.gender === 'male' ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ currentRow.age || getAge(currentRow.birthday) }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ currentRow.id_number || '—' }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ currentRow.phone || '—' }}</el-descriptions-item>
          <el-descriptions-item label="护理等级">
            <el-tag :type="getCareLevelColor(currentRow.care_level)" size="small">{{ getCareLevelText(currentRow.care_level) }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="紧急联系人" :span="2">
            {{ currentRow.emergency_contact_name || '—' }}
            <span v-if="currentRow.relationship">（{{ currentRow.relationship }}）</span>
            {{ currentRow.emergency_contact_phone ? `电话: ${currentRow.emergency_contact_phone}` : '' }}
          </el-descriptions-item>
          <el-descriptions-item label="申请时间" :span="2">{{ formatDateTime(currentRow.applied_at || currentRow.created_at) }}</el-descriptions-item>
          <el-descriptions-item label="健康状况" :span="2">{{ currentRow.health_condition || '—' }}</el-descriptions-item>
          <el-descriptions-item label="病史" :span="2">{{ currentRow.medical_history || '—' }}</el-descriptions-item>
          <el-descriptions-item label="过敏史" :span="2">{{ currentRow.allergies || '—' }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ currentRow.notes || '—' }}</el-descriptions-item>
        </el-descriptions>
        
        <div v-if="getApprovalStatus(currentRow) === 'out'" class="rejection-info">
          <el-alert type="info" :closable="false">
            <template #title>
              <strong>已退住</strong>
            </template>
          </el-alert>
        </div>
      </div>
      <template #footer>
        <template v-if="currentRow && getApprovalStatus(currentRow) === 'pending'">
          <el-button @click="detailVisible = false">取消</el-button>
          <el-button type="danger" @click="handleReject(currentRow); detailVisible = false">驳回</el-button>
          <el-button type="primary" @click="handleApprove(currentRow); detailVisible = false">通过</el-button>
        </template>
        <el-button v-else @click="detailVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Close, Clock, View, House } from '@element-plus/icons-vue'
import { getElderlyList, approveHousingApplication, rejectHousingApplication } from '@/api'
import { useTable } from '@/composables/useTable'

const router = useRouter()

// 详情弹窗
const detailVisible = ref(false)
const currentRow = ref(null)

// 统计数据
const stats = reactive({
  pending: 0,
  in: 0,
  out: 0
})

const fetchPendingApplications = (params) => {
  // 根据选择的状态筛选
  const queryParams = { ...params }
  if (!queryParams.approval_status) {
    queryParams.status = 'pending' // 默认显示待处理
  } else {
    queryParams.status = queryParams.approval_status
    delete queryParams.approval_status
  }
  return getElderlyList(queryParams)
}

const {
  loading,
  tableData,
  total,
  pagination,
  searchForm,
  loadData,
  handleSearch
} = useTable(fetchPendingApplications, { immediate: false })

onMounted(() => {
  Object.assign(searchForm, {
    name: '',
    phone: '',
    care_level: '',
    approval_status: '' // 默认显示全部，或设置为 'pending' 只显示待处理
  })
  loadData()
  loadStats()
})

// 加载统计数据
const loadStats = async () => {
  try {
    // 分别获取各状态的数量（使用后端枚举值: pending, in, out）
    const [pendingRes, inRes, outRes] = await Promise.all([
      getElderlyList({ status: 'pending', page: 1, page_size: 1 }),
      getElderlyList({ status: 'in', page: 1, page_size: 1 }),
      getElderlyList({ status: 'out', page: 1, page_size: 1 })
    ])
    stats.pending = pendingRes.data?.total || pendingRes.total || 0
    stats.in = inRes.data?.total || inRes.total || 0
    stats.out = outRes.data?.total || outRes.total || 0
  } catch (e) {
    console.warn('加载统计数据失败', e)
  }
}

// 点击统计卡片筛选
const filterByStatus = (status) => {
  searchForm.approval_status = status
  pagination.page = 1
  loadData()
}

const resetFilters = () => {
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.care_level = ''
  searchForm.approval_status = ''
  pagination.page = 1
  loadData()
}

// 获取审批状态
const getApprovalStatus = (row) => {
  // 后端 status 枚举: pending=待审批, in=已入住, out=已退住
  if (row.status === 'in') return 'approved'
  if (row.status === 'out') return 'out'
  return 'pending'
}

// 查看详情
const viewDetail = (row) => {
  currentRow.value = row
  detailVisible.value = true
}

// 分配床位
const allocateBed = (row) => {
  router.push(`/home/bed/allocate?elderly_id=${row.id}&name=${encodeURIComponent(row.name)}`)
}

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确认通过 ${row.name} 的住房申请吗？`, '审批通过', { type: 'success' })
    await approveHousingApplication(row.id)
    ElMessage.success('审批通过')
    loadData()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请重试')
    }
  }
}

const handleReject = async (row) => {
  try {
    const { value, action } = await ElMessageBox.prompt(`请输入驳回 ${row.name} 的原因`, '驳回申请', {
      inputPlaceholder: '填写驳回原因',
      inputValidator: (val) => !!val || '请填写驳回原因',
      confirmButtonText: '驳回',
      cancelButtonText: '取消'
    })
    if (action !== 'confirm') return
    await rejectHousingApplication(row.id, value)
    ElMessage.success('已驳回该申请')
    loadData()
    loadStats()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败，请重试')
    }
  }
}

const getCareLevelText = (level) => {
  const map = { self_care: '自理', semi_care: '半护理', full_care: '全护理' }
  return map[level] || '—'
}

const getCareLevelColor = (level) => {
  const map = { self_care: 'success', semi_care: 'warning', full_care: 'danger' }
  return map[level] || ''
}

const getAge = (birthday) => {
  if (!birthday) return '—'
  const birth = new Date(birthday)
  if (Number.isNaN(birth.getTime())) return '—'
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age -= 1
  }
  return age
}

const formatDateTime = (val) => {
  if (!val) return '—'
  return val.replace('T', ' ').slice(0, 16)
}
</script>

<style scoped>
.housing-approval-page {
  padding: 20px;
  min-height: calc(100vh - 60px);
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);
}

/* 统计卡片 */
.stats-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  padding: 20px 28px;
  border-radius: 12px;
  text-align: center;
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.stat-card.pending {
  background: linear-gradient(135deg, #e6a23c 0%, #f5b461 100%);
}

.stat-card.approved {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.stat-card.rejected {
  background: linear-gradient(135deg, #f56c6c 0%, #f89898 100%);
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-label {
  font-size: 14px;
  opacity: 0.95;
  margin-top: 6px;
  letter-spacing: 1px;
}

/* 姓名链接 */
.name-link {
  color: #409eff;
  cursor: pointer;
  font-weight: 500;
}

.name-link:hover {
  text-decoration: underline;
  color: #66b1ff;
}

/* 联系人信息 */
.contact-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contact-phone {
  color: #909399;
  font-size: 12px;
}

/* 审批状态 */
.approval-status {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.approval-status .el-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-time {
  font-size: 12px;
  color: #909399;
}

/* 详情弹窗 */
.detail-content {
  padding: 0 16px;
}

.detail-content :deep(.el-descriptions) {
  background: #fff;
}

.detail-content :deep(.el-descriptions__label) {
  background: #f5f7fa;
  font-weight: 500;
  color: #606266;
}

.detail-content :deep(.el-descriptions__content) {
  color: #303133;
}

.rejection-info {
  margin-top: 16px;
}

/* 操作按钮 */
:deep(.el-button) {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
  color: #303133;
  font-weight: 600;
}

:deep(.el-table tr:hover > td) {
  background-color: #ecf5ff !important;
}

/* 卡片样式优化 */
:deep(.page-card) {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

:deep(.el-card) {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

:deep(.el-card__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  border-radius: 12px 12px 0 0;
  padding: 16px 20px;
}

:deep(.el-card__header .el-button) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  color: #fff;
}

:deep(.el-card__header .el-button:hover) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

/* 搜索表单美化 */
:deep(.search-form) {
  background: #fff;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

/* 分页美化 */
:deep(.el-pagination) {
  padding: 16px 0;
  justify-content: flex-end;
}

/* 弹窗美化 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  margin-right: 0;
  padding: 16px 20px;
}

:deep(.el-dialog__title) {
  color: #fff;
  font-weight: 600;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #fff;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
}
</style>
