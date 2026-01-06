<template>
  <div class="system-roles-page">
    <el-row :gutter="16">
      <!-- 左侧：角色列表 -->
      <el-col :span="8">
        <PageCard title="角色列表">
          <template #actions>
            <el-button type="primary" size="small" @click="showAddRoleDialog">
              <el-icon><Plus /></el-icon> 新增角色
            </el-button>
          </template>

          <div class="role-list">
            <div
              v-for="role in roles"
              :key="role.id"
              class="role-item"
              :class="{ 'active': selectedRole?.id === role.id }"
              @click="selectRole(role)"
            >
              <div class="role-info">
                <div class="role-name">{{ role.name }}</div>
                <div class="role-desc">{{ role.description }}</div>
              </div>
              <div class="role-actions">
                <el-button size="small" link @click.stop="editRole(role)">编辑</el-button>
                <el-button type="danger" size="small" link @click.stop="deleteRole(role)">删除</el-button>
              </div>
            </div>
          </div>
        </PageCard>
      </el-col>

      <!-- 右侧：权限配置 -->
      <el-col :span="16">
        <PageCard :title="selectedRole ? `${selectedRole.name} - 权限配置` : '请选择角色'">
          <template #actions>
            <el-button v-if="selectedRole" type="primary" @click="savePermissions">
              <el-icon><Select /></el-icon> 保存权限
            </el-button>
          </template>

          <el-empty v-if="!selectedRole" description="请在左侧选择一个角色" />

          <el-tree
            v-else
            :data="permissionTree"
            show-checkbox
            node-key="id"
            :default-checked-keys="selectedPermissions"
            @check-change="handlePermissionChange"
            ref="treeRef"
          >
            <template #default="{ data }">
              <span class="tree-node">
                <el-icon><component :is="data.icon" /></el-icon>
                <span>{{ data.label }}</span>
              </span>
            </template>
          </el-tree>
        </PageCard>
      </el-col>
    </el-row>

    <!-- 角色表单对话框 -->
    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="500px">
      <el-form :model="roleForm" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="roleForm.code" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Select, User, House, Grid, DataLine, Setting, Document } from '@element-plus/icons-vue'
import { getSystemRoles, createSystemRole, updateSystemRole, deleteSystemRole, updateRolePermissions } from '@/api'
import { useDialog } from '@/composables/useDialog'
import { required } from '@/utils/validators'

const roles = ref([])
const selectedRole = ref(null)
const selectedPermissions = ref([])
const treeRef = ref(null)
const loading = ref(false)

const permissionTree = ref([
  {
    id: '1',
    label: '个人中心',
    icon: House,
    children: [
      { id: '1-1', label: '个人信息', icon: User },
      { id: '1-2', label: '账户设置', icon: Setting }
    ]
  },
  {
    id: '2',
    label: '老人管理',
    icon: User,
    children: [
      { id: '2-1', label: '老人列表', icon: Grid },
      { id: '2-2', label: '添加老人', icon: Plus },
      { id: '2-3', label: '老人搜索', icon: DataLine }
    ]
  },
  {
    id: '3',
    label: '床位管理',
    icon: Grid,
    children: [
      { id: '3-1', label: '床位列表', icon: Grid },
      { id: '3-2', label: '床位分配', icon: Plus },
      { id: '3-3', label: '楼层视图', icon: House },
      { id: '3-4', label: '历史记录', icon: Document }
    ]
  },
  {
    id: '4',
    label: '护理管理',
    icon: DataLine,
    children: [
      { id: '4-1', label: '护理记录', icon: Document },
      { id: '4-2', label: '护理任务', icon: Grid },
      { id: '4-3', label: '用药管理', icon: DataLine }
    ]
  },
  {
    id: '5',
    label: '系统管理',
    icon: Setting,
    children: [
      { id: '5-1', label: '用户管理', icon: User },
      { id: '5-2', label: '角色权限', icon: Grid },
      { id: '5-3', label: '操作日志', icon: Document }
    ]
  }
])

const {
  dialogVisible,
  isEdit,
  showAddDialog,
  showEditDialog
} = useDialog()

const formRef = ref(null)
const roleForm = ref({
  name: '',
  code: '',
  description: ''
})

const rules = {
  name: [required('请输入角色名称')],
  code: [required('请输入角色编码')]
}

// 加载角色列表
const loadRoles = async () => {
  loading.value = true
  try {
    const response = await getSystemRoles()
    roles.value = response.data || []
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

const selectRole = (role) => {
  selectedRole.value = role
  // 模拟加载该角色的权限
  if (role.code === 'admin') {
    selectedPermissions.value = ['1', '1-1', '1-2', '2', '2-1', '2-2', '2-3', '3', '3-1', '3-2', '3-3', '3-4', '4', '4-1', '4-2', '4-3', '5', '5-1', '5-2', '5-3']
  } else if (role.code === 'caregiver') {
    selectedPermissions.value = ['1', '1-1', '1-2', '2', '2-1', '2-3', '3', '3-1', '4', '4-1', '4-2', '4-3']
  } else {
    selectedPermissions.value = ['1', '1-1', '1-2', '2', '2-1', '2-3']
  }
}

const handlePermissionChange = () => {
  // 权限变更处理
}

const savePermissions = async () => {
  try {
    const checkedKeys = treeRef.value.getCheckedKeys()
    const halfCheckedKeys = treeRef.value.getHalfCheckedKeys()
    const allKeys = [...checkedKeys, ...halfCheckedKeys]
    
    await updateRolePermissions(selectedRole.value.id, allKeys)
    ElMessage.success('权限保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}

const showAddRoleDialog = () => {
  showAddDialog()
  roleForm.value = {
    name: '',
    code: '',
    description: ''
  }
}

const editRole = (role) => {
  showEditDialog()
  roleForm.value = { ...role }
}

const deleteRole = async (role) => {
  if (role.code === 'admin') {
    ElMessage.warning('管理员角色不能删除')
    return
  }
  
  try {
    await ElMessageBox.confirm('确认删除该角色吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await deleteSystemRole(role.id)
    ElMessage.success('角色已删除')
    loadRoles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const saveRole = async () => {
  try {
    await formRef.value.validate()
    
    if (isEdit.value) {
      await updateSystemRole(roleForm.value.id, roleForm.value)
      ElMessage.success('编辑成功')
    } else {
      await createSystemRole(roleForm.value)
      ElMessage.success('新增成功')
    }
    
    dialogVisible.value = false
    selectedRole.value = null
    loadRoles()
  } catch (error) {
    ElMessage.error('保存失败')
    console.error('表单验证或保存失败', error)
  }
}

// 初始化加载
onMounted(() => {
  loadRoles()
})
</script>

<style scoped>
.system-roles-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.role-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-item {
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 2px solid #ebeef5;
  cursor: pointer;
  transition: all 0.3s;
}

.role-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.role-item.active {
  border-color: #409eff;
  background: #ecf5ff;
}

.role-info {
  margin-bottom: 12px;
}

.role-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.role-desc {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

.role-actions {
  display: flex;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>