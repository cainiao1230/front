<template>
  <div class="care-medication-page">
    <PageCard title="用药管理">
      <template #actions>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon> 添加用药记录
        </el-button>
      </template>

      <SearchForm v-model="searchForm" @search="handleSearch" @reset="handleReset">
        <el-form-item label="老人">
          <el-select v-model="searchForm.elderly_id" placeholder="选择老人" clearable filterable style="width: 180px">
            <el-option v-for="e in elderlyList" :key="e.id" :label="e.name" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="用药时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
          />
        </el-form-item>
      </SearchForm>

      <DataTable 
        :data="tableData" 
        :loading="loading"
        :total="total"
        v-model:page="pagination.page"
        v-model:page-size="pagination.page_size"
        @change="loadData"
      >
        <el-table-column prop="elderly_name" label="老人姓名" width="120" />
        <el-table-column prop="medicine_name" label="药品名称" width="150" />
        <el-table-column prop="dosage" label="剂量" width="120" />
        <el-table-column prop="frequency" label="频率" width="150" />
        <el-table-column prop="medication_time" label="用药时间" width="180" />
        <el-table-column label="是否已服用" width="120">
          <template #default="{ row }">
            <el-tag :type="row.taken ? 'success' : 'warning'" size="small">
              {{ row.taken ? '已服用' : '未服用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="administered_by" label="给药人" width="120" />
        <el-table-column prop="notes" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button v-if="!row.taken" type="success" size="small" link @click="markAsTaken(row)">
              标记已服用
            </el-button>
            <el-button size="small" link @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </PageCard>

    <!-- 用药提醒 -->
    <PageCard title="用药提醒" style="margin-top: 16px">
      <el-timeline>
        <el-timeline-item
          v-for="reminder in upcomingReminders"
          :key="reminder.id"
          :timestamp="reminder.medication_time"
          placement="top"
          :type="getReminderType(reminder)"
        >
          <el-card>
            <div class="reminder-item">
              <div>
                <span class="reminder-elderly">{{ reminder.elderly_name }}</span>
                <span class="reminder-medicine">{{ reminder.medicine_name }}</span>
                <el-tag type="info" size="small">{{ reminder.dosage }}</el-tag>
              </div>
              <el-button type="primary" size="small" @click="markAsTaken(reminder)">
                确认服用
              </el-button>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-if="upcomingReminders.length === 0" description="暂无近期用药提醒" />
    </PageCard>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getMedicationRecords, markMedicationTaken, getElderlyList } from '@/api'
import { useTable } from '@/composables/useTable'

const elderlyList = ref([])
const upcomingReminders = ref([
  {
    id: 1,
    elderly_name: '王大爷',
    medicine_name: '降压药',
    dosage: '1片',
    medication_time: '2024-01-20 08:00',
    taken: false
  },
  {
    id: 2,
    elderly_name: '李奶奶',
    medicine_name: '降糖药',
    dosage: '2片',
    medication_time: '2024-01-20 09:00',
    taken: false
  }
])

const {
  loading,
  tableData,
  total,
  pagination,
  searchForm,
  loadData,
  handleSearch,
  handleReset
} = useTable(getMedicationRecords)

const loadElderlyList = async () => {
  try {
    const response = await getElderlyList({ status: 'in', page: 1, page_size: 1000 })
    elderlyList.value = response.data.items || []
  } catch (error) {
    console.error('加载老人列表失败')
  }
}

const getReminderType = (reminder) => {
  const now = new Date()
  const medicationTime = new Date(reminder.medication_time)
  const diff = (medicationTime - now) / (1000 * 60) // 分钟差
  
  if (diff < 30) return 'danger'
  if (diff < 60) return 'warning'
  return 'primary'
}

const markAsTaken = async (record) => {
  try {
    await markMedicationTaken(record.id)
    ElMessage.success('已标记为已服用')
    loadData()
    // 更新提醒列表
    const index = upcomingReminders.value.findIndex(r => r.id === record.id)
    if (index > -1) {
      upcomingReminders.value.splice(index, 1)
    }
  } catch (error) {
    ElMessage.error('操作失败')
  }
}

const viewDetail = (record) => {
  ElMessage.info('详情功能开发中')
}

const showAddDialog = () => {
  ElMessage.info('添加功能开发中')
}

loadElderlyList()
</script>

<style scoped>
.care-medication-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.reminder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reminder-elderly {
  font-weight: 600;
  margin-right: 12px;
}

.reminder-medicine {
  margin-right: 8px;
  color: #606266;
}
</style>