<template>
  <div class="system-users-page">
    <PageCard title="用户管理">
      <template #actions>
        <el-button type="primary" @click="showAddDialog">
          <el-icon><Plus /></el-icon> 新增用户
        </el-button>
      </template>

      <SearchForm v-model="searchForm" @search="handleSearch" @reset="handleReset">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable style="width: 180px" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="searchForm.role" placeholder="全部角色" clearable style="width: 150px">
            <el-option label="管理员" value="admin" />
            <el-option label="护工" value="caregiver" />
            <el-option label="家属" value="family" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="正常" value="active" />
            <el-option label="禁用" value="disabled" />
          </el-select>
        </el-form-item>
      </SearchForm>

      <!-- 批量操作按钮 -->
      <div v-if="selectedUsers.length > 0" class="batch-actions">
        <span>已选择 {{ selectedUsers.length }} 位用户</span>
        <el-divider direction="vertical" />
        <el-button-group>
          <el-dropdown @command="batchSetRole">
            <el-button type="primary" size="small">
              批量设置角色<el-icon class="is-icon-right"><arrow-down /></el-icon>
            </el-button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="admin">设置为管理员</el-dropdown-item>
                <el-dropdown-item command="caregiver">设置为护工</el-dropdown-item>
                <el-dropdown-item command="family">设置为家属</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-button type="success" size="small" @click="batchEnable">批量启用</el-button>
          <el-button type="warning" size="small" @click="batchDisable">批量禁用</el-button>
        </el-button-group>
        <el-button type="danger" size="small" @click="batchDelete">批量删除</el-button>
      </div>

      <DataTable 
        :data="tableData" 
        :loading="loading"
        :total="total"
        v-model:page="pagination.page"
        v-model:page-size="pagination.page_size"
        @change="loadData"
      >
        <el-table-column type="selection" width="50" @selection-change="handleSelectionChange" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="150" />
        <el-table-column prop="real_name" label="真实姓名" width="120" />
        <el-table-column label="角色" width="120">
          <template #default="{ row }">
            <StatusTag type="userRole" :value="row.role" size="small" />
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="180" show-overflow-tooltip />
        <el-table-column label="状态" width="100">
          <template #default="{ row }">
            <el-switch
              :model-value="row.status === 'active' || row.status === 1"
              :disabled="row.role === 'admin'"
              @change="(val) => handleStatusChange(row, val)"
            />
          </template>
        </el-table-column>
        <el-table-column prop="last_login" label="最后登录" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="editUser(row)">编辑</el-button>
            <el-button size="small" link @click="resetPassword(row)">重置密码</el-button>
            <el-button type="danger" size="small" link @click="deleteUser(row)">删除</el-button>
          </template>
        </el-table-column>
      </DataTable>
    </PageCard>

    <!-- 用户表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="600px">
      <el-form :model="userForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="real_name">
          <el-input v-model="userForm.real_name" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="userForm.role" style="width: 100%">
            <el-option label="管理员" value="admin" />
            <el-option label="护工" value="caregiver" />
            <el-option label="家属" value="family" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="userForm.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowDown } from '@element-plus/icons-vue'
import { getSystemUsers, createSystemUser, updateSystemUser, deleteSystemUser, batchUpdateUserStatus, batchUpdateUserRole } from '@/api'
import { useTable } from '@/composables/useTable'
import { useDialog } from '@/composables/useDialog'
import { required, phoneValidator } from '@/utils/validators'

const {
  loading,
  tableData,
  total,
  pagination,
  searchForm,
  loadData,
  handleSearch,
  handleReset
} = useTable(getSystemUsers)

const {
  dialogVisible,
  dialogMode,
  openDialog
} = useDialog()

// 是否编辑模式
const isEdit = computed(() => dialogMode.value === 'edit')

const formRef = ref(null)
const selectedUsers = ref([])
const userForm = ref({
  username: '',
  password: '',
  real_name: '',
  role: 'caregiver',
  phone: '',
  email: ''
})

const rules = {
  username: [required('请输入用户名')],
  password: [required('请输入密码')],
  real_name: [required('请输入真实姓名')],
  role: [required('请选择角色')],
  phone: [phoneValidator]
}

const handleStatusChange = async (user, newValue) => {
  const newStatus = newValue ? 'active' : 'disabled'
  const oldStatus = user.status
  
  // 管理员账号不允许禁用
  if (user.role === 'admin' && newStatus === 'disabled') {
    ElMessage.warning('管理员账号不能被禁用')
    return
  }
  
  try {
    // 先乐观更新UI
    user.status = newStatus
    await updateSystemUser(user.id, { status: newStatus })
    ElMessage.success('状态更新成功')
  } catch (error) {
    // 失败时恢复原状态
    user.status = oldStatus
    ElMessage.error('操作失败')
  }
}

// 选择改变
const handleSelectionChange = (selection) => {
  selectedUsers.value = selection
}

// 批量设置角色
const batchSetRole = async (role) => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  
  try {
    const userIds = selectedUsers.value.map(u => u.id)
    await batchUpdateUserRole(userIds, role)
    
    const roleText = { 'admin': '管理员', 'caregiver': '护工', 'family': '家属' }
    ElMessage.success(`已将 ${selectedUsers.value.length} 位用户设置为${roleText[role]}`)
    selectedUsers.value = []
    loadData()
  } catch (error) {
    ElMessage.error('批量设置失败')
  }
}

// 批量启用
const batchEnable = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  
  try {
    const userIds = selectedUsers.value.map(u => u.id)
    await batchUpdateUserStatus(userIds, 'active')
    
    ElMessage.success(`已启用 ${selectedUsers.value.length} 位用户`)
    selectedUsers.value = []
    loadData()
  } catch (error) {
    ElMessage.error('批量启用失败')
  }
}

// 批量禁用
const batchDisable = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  
  try {
    const userIds = selectedUsers.value.map(u => u.id)
    await batchUpdateUserStatus(userIds, 'disabled')
    
    ElMessage.success(`已禁用 ${selectedUsers.value.length} 位用户`)
    selectedUsers.value = []
    loadData()
  } catch (error) {
    ElMessage.error('批量禁用失败')
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning('请先选择用户')
    return
  }
  
  try {
    await ElMessageBox.confirm(`确认删除 ${selectedUsers.value.length} 位用户吗？`, '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    for (const user of selectedUsers.value) {
      await deleteSystemUser(user.id)
    }
    
    ElMessage.success('用户已删除')
    selectedUsers.value = []
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 新增/编辑对话框打开函数（保持与模板接口一致）
const showAddDialog = () => {
  userForm.value = {
    username: '',
    password: '',
    real_name: '',
    role: 'caregiver',
    phone: '',
    email: ''
  }
  openDialog('add')
}

const editUser = (user) => {
  userForm.value = { ...user }
  openDialog('edit')
}

const resetPassword = async (user) => {
  try {
    const { value: newPassword } = await ElMessageBox.prompt('请输入新密码', '重置密码', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputType: 'password',
      inputPattern: /.{6,}/,
      inputErrorMessage: '密码至少 6 位'
    })
    
    if (newPassword) {
      await updateSystemUser(user.id, { password: newPassword })
      ElMessage.success('密码重置成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const deleteUser = async (user) => {
  try {
    await ElMessageBox.confirm('确认删除该用户吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteSystemUser(user.id)
    ElMessage.success('用户已删除')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const saveUser = async () => {
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      await updateSystemUser(userForm.value.id, userForm.value)
      ElMessage.success('编辑成功')
    } else {
      await createSystemUser(userForm.value)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    selectedUsers.value = []
    loadData()
  } catch (error) {
    ElMessage.error('保存失败')
    console.error('表单验证或保存失败', error)
  }
}
</script>

<style scoped>
.system-users-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.batch-actions {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #ecf5ff;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
}

.batch-actions span {
  color: #303133;
  font-weight: 500;
}

.batch-actions :deep(.el-button-group) {
  margin: 0 8px;
}
</style>