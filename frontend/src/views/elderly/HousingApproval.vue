<template>
  <div class="housing-approval-page">
    <PageCard title="住房申请审批">
      <template #actions>
        <el-button :icon="Refresh" @click="refresh">刷新</el-button>
      </template>

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
      </SearchForm>

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
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column label="性别" width="90">
          <template #default="{ row }">
            {{ row.gender === 'male' ? '男' : '女' }}
          </template>
        </el-table-column>
        <el-table-column label="年龄" width="90">
          <template #default="{ row }">{{ getAge(row.birthday) }}</template>
        </el-table-column>
        <el-table-column label="护理等级" width="120">
          <template #default="{ row }">
            <el-tag :type="getCareLevelColor(row.care_level)">{{ getCareLevelText(row.care_level) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150" />
        <el-table-column label="紧急联系人" width="180">
          <template #default="{ row }">
            <div class="contact-cell">
              <span>{{ row.emergency_contact_name }}</span>
              <span class="contact-phone">{{ row.emergency_contact_phone }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" width="180">
          <template #default="{ row }">{{ formatDateTime(row.applied_at || row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="审批信息" width="220">
          <template #default="{ row }">
            <div class="approval-meta">
              <span v-if="row.approved_at" class="meta-item">已通过：{{ formatDateTime(row.approved_at) }}（{{ row.approved_by || '—' }}）</span>
              <span v-else-if="row.rejected_at" class="meta-item danger">
                已驳回：{{ formatDateTime(row.rejected_at) }}
                <span v-if="row.rejection_reason">，原因：{{ row.rejection_reason }}</span>
              </span>
              <span v-else class="meta-item">待处理</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="备注">
          <template #default="{ row }">{{ row.medical_history || '—' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleApprove(row)">通过</el-button>
            <el-button type="danger" size="small" @click="handleReject(row)">驳回</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </PageCard>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { getElderlyList, approveHousingApplication, rejectHousingApplication } from '@/api'
import { useTable } from '@/composables/useTable'

const fetchPendingApplications = (params) => {
  return getElderlyList({ ...params, status: 'pending' })
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
    care_level: ''
  })
  loadData()
})

const resetFilters = () => {
  searchForm.name = ''
  searchForm.phone = ''
  searchForm.care_level = ''
  pagination.page = 1
  loadData()
}

const refresh = () => {
  loadData()
}

const handleApprove = async (row) => {
  try {
    await ElMessageBox.confirm(`确认通过 ${row.name} 的住房申请吗？`, '审批通过', { type: 'success' })
    await approveHousingApplication(row.id)
    ElMessage.success('审批通过')
    loadData()
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
  padding: 16px;
}

.contact-cell {
  display: flex;
  flex-direction: column;
}

.contact-phone {
  color: #606266;
  font-size: 12px;
}

.approval-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: #606266;
  font-size: 12px;
}

.approval-meta .meta-item.danger {
  color: #f56c6c;
}
</style>
