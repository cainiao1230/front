<template>
  <div class="bed-list-page">
    <PageCard title="床位管理">
      <template #actions>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon> 新增床位
        </el-button>
      </template>

      <!-- 筛选条件 -->
      <SearchForm v-model="searchForm" @search="handleSearch" @reset="handleReset">
        <el-form-item label="楼层">
          <el-select v-model="searchForm.floor" placeholder="全部楼层" clearable style="width: 120px">
            <el-option v-for="floor in FLOORS" :key="floor" :label="`${floor}楼`" :value="floor" />
          </el-select>
        </el-form-item>

        <el-form-item label="床位状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option 
              v-for="opt in BED_STATUS_OPTIONS" 
              :key="opt.value" 
              :label="opt.label" 
              :value="opt.value" 
            />
          </el-select>
        </el-form-item>

        <el-form-item label="床位类型">
          <el-select v-model="searchForm.bed_type" placeholder="全部类型" clearable style="width: 150px">
            <el-option 
              v-for="opt in BED_TYPE_OPTIONS" 
              :key="opt.value" 
              :label="opt.label" 
              :value="opt.value" 
            />
          </el-select>
        </el-form-item>
      </SearchForm>

      <!-- 床位统计 -->
      <el-row :gutter="16" style="margin-bottom: 20px">
        <el-col :span="6">
          <StatCard 
            title="总床位数" 
            :value="stats.total" 
            suffix="张"
            type="primary"
          />
        </el-col>
        <el-col :span="6">
          <StatCard 
            title="空闲床位" 
            :value="stats.available" 
            suffix="张"
            :icon="CircleCheck"
            type="success"
          />
        </el-col>
        <el-col :span="6">
          <StatCard 
            title="已占用" 
            :value="stats.occupied" 
            suffix="张"
            :icon="User"
            type="warning"
          />
        </el-col>
        <el-col :span="6">
          <StatCard 
            title="床位使用率" 
            :value="stats.rate.toFixed(1)" 
            suffix="%"
            :icon="TrendCharts"
            type="info"
          />
        </el-col>
      </el-row>

      <!-- 床位列表 -->
      <DataTable 
        :data="tableData" 
        :loading="loading"
        :total="total"
        v-model:page="pagination.page"
        v-model:page-size="pagination.page_size"
        @change="loadBedList"
      >
        <el-table-column prop="id" label="床位ID" width="80" />
        <el-table-column prop="bed_no" label="床位编号" width="120" />
        <el-table-column prop="room" label="房间号" width="120" />
        <el-table-column prop="building" label="楼栋" width="80" />
        <el-table-column prop="floor" label="楼层" width="80" />
        <el-table-column label="床位类型" width="100">
          <template #default="{ row }">
            <StatusTag type="bedType" :value="row.bed_type" size="small" />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <StatusTag type="bedStatus" :value="row.status" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="elderly_name" label="入住老人" width="120" />
        <el-table-column label="价格" width="120">
          <template #default="{ row }">
            ¥{{ row.price || 0 }}/月
          </template>
        </el-table-column>
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button v-if="row.status === 'free'" type="primary" size="small" link @click="allocateBed(row)">
              分配床位
            </el-button>
            <el-button v-if="row.status === 'occupied'" type="warning" size="small" link @click="releaseBed(row)">
              释放床位
            </el-button>
            <el-button size="small" link @click="editBed(row)">编辑</el-button>
            <el-button v-if="row.status !== 'occupied'" type="danger" size="small" link @click="deleteBed(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </DataTable>
    </PageCard>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, CircleCheck, User, TrendCharts } from '@element-plus/icons-vue'
import { getBedList, deleteBed as deleteBedApi, releaseBed as releaseBedApi } from '@/api'
import { useTable } from '@/composables/useTable'
import { FLOORS, BED_STATUS_OPTIONS, BED_TYPE_OPTIONS } from '@/utils/constants'
import PageCard from '@/components/common/PageCard.vue'
import SearchForm from '@/components/common/SearchForm.vue'
import DataTable from '@/components/common/DataTable.vue'
import StatCard from '@/components/common/StatCard.vue'
import StatusTag from '@/components/common/StatusTag.vue'

// 使用表格组合函数
const {
  loading,
  tableData,
  total,
  pagination,
  searchForm,
  loadData: loadBedList,
  handleSearch,
  handleReset
} = useTable(getBedList)

// 床位统计
const stats = computed(() => {
  const totalCount = total.value
  // 后端状态: free=空闲, occupied=已占用
  const freeCount = tableData.value.filter(bed => bed.status === 'free').length
  const occupiedCount = tableData.value.filter(bed => bed.status === 'occupied').length
  const rate = totalCount > 0 ? (occupiedCount / totalCount * 100) : 0
  
  return {
    total: totalCount,
    available: freeCount,
    occupied: occupiedCount,
    rate
  }
})

// 分配床位
const allocateBed = (bed) => {
  console.log('分配床位', bed)
  ElMessage.info('请前往床位分配页面进行操作')
}

// 释放床位
const releaseBed = async (bed) => {
  try {
    const { value } = await ElMessageBox.prompt(
      `确认释放床位 ${bed.bed_no} 吗？请输入释放原因`,
      '释放床位',
      {
        inputPlaceholder: '如：出院、调换等',
        inputValue: '出院',
        confirmButtonText: '确认释放',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await releaseBedApi(bed.id, value)
    ElMessage.success('床位已释放')
    loadBedList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('释放床位失败')
    }
  }
}

// 编辑床位
const editBed = (bed) => {
  ElMessage.info('编辑功能开发中')
}

// 删除床位
const deleteBed = async (bed) => {
  try {
    await ElMessageBox.confirm(`确认删除床位 ${bed.bed_number} 吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteBedApi(bed.id)
    ElMessage.success('床位已删除')
    loadBedList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除床位失败')
    }
  }
}

// 新增床位
const showAddDialog = () => {
  ElMessage.info('新增功能开发中')
}

onMounted(() => {
  loadBedList()
})
</script>

<style scoped>
.bed-list-page {
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

.search-form {
  margin-bottom: 16px;
}

.statistics {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

:deep(.el-statistic__head) {
  font-size: 14px;
  color: #909399;
}

:deep(.el-statistic__content) {
  font-size: 24px;
  font-weight: 600;
}
</style>