<template>
  <div class="elderly-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">
        <el-icon class="title-icon"><User /></el-icon>
        老人管理
      </h2>
      <p class="page-subtitle">管理养老院老人信息，查看老人状态及护理情况</p>
    </div>

    <!-- 搜索与筛选区域 -->
    <el-card class="search-card" shadow="hover">
      <el-form :inline="true" class="search-form">
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入姓名"
            clearable
            prefix-icon="Search"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择"
            clearable
            style="width: 150px"
          >
            <el-option value="pending" label="待审核">
              <el-icon><Clock /></el-icon> 待审核
            </el-option>
            <el-option value="in" label="在住">
              <el-icon><Check /></el-icon> 在住
            </el-option>
            <el-option value="out" label="已退">
              <el-icon><Close /></el-icon> 已退
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="护理等级">
          <el-select
            v-model="searchForm.care_level"
            placeholder="请选择"
            clearable
            style="width: 150px"
          >
            <el-option value="self_care" label="自理" />
            <el-option value="semi_care" label="半护理" />
            <el-option value="full_care" label="全护理" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :icon="Search">
            查询
          </el-button>
          <el-button @click="handleReset" :icon="RefreshLeft">
            重置
          </el-button>
          <el-button v-if="userInfo.role === 'admin'" type="success" @click="handleAdd" :icon="Plus">
            新增老人
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 老人列表 -->
    <el-card class="table-card" shadow="hover">
      <el-table 
        v-loading="loading" 
        :data="tableData" 
        stripe 
        style="width: 100%"
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold' }"
        element-loading-text="加载中..."
        element-loading-spinner="el-icon-loading"
      >
        <el-table-column prop="id" label="ID" width="60" align="center" />
        <el-table-column prop="name" label="姓名" width="120" align="center">
          <template #default="{ row }">
            <span class="name-text">{{ row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.gender === 'male' ? 'primary' : 'danger'" size="small" effect="plain">
              {{ row.gender === 'male' ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'in'" type="success" effect="dark" size="small">
              <el-icon><Check /></el-icon> 在住
            </el-tag>
            <el-tag v-else-if="row.status === 'out'" type="info" effect="dark" size="small">
              <el-icon><Close /></el-icon> 已退
            </el-tag>
            <el-tag v-else type="warning" effect="dark" size="small">
              <el-icon><Clock /></el-icon> 待审核
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="birthday" label="出生日期" width="120" align="center" />
        <el-table-column prop="phone" label="联系电话" width="140" align="center">
          <template #default="{ row }">
            <span class="phone-text">{{ row.phone }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="bed_id" label="床位" width="90" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.bed_id" type="info" size="small">{{ row.bed_id }}</el-tag>
            <span v-else class="empty-text">未分配</span>
          </template>
        </el-table-column>
        <el-table-column label="护理等级" width="110" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.care_level === 'self_care'" type="success" effect="dark" size="small">
              自理
            </el-tag>
            <el-tag v-else-if="row.care_level === 'semi_care'" type="warning" effect="dark" size="small">
              半护理
            </el-tag>
            <el-tag v-else-if="row.care_level === 'full_care'" type="danger" effect="dark" size="small">
              全护理
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="emergency_contact_name" label="紧急联系人" width="120" align="center" />
        <el-table-column prop="emergency_contact_phone" label="联系人电话" width="140" align="center">
          <template #default="{ row }">
            <span class="phone-text">{{ row.emergency_contact_phone }}</span>
          </template>
        </el-table-column>
        <!-- 操作列（仅管理员可见） -->
        <el-table-column label="操作" width="200" fixed="right" align="center" v-if="userInfo.role === 'admin'">
          <template #default="{ row }">
            <el-button 
              size="small" 
              type="primary" 
              :icon="Edit"
              @click="handleEdit(row)"
              link
            >
              编辑
            </el-button>
            <el-button 
              size="small" 
              type="danger" 
              :icon="Delete"
              @click="handleDelete(row)"
              link
            >
              退房
            </el-button>
          </template>
        </el-table-column>
      </el-table>

    <!-- 分页 -->
    <div class="pagination-wrapper">
      <el-pagination
        v-if="total > 0"
        background
        layout="total, sizes, prev, pager, next, jumper"
        :current-page="searchForm.page"
        :page-size="searchForm.page_size"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        @current-change="handlePageChange"
        @size-change="handlePageSizeChange"
      />
    </div>
    </el-card>
  </div>
  <el-dialog 
    title="编辑老人信息" 
    v-model="editDialogVisible" 
    width="600px"
    :close-on-click-modal="false"
  >
  <el-form :model="editForm" label-width="120px" class="edit-form">
    <el-form-item label="姓名">
      <el-input v-model="editForm.name" placeholder="请输入姓名" />
    </el-form-item>
    <el-form-item label="性别">
      <el-radio-group v-model="editForm.gender">
        <el-radio label="male">男</el-radio>
        <el-radio label="female">女</el-radio>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="出生日期">
      <el-date-picker 
        v-model="editForm.birthday" 
        type="date" 
        placeholder="选择日期"
        style="width: 100%"
      />
    </el-form-item>
    <el-form-item label="身份证号">
      <el-input v-model="editForm.id_number" placeholder="请输入身份证号" />
    </el-form-item>
    <el-form-item label="联系电话">
      <el-input v-model="editForm.phone" placeholder="请输入联系电话" />
    </el-form-item>
    <el-form-item label="床位ID">
      <el-input v-model="editForm.bed_id" placeholder="请输入床位ID" />
    </el-form-item>
    <el-form-item label="护理等级">
      <el-select v-model="editForm.care_level" style="width: 100%">
        <el-option value="self_care" label="自理" />
        <el-option value="semi_care" label="半护理" />
        <el-option value="full_care" label="全护理" />
      </el-select>
    </el-form-item>
    <el-form-item label="紧急联系人">
      <el-input v-model="editForm.emergency_contact_name" placeholder="请输入紧急联系人" />
    </el-form-item>
    <el-form-item label="紧急联系人电话">
      <el-input v-model="editForm.emergency_contact_phone" placeholder="请输入紧急联系人电话" />
    </el-form-item>
  </el-form>

  <template #footer>
    <el-button @click="editDialogVisible = false" :icon="Close">取消</el-button>
    <el-button type="primary" @click="handleEditSubmit" :loading="submitLoading" :icon="Check">
      保存
    </el-button>
  </template>
</el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { 
  User, Search, RefreshLeft, Plus, Check, Close, Clock, Edit, Delete
} from '@element-plus/icons-vue'
import { getElderlyList, updateElderly, deleteElderly } from '@/api'

const router = useRouter()

// 编辑弹窗状态
const editDialogVisible = ref(false)

// 编辑表单数据
const editForm = ref({
  id: '',
  name: '',
  gender: '',
  birthday: '',
  id_number: '',
  phone: '',
  bed_id: '',
  care_level: '',
  emergency_contact_name: '',
  emergency_contact_phone: ''
})
const submitLoading = ref(false)

// 编辑：打开弹窗并填充数据
const handleEdit = (row) => {
  editForm.value = { ...row }
  editDialogVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  submitLoading.value = true
  try {
    await updateElderly(editForm.value.id, editForm.value)
    editDialogVisible.value = false
    fetchElderlyList() // 重新加载列表（确保你已有这个方法）
  } catch (err) {
    ElMessage.error('修改失败')
  } finally {
    submitLoading.value = false
  }
}
// 删除
const handleDelete = (row) => {
  ElMessageBox.confirm(`确定要删除老人${row.name}吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await deleteElderly(row.id)
      ElMessage.success('删除成功')
      fetchElderlyList() // 重新加载列表
    } catch (err) {
      ElMessage.error('删除失败')
    }
  })
}
//加载动画显示
const loading = ref(true)
// 搜索表单
const searchForm = ref({
  page: 1,
  page_size: 10,
  name: '',
  status: '',  // 添加状态筛选
  care_level: ''
})

// 表格数据
const tableData = ref([])
const total = ref(0)

// 获取老人列表
const fetchElderlyList = async () => {
  loading.value = true
  try {
    const params = {
      page: searchForm.value.page,
      page_size: searchForm.value.page_size,
      name: searchForm.value.name || undefined,
      status: searchForm.value.status || undefined,
      care_level: searchForm.value.care_level || undefined
    }

    const res = await getElderlyList(params)
    // 兼容后端 code 包装和直接数据
    const data = res?.data ?? res ?? {}
    tableData.value = data.items || data.list || []
    total.value = data.total || tableData.value.length || 0
  } catch (error) {
    console.error('请求失败:', error)
    ElMessage.error('获取失败')
  }
  finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  searchForm.value.page = 1
  fetchElderlyList()
}

// 重置
const handleReset = () => {
  searchForm.value = {
    page: 1,
    page_size: 10,
    name: '',
    status: '',
    care_level: ''
  }
  fetchElderlyList()
}

// 分页切换
const handlePageChange = (page) => {
  searchForm.value.page = page
  fetchElderlyList()
}

const handlePageSizeChange = (pageSize) => {
  searchForm.value.page_size = pageSize
  fetchElderlyList()
}

// 新增老人
const handleAdd = () => {
  router.push('/home/elderlies/add')
}

// 🔐 角色权限控制
const userInfo = ref({})
// 初始化用户信息
const initUserInfo = () => {
  // 统一使用登录时存储的 userInfo key
  userInfo.value = JSON.parse(localStorage.getItem('userInfo') || '{}')
}
// 初始化加载
onMounted(() => {
  initUserInfo()
  fetchElderlyList()
})
</script>

<style scoped>
.elderly-page {
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

/* 页面头部 */
.page-header {
  margin-bottom: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.page-title {
  margin: 0;
  font-size: 28px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-icon {
  font-size: 32px;
  color: #667eea;
}

.page-subtitle {
  margin: 8px 0 0 42px;
  font-size: 14px;
  color: #606266;
  opacity: 0.8;
}

/* 搜索卡片 */
.search-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  overflow: hidden;
}

.search-card :deep(.el-card__body) {
  padding: 20px;
}

.search-form {
  margin: 0;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.search-form :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s;
}

.search-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.search-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

/* 表格卡片 */
.table-card {
  border-radius: 12px;
  border: none;
  overflow: hidden;
}

.table-card :deep(.el-card__body) {
  padding: 0;
}

/* 表格样式 */
.table-card :deep(.el-table) {
  font-size: 14px;
}

.table-card :deep(.el-table th) {
  background: #f5f7fa !important;
  font-weight: 600;
}

.table-card :deep(.el-table td) {
  padding: 12px 0;
}

.table-card :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.name-text {
  font-weight: 600;
  color: #409eff;
  cursor: pointer;
}

.name-text:hover {
  text-decoration: underline;
}

.phone-text {
  font-family: 'Courier New', monospace;
  color: #606266;
}

.empty-text {
  color: #c0c4cc;
  font-style: italic;
}

/* 状态标签动画 */
.table-card :deep(.el-tag) {
  transition: all 0.3s;
}

.table-card :deep(.el-tag:hover) {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 操作按钮 */
.table-card :deep(.el-button.is-link) {
  padding: 4px 8px;
  font-weight: 500;
}

/* 分页 */
.pagination-wrapper {
  padding: 20px;
  display: flex;
  justify-content: flex-end;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

.pagination-wrapper :deep(.el-pagination) {
  gap: 8px;
}

.pagination-wrapper :deep(.el-pagination__total) {
  margin-right: auto;
  font-weight: 500;
}

/* 编辑对话框 */
.edit-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.edit-form :deep(.el-input__wrapper) {
  transition: all 0.3s;
}

.edit-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .elderly-page {
    padding: 10px;
  }

  .page-title {
    font-size: 22px;
  }

  .search-form {
    flex-direction: column;
  }

  .search-form :deep(.el-form-item) {
    margin-bottom: 10px;
    width: 100%;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-card,
.table-card {
  animation: fadeIn 0.6s ease-out;
}

.page-header {
  animation: fadeIn 0.4s ease-out;
}

/* 按钮悬停效果 */
:deep(.el-button) {
  transition: all 0.3s;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-button:active) {
  transform: translateY(0);
}
</style>