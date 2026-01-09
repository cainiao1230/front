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
                      ref="treeRef"
                      :expand-on-click-node="false"
                      :check-strictly="false"
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

// 将权限列表按 code 点分割构建树（page.module → page.module.subpage）
const permissionTree = computed(() => {
  console.log('[角色权限] 生成权限树，permissions.value:', permissions.value)
  const tree = []
  const map = {}
  const parentCodes = new Set()
  
  // 定义显示顺序（按导航栏顺序）
  const orderMap = {
    'page.dashboard': 1,
    'page.elderly': 2,
    'page.bed': 3,
    'page.care': 4,
    'page.medication': 5,
    'page.todo': 6,
    'page.message': 7,
    'page.notice': 8,
    'page.system': 9,
    'page.log': 10
  }
  
  // 第一遍：识别哪些是父节点（有子节点的2段code）
  permissions.value.forEach(perm => {
    const code = perm.code || perm || ''
    const parts = String(code).split('.')
    if (parts.length === 3) {
      const parentCode = parts.slice(0, 2).join('.')
      parentCodes.add(parentCode)
    }
  })
  
  // 自定义排序：按 orderMap 定义的顺序，未定义的按字母顺序
  const sorted = [...permissions.value].sort((a, b) => {
    const codeA = a.code || a || ''
    const codeB = b.code || b || ''
    const partsA = String(codeA).split('.')
    const partsB = String(codeB).split('.')
    
    // 提取一级code (page.xxx)
    const rootA = partsA.slice(0, 2).join('.')
    const rootB = partsB.slice(0, 2).join('.')
    
    const orderA = orderMap[rootA] || 999
    const orderB = orderMap[rootB] || 999
    
    // 先按一级排序
    if (orderA !== orderB) {
      return orderA - orderB
    }
    // 同一级内按 code 字母顺序
    return codeA.localeCompare(codeB)
  })
  
  // 第二遍：构建树
  sorted.forEach(perm => {
    const code = perm.code || perm || ''
    const parts = String(code).split('.')
    
    if (parts.length === 2) {
      if (parentCodes.has(code)) {
        // 这是一个真正的父节点（有子节点）
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
        // 这是一个没有子节点的叶子节点
        tree.push({
          id: code,
          code: code,
          label: perm.name || code,
          description: perm.description || ''
        })
      }
    } else if (parts.length === 3) {
      // 子节点
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
        // 父节点不存在，直接加到根
        tree.push({
          id: code,
          code: code,
          label: perm.name || code,
          description: perm.description || ''
        })
      }
    }
  })
  
  console.log('[角色权限] 权限树结构:', tree)
  console.log('[角色权限] 父节点集合:', Array.from(parentCodes))
  return tree
})

const {
  dialogVisible,
  dialogMode,
  openDialog
} = useDialog()

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

// 只勾选叶子节点（三段code）或无子节点的一级节点
const getDefaultCheckedKeys = (rolePerms, tree) => {
  const checked = []
  // 兼容字符串数组和对象数组
  const codes = rolePerms.map(p => typeof p === 'string' ? p : p.code)
  const allCodes = new Set(codes)
  
  console.log('[角色权限] getDefaultCheckedKeys 输入:', codes)
  
  tree.forEach(parent => {
    if (parent.children && parent.children.length > 0) {
      // 有子节点，只检查子节点
      parent.children.forEach(child => {
        if (allCodes.has(child.code)) {
          checked.push(child.id)
        }
      })
    } else {
      // 无子节点的父节点直接勾选
      if (allCodes.has(parent.code)) {
        checked.push(parent.id)
      }
    }
  })
  
  console.log('[角色权限] getDefaultCheckedKeys 输出:', checked)
  return checked
}

const selectRole = (role) => {
  selectedRole.value = role
  console.log('[角色权限] 选中角色:', role)
  console.log('[角色权限] 当前权限树:', permissionTree.value)
  
  // 使用后端返回的权限编码（如果没有，则尝试拉取详情）
  const perms = role.permissions || []
  console.log('[角色权限] 角色权限原始数据:', perms)
  console.log('[角色权限] 角色权限类型:', typeof perms[0], perms[0])
  
  if (perms.length > 0) {
    selectedPermissions.value = perms
    nextTick(() => {
      if (treeRef.value) {
        console.log('[角色权限] treeRef 存在，准备设置勾选')
        treeRef.value.setCheckedKeys([])
        // 使用新逻辑：只勾选叶子节点
        const keys = getDefaultCheckedKeys(perms, permissionTree.value)
        console.log('[角色权限] 计算出的勾选keys:', keys)
        treeRef.value.setCheckedKeys(keys)
        console.log('[角色权限] 已调用 setCheckedKeys')
        // 验证是否真的设置成功
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
    
    await updateRolePermissions(selectedRole.value.id, allKeys)
    
    // 无论是否当前用户角色，都刷新本地权限（因为可能同时在线）
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      const userInfo = userInfoStr ? JSON.parse(userInfoStr) : null
      
      // 刷新当前用户的最新权限
      if (userInfo) {
        const me = await getCurrentUser()
        const _user = me?.data ?? me
        if (_user) {
          localStorage.setItem('userInfo', JSON.stringify(_user))
          ElMessage.success('权限保存成功，页面即将刷新')
          // 延迟刷新，让用户看到成功提示
          setTimeout(() => {
            window.location.reload()
          }, 800)
          return
        }
      }
    } catch {}
    
    ElMessage.success('权限保存成功')
  } catch (error) {
    const msg = error?.response?.data?.message || error?.response?.data?.detail || '保存失败'
    ElMessage.error(msg)
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
</style>