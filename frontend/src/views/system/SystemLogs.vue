<template>
  <div class="system-logs-page">
    <PageCard title="操作日志">
      <SearchForm v-model="searchForm" @search="handleSearch" @reset="handleReset">
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operator" placeholder="请输入操作人" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.action_type" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="登录" value="login" />
            <el-option label="新增" value="create" />
            <el-option label="编辑" value="update" />
            <el-option label="删除" value="delete" />
          </el-select>
        </el-form-item>
        <el-form-item label="模块">
          <el-select v-model="searchForm.module" placeholder="全部模块" clearable style="width: 150px">
            <el-option label="老人管理" value="elderly" />
            <el-option label="床位管理" value="bed" />
            <el-option label="护理管理" value="care" />
            <el-option label="系统管理" value="system" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            style="width: 360px"
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
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getActionType(row.action_type)" size="small">
              {{ getActionLabel(row.action_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ getModuleLabel(row.module) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="ip" label="IP地址" width="150" />
        <el-table-column prop="created_at" label="操作时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="viewDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </PageCard>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="600px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="ID">{{ currentLog?.id }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ currentLog?.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="getActionType(currentLog?.action_type)" size="small">
            {{ getActionLabel(currentLog?.action_type) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="模块">{{ getModuleLabel(currentLog?.module) }}</el-descriptions-item>
        <el-descriptions-item label="操作内容">{{ currentLog?.action }}</el-descriptions-item>
        <el-descriptions-item label="IP地址">{{ currentLog?.ip }}</el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ currentLog?.created_at }}</el-descriptions-item>
        <el-descriptions-item label="请求参数">
          <pre style="max-height: 200px; overflow: auto;">{{ formatJson(currentLog?.request_data) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getSystemLogs } from '@/api'
import { useTable } from '@/composables/useTable'

const detailVisible = ref(false)
const currentLog = ref(null)

const {
  loading,
  tableData,
  total,
  pagination,
  searchForm,
  loadData,
  handleSearch,
  handleReset
} = useTable(getSystemLogs)

const getActionType = (type) => {
  const map = {
    'login': 'success',
    'create': 'primary',
    'update': 'warning',
    'delete': 'danger'
  }
  return map[type] || 'info'
}

const getActionLabel = (type) => {
  const map = {
    'login': '登录',
    'create': '新增',
    'update': '编辑',
    'delete': '删除'
  }
  return map[type] || type
}

const getModuleLabel = (module) => {
  const map = {
    'elderly': '老人管理',
    'bed': '床位管理',
    'care': '护理管理',
    'system': '系统管理'
  }
  return map[module] || module
}

const viewDetail = (log) => {
  currentLog.value = log
  detailVisible.value = true
}

const formatJson = (data) => {
  try {
    if (typeof data === 'string') {
      return JSON.stringify(JSON.parse(data), null, 2)
    }
    return JSON.stringify(data, null, 2)
  } catch {
    return data || '无'
  }
}
</script>

<style scoped>
.system-logs-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

pre {
  margin: 0;
  padding: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.5;
}
</style>