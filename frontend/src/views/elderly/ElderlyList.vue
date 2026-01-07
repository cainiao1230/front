<template>
  <div class="elderly-page">
    <h2>老人管理</h2>

    <!-- 搜索与筛选区域 -->
    <el-form :inline="true" class="search-form">
      <el-form-item label="姓名">
        <el-input
          v-model="searchForm.name"
          placeholder="请输入姓名"
          clearable
          @keyup.enter="handleSearch"
        />
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
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="handleReset">重置</el-button>
        <el-button v-if="userInfo.role === 'admin' " type="primary"  @click="handleAdd">
  新增老人
</el-button>
      </el-form-item>
    </el-form>
    
    <!-- 老人列表 -->
    <el-table v-loading="loading" :data="tableData" border stripe 
    style="width: 100%; margin-top: 16px" element-loading-text="加载中..."
    element-loading-spinner="el-icon-loading"
    element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-table-column prop="id" label="ID" width="60" />
      <el-table-column prop="name" label="姓名" width="120"/>
      <el-table-column label="性别" width="80">
        <template #default="{ row }">
          {{ row.gender === 'male' ? '男' : '女' }}
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
  <template #default="{ row }">
    <el-tag v-if="row.status === 'in'" type="success">在住</el-tag>
    <el-tag v-else-if="row.status === 'out'" type="info">已退</el-tag>
    <el-tag v-else type="warning">待审核</el-tag>
  </template>
</el-table-column>
      <el-table-column prop="birthday" label="出生日期" width="120" />
      <el-table-column prop="phone" label="联系电话" width="160" />
      <el-table-column prop="bed_id" label="床位ID" width="90" />
      <el-table-column label="护理等级" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.care_level === 'self_care'" type="success">自理</el-tag>
          <el-tag v-else-if="row.care_level === 'semi_care'" type="warning">半护理</el-tag>
          <el-tag v-else-if="row.care_level === 'full_care'" type="danger">全护理</el-tag>
        </template>
      </el-table-column>
     <el-table-column prop="emergency_contact_name" label="紧急联系人" width="100" />
<el-table-column prop="emergency_contact_phone" label="紧急联系人电话" width="160" />
<!-- 操作列（仅管理员可见） -->
<el-table-column label="操作" width="180" v-if="userInfo.role === 'admin'">
  <template #default="{ row }">
    <el-button size="small" @click="handleEdit(row)">编辑</el-button>
    <el-button size="small" type="danger" @click="handleDelete(row)">老人退房</el-button>
  </template>
</el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-if="total > 0"
      style="margin-top: 20px; text-align: right"
      background
      layout="total, prev, pager, next, jumper"
      :current-page="searchForm.page"
      :page-size="searchForm.page_size"
      :total="total"
      @current-change="handlePageChange"
      @size-change="handlePageSizeChange"
    />
  </div>
  <el-dialog title="编辑老人信息" v-model="editDialogVisible" width="600px">
  <el-form :model="editForm" label-width="100px">
    <el-form-item label="姓名">
      <el-input v-model="editForm.name" />
    </el-form-item>
    <el-form-item label="性别">
      <el-select v-model="editForm.gender">
        <el-option value="male" label="男" />
        <el-option value="female" label="女" />
      </el-select>
    </el-form-item>
    <el-form-item label="出生日期">
      <el-date-picker v-model="editForm.birthday" type="date" />
    </el-form-item>
    <el-form-item label="联系电话">
      <el-input v-model="editForm.phone" />
    </el-form-item>
    <el-form-item label="床位ID">
      <el-input v-model="editForm.bed_id" />
    </el-form-item>
    <el-form-item label="护理等级">
      <el-select v-model="editForm.care_level">
        <el-option value="self_care" label="自理" />
        <el-option value="semi_care" label="半护理" />
        <el-option value="full_care" label="全护理" />
      </el-select>
    </el-form-item>
    <el-form-item label="紧急联系人">
      <el-input v-model="editForm.emergency_contact_name" />
    </el-form-item>
    <el-form-item label="紧急联系人电话">
      <el-input v-model="editForm.emergency_contact_phone" />
    </el-form-item>
  </el-form>

  <template #footer>
    <el-button @click="editDialogVisible = false">取消</el-button>
    <el-button type="primary" @click="handleEditSubmit">保存</el-button>
  </template>
</el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getElderlyList, updateElderly, deleteElderly } from '@/api'
// 编辑弹窗状态
const editDialogVisible = ref(false)

// 编辑表单数据
const editForm = ref({
  id: '',
  name: '',
  gender: '',
  birthday: '',
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
  padding: 24px;
  background-color:   #1e4d8c;
  min-height: 100%;
}
.search-form {
  background: #fff;
  padding: 16px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}
</style>