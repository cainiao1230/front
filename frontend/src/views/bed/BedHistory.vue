<template>
  <div class="bed-history-page">
    <PageCard title="床位调整记录">
      <SearchForm v-model="searchForm" @search="handleSearch" @reset="handleReset">
        <el-form-item label="老人">
          <el-select v-model="searchForm.elderly_id" placeholder="全部" clearable filterable style="width: 180px">
            <el-option v-for="e in elderlyList" :key="e.id" :label="e.name" :value="e.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.operation_type" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="分配床位" value="allocate" />
            <el-option label="释放床位" value="release" />
            <el-option label="调换床位" value="transfer" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
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

      <el-timeline class="history-timeline">
        <el-timeline-item
          v-for="record in tableData"
          :key="record.id"
          :timestamp="formatDate(record.operation_time)"
          placement="top"
          :type="getTimelineType(record.operation_type)"
          :icon="getTimelineIcon(record.operation_type)"
        >
          <el-card>
            <div class="history-item">
              <div class="history-header">
                <el-tag :type="getOperationType(record.operation_type, 'type')" size="small">
                  {{ getOperationType(record.operation_type) }}
                </el-tag>
                <span class="history-elderly">{{ record.elderly_name }}</span>
              </div>
              <div class="history-content">
                <div class="history-row">
                  <span class="label">床位信息：</span>
                  <span class="value">{{ record.bed_number }} ({{ record.floor }}楼 {{ record.room_number }}房间)</span>
                </div>
                <div v-if="record.operation_type === 'transfer'" class="history-row">
                  <span class="label">原床位：</span>
                  <span class="value">{{ record.old_bed_number }}</span>
                </div>
                <div class="history-row">
                  <span class="label">操作人：</span>
                  <span class="value">{{ record.operator_name }}</span>
                </div>
                <div v-if="record.reason" class="history-row">
                  <span class="label">原因：</span>
                  <span class="value">{{ record.reason }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>

      <el-empty v-if="tableData.length === 0" description="暂无历史记录" />

      <el-pagination
        v-if="total > 0"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :total="total"
        layout="total, prev, pager, next"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: center"
      />
    </PageCard>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Position, Switch, Refresh } from '@element-plus/icons-vue'
import { getBedHistory, getElderlyList } from '@/api'
import { useTable } from '@/composables/useTable'
import { formatDate } from '@/utils/format'

const elderlyList = ref([])

const {
  loading,
  tableData,
  total,
  pagination,
  searchForm,
  loadData,
  handleSearch,
  handleReset
} = useTable(getBedHistory, { immediate: false })

// 初始化搜索表单
const initSearchForm = () => {
  Object.assign(searchForm, {
    elderly_id: null
  })
}

const loadElderlyList = async () => {
  try {
    const response = await getElderlyList({ status: 'in', page: 1, page_size: 1000 })
    elderlyList.value = response.data.items || []
  } catch (error) {
    console.error('加载老人列表失败')
  }
}

onMounted(() => {
  initSearchForm()
  loadElderlyList()
  loadData()  // 加载历史记录
})

const getTimelineType = (type) => {
  const map = {
    'allocate': 'success',
    'release': 'info',
    'transfer': 'warning'
  }
  return map[type] || 'primary'
}

const getTimelineIcon = (type) => {
  const map = {
    'allocate': Position,
    'release': Refresh,
    'transfer': Switch
  }
  return map[type] || Position
}

const getOperationType = (type, field = 'label') => {
  const map = {
    'allocate': { label: '分配床位', type: 'success' },
    'release': { label: '释放床位', type: 'info' },
    'transfer': { label: '调换床位', type: 'warning' }
  }
  return map[type]?.[field] || type
}

loadElderlyList()
</script>

<style scoped>
.bed-history-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.history-timeline {
  margin-top: 20px;
  padding: 0 20px;
}

.history-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-elderly {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.history-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-row {
  display: flex;
  font-size: 14px;
  line-height: 1.6;
}

.history-row .label {
  color: #909399;
  min-width: 80px;
}

.history-row .value {
  color: #606266;
  flex: 1;
}
</style>