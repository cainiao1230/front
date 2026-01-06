<!-- src/views/debug/DebugInfo.vue - 权限诊断工具 -->
<template>
  <div class="debug-page">
    <el-card class="debug-card">
      <template #header>
        <div class="card-header">
          <span class="title">🔍 权限诊断工具</span>
          <el-button type="danger" size="small" @click="clearStorage">清除本地缓存</el-button>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="12">
          <div class="debug-section">
            <h3>📦 localStorage 数据</h3>
            <el-table :data="storageData" stripe>
              <el-table-column prop="key" label="键" width="150" />
              <el-table-column prop="value" label="值" show-overflow-tooltip />
            </el-table>
          </div>
        </el-col>

        <el-col :span="12">
          <div class="debug-section">
            <h3>🔐 角色权限检查</h3>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="用户名">{{ userInfo.username || '-' }}</el-descriptions-item>
              <el-descriptions-item label="真实姓名">{{ userInfo.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="角色">
                <el-tag type="primary">{{ userInfo.role || 'unknown' }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="系统管理">
                <el-tag :type="hasSystemAccess ? 'success' : 'danger'">
                  {{ hasSystemAccess ? '✅ 可访问' : '❌ 无权限' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="用户管理">
                <el-tag :type="hasUserAccess ? 'success' : 'danger'">
                  {{ hasUserAccess ? '✅ 可访问' : '❌ 无权限' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-col>
      </el-row>

      <div class="debug-section" style="margin-top: 20px;">
        <h3>✅ 权限验证结果</h3>
        <el-row :gutter="20">
          <el-col v-for="(status, permission) in permissionStatus" :key="permission" :span="6">
            <el-card class="permission-card">
              <div class="permission-name">{{ permission }}</div>
              <div class="permission-status" :class="{ 'has-access': status }">
                {{ status ? '✅ 可访问' : '❌ 无权限' }}
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="debug-section" style="margin-top: 20px;">
        <h3>🐛 调试信息</h3>
        <el-tree
          :data="debugInfo"
          node-key="id"
          :props="{ children: 'children', label: 'label' }"
          default-expand-all
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'

const userInfo = ref({})
const storageData = ref([])
const permissionStatus = ref({})
const debugInfo = ref([])

const hasSystemAccess = computed(() => {
  const role = (userInfo.value.role || '').toLowerCase()
  return role === 'admin'
})

const hasUserAccess = computed(() => {
  const role = (userInfo.value.role || '').toLowerCase()
  return ['admin', 'nurse'].includes(role)
})

const loadDebugInfo = () => {
  // 加载用户信息
  try {
    const userInfoFromStorage = localStorage.getItem('userInfo') || localStorage.getItem('user_info')
    userInfo.value = JSON.parse(userInfoFromStorage || '{}')
  } catch (e) {
    console.error('解析用户信息失败:', e)
  }

  // 加载 localStorage 数据
  const data = []
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      try {
        const value = localStorage.getItem(key)
        data.push({
          key,
          value: value.length > 100 ? value.substring(0, 100) + '...' : value
        })
      } catch (e) {
        data.push({ key, value: '(无法读取)' })
      }
    }
  }
  storageData.value = data

  // 计算权限状态
  const role = (userInfo.value.role || '').toLowerCase()
  const permissions = {
    system: role === 'admin',
    users: ['admin', 'nurse'].includes(role),
    roles: role === 'admin',
    logs: role === 'admin',
    elderly: ['admin', 'nurse', 'caregiver', 'family'].includes(role),
    bed: ['admin', 'nurse'].includes(role),
    care: ['admin', 'nurse', 'caregiver'].includes(role),
    medication: ['admin', 'nurse', 'caregiver'].includes(role),
    todo: ['admin', 'nurse', 'caregiver', 'family'].includes(role),
    messages: ['admin', 'nurse', 'caregiver', 'family'].includes(role)
  }
  permissionStatus.value = permissions

  // 调试信息树
  debugInfo.value = [
    {
      id: '1',
      label: '🔑 认证信息',
      children: [
        { id: '1-1', label: `access_token: ${localStorage.getItem('access_token')?.substring(0, 30) || 'null'}...` },
        { id: '1-2', label: `userInfo 存储位置: ${localStorage.getItem('userInfo') ? 'userInfo' : localStorage.getItem('user_info') ? 'user_info' : '不存在'}` }
      ]
    },
    {
      id: '2',
      label: '👤 用户信息',
      children: [
        { id: '2-1', label: `用户名: ${userInfo.value.username || '-'}` },
        { id: '2-2', label: `姓名: ${userInfo.value.name || '-'}` },
        { id: '2-3', label: `角色: ${userInfo.value.role || '-'}` },
        { id: '2-4', label: `邮箱: ${userInfo.value.email || '-'}` }
      ]
    },
    {
      id: '3',
      label: '🔐 权限检查',
      children: [
        { id: '3-1', label: `系统管理权限: ${hasSystemAccess.value ? '✅ 有' : '❌ 无'}` },
        { id: '3-2', label: `角色权限页面可见: ${role === 'admin' ? '✅ 是' : '❌ 否'}` },
        { id: '3-3', label: `canAccess('system'): ${role === 'admin' ? '✅ true' : '❌ false'}` }
      ]
    },
    {
      id: '4',
      label: '💡 排查建议',
      children: [
        { id: '4-1', label: role === 'admin' ? '✅ 您是管理员，应该能看到系统设置菜单' : '❌ 您不是管理员，无法看到系统设置菜单' },
        { id: '4-2', label: localStorage.getItem('userInfo') ? '✅ userInfo 已正确保存' : '❌ userInfo 未保存，请重新登录' },
        { id: '4-3', label: 'debug-info 页面已加载，查看浏览器控制台获取更多信息' }
      ]
    }
  ]
}

const clearStorage = () => {
  localStorage.clear()
  ElMessage.success('本地缓存已清除，请重新登录')
  setTimeout(() => {
    window.location.href = '/login'
  }, 1000)
}

onMounted(() => {
  loadDebugInfo()
  console.log('用户信息:', userInfo.value)
  console.log('权限状态:', permissionStatus.value)
})
</script>

<style scoped>
.debug-page {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100vh;
}

.debug-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.debug-section {
  margin: 20px 0;
}

.debug-section h3 {
  margin-top: 0;
  color: #303133;
  border-bottom: 2px solid #409eff;
  padding-bottom: 8px;
  font-size: 16px;
}

.permission-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.permission-card:hover {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.permission-name {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.permission-status {
  font-size: 16px;
  font-weight: 600;
  color: #f56c6c;
}

.permission-status.has-access {
  color: #67c23a;
}
</style>
