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
            <el-button 
              v-if="selectedRole && !isAdminRole" 
              type="primary" 
              @click="savePermissions"
            >
              <el-icon><Select /></el-icon> 保存权限
            </el-button>
            <el-tag v-if="selectedRole && isAdminRole" type="info">
              管理员默认拥有所有权限
            </el-tag>
          </template>

          <el-empty v-if="!selectedRole" description="请在左侧选择一个角色" />

                    <el-tree
                      v-else
                      :data="permissionTree"
                      show-checkbox
                      node-key="id"
                      :default-checked-keys="selectedPermissions"
                      ref="treeRef"
                      :expand-on-click-node="false"
                      :check-strictly="false"
                      :class="{ 'tree-disabled': isAdminRole }"
                    >
                      <template #default="{ data }">
                        <span class="tree-node">
                          <el-icon><component :is="data.icon" /></el-icon>
                          <el-tooltip v-if="data.description" :content="data.description" placement="right">
                            <span>{{ data.label }}</span>
                          </el-tooltip>
                          <span v-else>{{ data.label }}</span>
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
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Select, User, House, Grid, DataLine, Setting, Document } from '@element-plus/icons-vue'
import { getSystemRoles, getSystemRoleDetail, createSystemRole, updateSystemRole, deleteSystemRole, updateRolePermissions, getSystemPermissions, getCurrentUser } from '@/api'
import { useDialog } from '@/composables/useDialog'
import { required } from '@/utils/validators'

const roles = ref([])
const selectedRole = ref(null)
const selectedPermissions = ref([])
const treeRef = ref(null)
const loading = ref(false)
const permissions = ref([])

// ============ 权限 code 格式转换工具函数 ============
// 前端使用 page.xxx 格式，后端数据库使用 xxx 格式（去掉 page. 前缀）

// 前端格式 → 后端格式：page.dashboard → dashboard
const toBackendCode = (code) => {
  if (!code) return code
  return code.startsWith('page.') ? code.substring(5) : code
}

// 后端格式 → 前端格式：dashboard → page.dashboard
const toFrontendCode = (code) => {
  if (!code) return code
  return code.startsWith('page.') ? code : `page.${code}`
}

// 批量转换
const toBackendCodes = (codes) => codes.map(toBackendCode)
const toFrontendCodes = (codes) => codes.map(toFrontendCode)

// 直接使用后端返回的树形权限结构
const permissionTree = computed(() => {
  console.log('[角色权限] 权限树原始数据:', permissions.value)
  
  // 后端返回的是树形结构，需要转换为 el-tree 需要的格式
  const transformNode = (node) => {
    const result = {
      id: node.code || node.id,
      code: node.code || node.id,
      label: node.name || node.label || node.code,
      description: node.description || ''
    }
    
    // 如果有子节点，递归转换
    if (node.children && node.children.length > 0) {
      result.children = node.children.map(transformNode)
    }
    
    return result
  }
  
  // 如果后端返回的已经是树形结构
  if (Array.isArray(permissions.value) && permissions.value.length > 0) {
    const firstItem = permissions.value[0]
    // 检查是否是树形结构（有 children 且不为 null）
    if (firstItem.children && Array.isArray(firstItem.children)) {
      const tree = permissions.value.map(transformNode)
      console.log('[角色权限] 转换后的权限树:', tree)
      return tree
    }
  }
  
  // 兼容旧的扁平结构（如果后端还没更新）
  console.log('[角色权限] 检测到扁平结构，尝试手动构建树')
  const tree = []
  const map = {}
  const parentCodes = new Set()
  
  // 第一遍：识别哪些是父节点（有子节点的2段code）
  permissions.value.forEach(perm => {
    const code = perm.code || perm || ''
    const parts = String(code).split('.')
    if (parts.length === 3) {
      const parentCode = parts.slice(0, 2).join('.')
      parentCodes.add(parentCode)
    }
  })
  
  // 第二遍：构建树
  permissions.value.forEach(perm => {
    const code = perm.code || perm || ''
    const parts = String(code).split('.')
    
    if (parts.length === 2) {
      if (parentCodes.has(code)) {
        const node = {
          id: code,
          code: code,
          label: perm.name || code,
          description: perm.description || '',
          children: []
        }
        tree.push(node)
        map[code] = node
      } else {
        tree.push({
          id: code,
          code: code,
          label: perm.name || code,
          description: perm.description || ''
        })
      }
    } else if (parts.length === 3) {
      const parentCode = parts.slice(0, 2).join('.')
      const parent = map[parentCode]
      if (parent) {
        parent.children.push({
          id: code,
          code: code,
          label: perm.name || code,
          description: perm.description || ''
        })
      } else {
        tree.push({
          id: code,
          code: code,
          label: perm.name || code,
          description: perm.description || ''
        })
      }
    }
  })
  
  console.log('[角色权限] 手动构建的权限树:', tree)
  return tree
})

const {
  dialogVisible,
  dialogMode,
  openDialog
} = useDialog()

// 判断当前选中的是否是管理员角色
const isAdminRole = computed(() => {
  if (!selectedRole.value) return false
  const code = (selectedRole.value.code || '').toLowerCase()
  const name = (selectedRole.value.name || '').toLowerCase()
  return code === 'admin' || name === '管理员'
})

// 是否编辑模式
const isEdit = computed(() => dialogMode.value === 'edit')

const formRef = ref(null)
const roleForm = ref({
  name: '',
  code: '',
  description: ''
})

const rules = {
  name: [required('请输入角色名称')]
}

// 生成唯一的角色编码
const generateRoleCode = () => {
  return `role_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
}

// 加载角色列表
const loadRoles = async () => {
  loading.value = true
  try {
    const response = await getSystemRoles()
    roles.value = Array.isArray(response) ? response : []
    console.log('[角色权限] 角色列表加载:', roles.value)
    // 注意：不在这里自动选择角色，等权限加载完成后再选
  } catch (error) {
    ElMessage.error('加载角色列表失败')
  } finally {
    loading.value = false
  }
}

// 加载权限列表
const loadPermissions = async () => {
  try {
    const resp = await getSystemPermissions()
    const list = Array.isArray(resp) ? resp : (resp?.items || resp?.data || [])
    permissions.value = list
    console.log('[角色权限] 权限列表加载:', list)
    
    // 如果后端权限列表为空，从角色中提取（临时方案）
    if (list.length === 0 && roles.value.length > 0) {
      const allPerms = new Set()
      roles.value.forEach(r => {
        (r.permissions || []).forEach(p => allPerms.add(p))
      })
      permissions.value = Array.from(allPerms).map(code => ({ code, name: code }))
      console.log('[角色权限] 从角色提取权限:', permissions.value)
    }
  } catch (error) {
    console.error('[角色权限] 加载权限列表失败:', error)
    // 降级：从现有角色提取权限
    if (roles.value.length > 0) {
      const allPerms = new Set()
      roles.value.forEach(r => {
        (r.permissions || []).forEach(p => allPerms.add(p))
      })
      permissions.value = Array.from(allPerms).map(code => ({ code, name: code }))
    }
  }
}

// 递归遍历树形结构，只勾选叶子节点（el-tree 的 check-strictly=false 会自动处理父节点半选状态）
const getDefaultCheckedKeys = (rolePerms, tree) => {
  const checked = []
  // 兼容字符串数组和对象数组，直接使用后端格式（不转换）
  const codes = rolePerms.map(p => typeof p === 'string' ? p : p.code)
  const allCodes = new Set(codes)
  
  console.log('[角色权限] getDefaultCheckedKeys 输入 codes:', codes)
  
  // 递归遍历树，只勾选叶子节点
  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        // 有子节点，递归处理
        traverse(node.children)
      } else {
        // 叶子节点，检查是否在角色权限中（直接匹配后端格式）
        if (allCodes.has(node.code)) {
          checked.push(node.id)
        }
      }
    })
  }
  
  traverse(tree)
  
  console.log('[角色权限] getDefaultCheckedKeys 输出 checked:', checked)
  return checked
}

// 获取所有叶子节点的 id（用于全选）
const getAllLeafKeys = (tree) => {
  const keys = []
  const traverse = (nodes) => {
    nodes.forEach(node => {
      if (node.children && node.children.length > 0) {
        traverse(node.children)
      } else {
        keys.push(node.id)
      }
    })
  }
  traverse(tree)
  return keys
}

const selectRole = (role) => {
  selectedRole.value = role
  console.log('[角色权限] 选中角色:', role)
  console.log('[角色权限] 当前权限树:', permissionTree.value)
  
  // 判断是否是管理员角色
  const code = (role.code || '').toLowerCase()
  const name = (role.name || '').toLowerCase()
  const isAdmin = code === 'admin' || name === '管理员'
  
  // 管理员角色：全选所有权限
  if (isAdmin) {
    console.log('[角色权限] 管理员角色，全选所有权限')
    nextTick(() => {
      if (treeRef.value) {
        const allKeys = getAllLeafKeys(permissionTree.value)
        console.log('[角色权限] 全选keys:', allKeys)
        treeRef.value.setCheckedKeys(allKeys)
      }
    })
    return
  }
  
  // 其他角色：根据后端返回的权限勾选
  const perms = role.permissions || []
  console.log('[角色权限] 角色权限原始数据:', perms)
  
  if (perms.length > 0) {
    selectedPermissions.value = perms
    nextTick(() => {
      if (treeRef.value) {
        console.log('[角色权限] treeRef 存在，准备设置勾选')
        treeRef.value.setCheckedKeys([])
        // 根据后端返回的权限勾选对应节点
        const keys = getDefaultCheckedKeys(perms, permissionTree.value)
        console.log('[角色权限] 计算出的勾选keys:', keys)
        treeRef.value.setCheckedKeys(keys)
        console.log('[角色权限] 当前勾选的keys:', treeRef.value.getCheckedKeys())
      } else {
        console.error('[角色权限] treeRef 不存在！')
      }
    })
  } else {
    console.log('[角色权限] 权限为空，尝试拉取详情')
    getSystemRoleDetail(role.id).then(detail => {
      selectedPermissions.value = detail?.permissions || []
      nextTick(() => {
        if (treeRef.value) {
          const keys = getDefaultCheckedKeys(selectedPermissions.value, permissionTree.value)
          treeRef.value.setCheckedKeys(keys)
        }
      })
    })
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
    
    // 树节点的 id 已经是后端格式（如 dashboard），直接发送
    console.log('[角色权限] 准备保存权限:', {
      roleId: selectedRole.value.id,
      roleName: selectedRole.value.name,
      permissions: allKeys
    })
    
    await updateRolePermissions(selectedRole.value.id, allKeys)
    
    // 刷新当前用户的权限信息
    try {
      const me = await getCurrentUser()
      const response = me?.data ?? me
      // 后端返回 {user: {...}, permissions: [...]} 结构，需要合并
      const _user = response?.user ? { ...response.user, permissions: response.permissions } : response
      if (_user) {
        localStorage.setItem('userInfo', JSON.stringify(_user))
        console.log('[角色权限] 已更新本地用户权限信息:', _user)
        console.log('[角色权限] 用户角色:', _user.role)
        console.log('[角色权限] 用户权限:', _user.permissions)
      }
    } catch (e) {
      console.warn('[角色权限] 刷新用户权限失败', e)
    }
    
    ElMessage.success('权限保存成功，页面即将刷新')
    
    // 刷新页面以更新菜单
    setTimeout(() => {
      window.location.reload()
    }, 500)
    
  } catch (error) {
    console.error('[角色权限] 保存权限失败:', error)
    const status = error?.response?.status
    const msg = error?.response?.data?.message || error?.response?.data?.detail || '保存失败'
    
    if (status === 403) {
      ElMessage.error('您没有权限修改角色权限，请联系超级管理员')
    } else {
      ElMessage.error(msg)
    }
  }
}

const showAddRoleDialog = () => {
  roleForm.value = {
    name: '',
    code: generateRoleCode(),
    description: ''
  }
  openDialog('add')
}

const editRole = (role) => {
  roleForm.value = { ...role }
  openDialog('edit')
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
onMounted(async () => {
  // 先加载权限列表（确保树结构就绪）
  await loadPermissions()
  // 再加载角色列表
  await loadRoles()
  // 最后选择第一个角色
  if (roles.value.length > 0) {
    nextTick(() => {
      selectRole(roles.value[0])
    })
  }
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

/* 管理员角色禁用权限树编辑 */
.tree-disabled {
  pointer-events: none;
  opacity: 0.7;
}

.tree-disabled :deep(.el-checkbox) {
  cursor: not-allowed;
}
</style>