<!-- src/layout/BasicLayout.vue -->
<template>
      <el-container class="layout">
    <!-- 左侧导航栏 -->
    <el-aside  
      :width="sidebarWidth" 
      class="sidebar"
      :class="{ 'sidebar-collapsed': isCollapsed }"
    >
      <!-- 顶部Logo区域 -->
      <div class="logo-section">
        <div class="logo" @click="goToHome">
          <el-icon v-if="isCollapsed" :size="24"><HomeFilled /></el-icon>
          <template v-else>
            <el-icon :size="20"><HomeFilled /></el-icon>
            <span class="logo-text">智慧养老系统</span>
          </template>
        </div>
        
                <!-- 折叠/展开按钮 -->
        <div class="collapse-btn" @click="toggleCollapse">
          <el-icon :size="16">
            <component :is="isCollapsed ? Expand : Fold" />
          </el-icon>
        </div>
      </div>

      <!-- 用户信息区域 -->
      <div class="user-info" v-if="!isCollapsed">
        <el-avatar :size="40" :src="userAvatar" class="user-avatar">
          {{ userInitials }}
        </el-avatar>
        <div class="user-details">
          <div class="user-name">{{ userName }}</div>
          <div class="user-role">{{ userRoleText }}</div>
        </div>
      </div>

      <!-- 主菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :collapse-transition="false"
        router
        class="main-menu"
        @select="handleMenuSelect"
      >
        <!-- 首页 -->
        <el-menu-item v-if="hasPerm('page.dashboard')" index="/home">
          <el-icon><House /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <!-- 老人管理（带子菜单） -->
                <el-sub-menu 
                  v-if="hasPerm('page.elderly')" 
          index="elderly"
        >
          <template #title>
            <el-icon><User /></el-icon>
            <span>老人管理</span>
          </template>
          
          <el-menu-item v-if="hasPerm('page.elderly.list')" index="/home/elderlies/list">
            <el-icon><List /></el-icon>
            <template #title>老人列表</template>
          </el-menu-item>
          
          <el-menu-item v-if="hasPerm('page.elderly.quick')" index="/home/elderlies/search">
            <el-icon><Search /></el-icon>
            <template #title>快速查看老人</template>
          </el-menu-item>
          
          <el-menu-item index="/home/tasks/today">
            <el-icon><Clock /></el-icon>
            <template #title>今日护理安排</template>
          </el-menu-item>
          
          <el-menu-item v-if="hasPerm('page.elderly.pending')" index="/home/elderlies/approvals">
            <el-icon><CirclePlus /></el-icon>
            <template #title>住房申请审批</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 床位管理（带子菜单） -->
                <el-sub-menu 
                  v-if="hasPerm('page.bed')" 
          index="bed"
        >
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>床位管理</span>
          </template>
          
          <el-menu-item v-if="hasPerm('page.bed')" index="/home/beds/floor">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>各楼层床位使用情况</template>
          </el-menu-item>
          
          <el-menu-item v-if="hasPerm('page.bed.list')" index="/home/beds/list">
            <el-icon><List /></el-icon>
            <template #title>床位列表</template>
          </el-menu-item>
          
          <el-menu-item v-if="hasPerm('page.bed.history')" index="/home/beds/history">
            <el-icon><Histogram /></el-icon>
            <template #title>床位调整记录</template>
          </el-menu-item>
          
          <el-menu-item v-if="hasPerm('page.bed.allocate')" index="/home/beds/allocate">
            <el-icon><Setting /></el-icon>
            <template #title>床位分配</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 护理管理（护士/管理员可见） -->
                <el-sub-menu 
                  v-if="hasPerm('page.care') || hasPerm('page.care.tasks') || hasPerm('page.care.records')" 
          index="care"
        >
          <template #title>
            <el-icon><FirstAidKit /></el-icon>
            <span>护理管理</span>
          </template>
          
          <el-menu-item v-if="hasPerm('page.care.tasks')" index="/home/care/tasks">
            <el-icon><List /></el-icon>
            <template #title>护理任务</template>
          </el-menu-item>
          
          <el-menu-item v-if="hasPerm('page.care.records')" index="/home/care/records">
            <el-icon><Notebook /></el-icon>
            <template #title>护理记录</template>
          </el-menu-item>
          
          <el-menu-item v-if="hasPerm('page.medication')" index="/home/care/medication">
            <el-icon><Box /></el-icon>
            <template #title>用药管理</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 我的待办（带徽章） -->
        <el-menu-item v-if="hasPerm('page.todo')" index="/home/todo">
          <el-badge 
            :value="todoCount" 
            :max="9" 
            :hidden="todoCount === 0"
            type="danger"
            class="todo-badge"
          >
            <el-icon><Checked /></el-icon>
          </el-badge>
          <template #title>
            <span>我的待办</span>
            <span v-if="todoCount > 0 && !isCollapsed" class="todo-count-text">
              ({{ todoCount > 9 ? '9+' : todoCount }})
            </span>
          </template>
        </el-menu-item>

        <!-- 消息中心（带徽章） -->
        <el-menu-item v-if="hasPerm('page.message')" index="/home/messages">
          <el-badge 
            :value="messageCount" 
            :max="9" 
            :hidden="messageCount === 0"
            type="primary"
            class="message-badge"
          >
            <el-icon><Message /></el-icon>
          </el-badge>
          <template #title>
            <span>消息中心</span>
            <span v-if="messageCount > 0 && !isCollapsed" class="message-count-text">
              ({{ messageCount > 9 ? '9+' : messageCount }})
            </span>
          </template>
        </el-menu-item>

        <!-- 公告通知 -->
        <el-menu-item v-if="hasPerm('page.notice')" index="/home/notices">
          <el-icon><Bell /></el-icon>
          <template #title>公告通知</template>
        </el-menu-item>

        <!-- 系统设置（仅管理员可见） -->
                <el-sub-menu 
                  v-if="hasPerm('page.system') || hasPerm('page.system.users') || hasPerm('page.system.roles')" 
          index="system"
        >
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          
          <el-menu-item v-if="hasPerm('page.system.users')" index="/home/system/users">
            <el-icon><UserFilled /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          
          <el-menu-item v-if="hasPerm('page.system.roles')" index="/home/system/roles">
            <el-icon><Lock /></el-icon>
            <template #title>角色权限</template>
          </el-menu-item>
          
          <el-menu-item v-if="hasPerm('page.log')" index="/home/system/logs">
            <el-icon><Document /></el-icon>
            <template #title>操作日志</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>

      <!-- 底部操作区域 -->
      <div class="sidebar-footer" v-if="!isCollapsed">
        <el-button 
          type="primary" 
          plain 
          class="quick-action-btn"
          @click="goToQuickAdd"
        >
          <el-icon><CirclePlus /></el-icon>
          快速新增老人
        </el-button>
        
        <el-divider />
        
        <div class="logout-section" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </div>
      </div>
    </el-aside>


    <!-- 主内容区域 -->
    <el-container direction="vertical" class="right-container">
      <el-header height="60px" class="header">

        <!-- 顶部右侧操作区 -->
        <div class="header-right">
          <!-- 待办事项快捷入口 -->
          <el-badge 
            :value="todoCount" 
            :max="9" 
            :hidden="todoCount === 0"
            type="danger"
            class="header-todo-badge"
          >
            <el-button 
              type="text" 
              @click="goToTodo"
              class="header-action-btn"
            >
              <el-icon><Checked /></el-icon>
              <span v-if="todoCount > 0" class="badge-text">
                {{ todoCount > 9 ? '9+' : todoCount }}
              </span>
            </el-button>
          </el-badge>

          <!-- 消息快捷入口 -->
          <el-badge 
            :value="messageCount" 
            :max="9" 
            :hidden="messageCount === 0"
            type="primary"
            class="header-message-badge"
          >
            <el-button 
              type="text" 
              @click="goToMessages"
              class="header-action-btn"
            >
              <el-icon><Message /></el-icon>
              <span v-if="messageCount > 0" class="badge-text">
                {{ messageCount > 9 ? '9+' : messageCount }}
              </span>
            </el-button>
          </el-badge>

          <!-- 用户下拉菜单 -->
          <el-dropdown @command="handleUserCommand" class="user-dropdown">
            <div class="user-dropdown-trigger">
              <el-avatar :size="32" :src="userAvatar" class="header-avatar">
                {{ userInitials }}
              </el-avatar>
              <span class="header-user-name">{{ userName }}</span>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><User /></el-icon>
                  个人中心
                </el-dropdown-item>
                <el-dropdown-item command="settings">
                  <el-icon><Setting /></el-icon>
                  账户设置
                </el-dropdown-item>
                <el-dropdown-item divided command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCurrentUser } from '@/api'
import {
  // 图标
  HomeFilled,
  Expand,
  Fold,
  House,
  User,
  List,
  Search,
  Clock,
  CirclePlus,
  OfficeBuilding,
  DataAnalysis,
  Histogram,
  Setting,
  FirstAidKit,
  Notebook,
  Box,
  Checked,
  Message,
  Bell,
  UserFilled,
  Lock,
  Document,
  SwitchButton,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()

// 🔐 权限控制（基于后端返回的权限 code）
const userInfo = ref({})
const allowedCodes = ref(new Set())

// 后端格式 → 前端格式：dashboard → page.dashboard
const toFrontendCode = (code) => {
  if (!code) return code
  return code.startsWith('page.') ? code : `page.${code}`
}

const hasPerm = (code) => {
  if (!code) return true
  // 管理员角色直接显示所有菜单
  if ((userInfo.value?.role || '').toLowerCase() === 'admin') {
    return true
  }
  // 检查权限集合
  if (!allowedCodes.value || allowedCodes.value.size === 0) {
    // 若没有权限数据，检查是否已加载用户信息
    // 如果已有用户信息但无权限，说明后端未返回permissions，此时不应放行
    if (userInfo.value && userInfo.value.id) {
      return false // 有用户但无权限数据，拒绝
    }
    return true // 尚未加载用户信息，暂时放行
  }
  return allowedCodes.value.has(code)
}

// 用户角色文本
const userRole = computed(() => userInfo.value?.role || userInfo.value?.user_role || userInfo.value?.userRole || 'guest')
const userRoleText = computed(() => {
  if (userInfo.value?.displayRole || userInfo.value?.roleName) {
    return userInfo.value.displayRole || userInfo.value.roleName
  }
  const roleMap = {
    admin: '管理员',
    nurse: '护士',
    caregiver: '护工',
    family: '家属',
    guest: '访客'
  }
  return roleMap[(userRole.value || 'guest').toLowerCase()] || '未知角色'
})

// 初始化用户信息与权限
onMounted(async () => {
  // 先同步加载用户信息（确保页面立即显示正确的用户名和角色）
  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      userInfo.value = JSON.parse(userInfoStr)
    } catch (e) {
      console.error('[BasicLayout] 解析用户信息失败:', e)
      userInfo.value = {}
    }
  }
  
  console.log('[BasicLayout] 加载的用户信息:', userInfo.value)
  console.log('[BasicLayout] 用户名:', userInfo.value?.username || userInfo.value?.name)
  console.log('[BasicLayout] 角色:', userInfo.value?.role)
  console.log('[BasicLayout] 权限数量:', userInfo.value?.permissions?.length || 0)
  
  // 后端返回的权限码转换为前端格式：dashboard → page.dashboard
  const codes = (userInfo.value?.permissions || []).map(p => {
    const code = typeof p === 'string' ? p : p.code
    return toFrontendCode(code)
  })
  allowedCodes.value = new Set(codes)
  
  console.log('[BasicLayout] 解析出的权限码 (转换后):', Array.from(allowedCodes.value))
  
  // 若本地无权限数据，尝试拉取最新用户信息
  if (allowedCodes.value.size === 0) {
    try {
      console.log('[BasicLayout] 本地无权限，尝试调用 /api/auth/me')
      const me = await getCurrentUser()
      const response = me?.data ?? me
      console.log('[BasicLayout] /api/auth/me 返回:', response)
      // 后端返回 {user: {...}, permissions: [...]} 结构，需要合并
      const _user = response?.user ? { ...response.user, permissions: response.permissions } : response
      if (_user) {
        localStorage.setItem('userInfo', JSON.stringify(_user))
        userInfo.value = _user
        const newCodes = (_user.permissions || []).map(p => {
          const code = typeof p === 'string' ? p : p.code
          return toFrontendCode(code)
        })
        allowedCodes.value = new Set(newCodes)
        console.log('[BasicLayout] 更新后的权限码 (转换后):', Array.from(allowedCodes.value))
      }
    } catch (err) {
      console.error('[BasicLayout] 拉取用户信息失败:', err)
    }
  }
  
  // 加载初始数据
  loadTodoCount()
  loadMessageCount()
  
  // 启动轮询
  startPolling()
}) // 闭合 onMounted

// 🔔 待办事项徽章
const todoCount = ref(0)
const messageCount = ref(0)
let todoInterval = null
let messageInterval = null

// 布局
const isCollapsed = ref(false)
const sidebarWidth = computed(() => isCollapsed.value ? '64px' : '240px')

// 切换折叠状态
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 用户信息
const userName = computed(() => userInfo.value.username || userInfo.value.name || userInfo.value.nickname || '用户')
const userAvatar = computed(() => userInfo.value.avatar || '')
const userInitials = computed(() => {
  const name = userName.value
  if (name.length >= 2) {
    return name.substring(0, 2)
  }
  return name.charAt(0) || 'U'
})

// 当前激活菜单
const activeMenu = computed(() => route.path)



// 🚀 加载待办数量
const loadTodoCount = async () => {
  try {
    if (!userInfo.value?.id) return
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟数据
    const mockCounts = {
      'U001': 3,  // 管理员
      'U002': 5,  // 护士
      'U003': 2   // 护工
    }
    
    todoCount.value = mockCounts[userInfo.value.id] || 0
  } catch (error) {
    console.error('加载待办数量失败:', error)
    todoCount.value = 0
  }
}

// 加载消息数量
const loadMessageCount = async () => {
  try {
    if (!userInfo.value?.id) return
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const mockCounts = {
      'U001': 2,
      'U002': 1,
      'U003': 0
    }
    
    messageCount.value = mockCounts[userInfo.value.id] || 0
  } catch (error) {
    console.error('加载消息数量失败:', error)
    messageCount.value = 0
  }
}

// 获取用户信息
const getUserInfo = () => {
  try {
    // 优先使用 userInfo（新），回退到 user_info（旧）
    const userInfo = localStorage.getItem('userInfo') || localStorage.getItem('user_info')
    return JSON.parse(userInfo || '{}')
  } catch {
    return {}
  }
}

// 启动轮询
const startPolling = () => {
  // 每30秒轮询一次待办数量
  todoInterval = setInterval(() => {
    loadTodoCount()
  }, 30000)
  
  // 每60秒轮询一次消息数量
  messageInterval = setInterval(() => {
    loadMessageCount()
  }, 60000)
}

// 停止轮询
const stopPolling = () => {
  if (todoInterval) clearInterval(todoInterval)
  if (messageInterval) clearInterval(messageInterval)
}

// 🛠️ 用户操作
const handleMenuSelect = (index) => {
  // 记录菜单点击（可用于统计）
  console.log('菜单点击:', index)
}

const goToHome = () => {
  router.push('/home')
}

const goToTodo = () => {
  router.push('/todo')
}

const goToMessages = () => {
  router.push('/messages')
}

const goToQuickAdd = () => {
  router.push('/home/elderlies/add')
}

const handleUserCommand = (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const handleLogout = () => {
  // 清除本地存储
  localStorage.removeItem('access_token')
  localStorage.removeItem('user')
  localStorage.removeItem('userInfo')
  
  // 停止轮询
  stopPolling()
  
  // 跳转到登录页
  router.push('/login')
}

onUnmounted(() => {
  // 停止轮询
  stopPolling()
})


</script>
<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  position: relative;
}

.layout::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3), transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 117, 140, 0.3), transparent 50%),
    radial-gradient(circle at 40% 20%, rgba(64, 224, 208, 0.2), transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.sidebar {
  width: 240px;
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  color: white;
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 1px 0 0 rgba(255, 255, 255, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  z-index: 2000;
  position: relative;
  overflow: visible !important;
}

.sidebar-collapsed {
  width: 64px;
}

.logo-section {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.logo-section::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.logo-section:hover::after {
  opacity: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.logo:hover {
  transform: scale(1.05);
}

.logo-text {
  font-weight: 700;
  font-size: 16px;
  color: #fff;
  background: linear-gradient(135deg, #fff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.collapse-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.collapse-btn:hover {
  background: rgba(102, 126, 234, 0.3);
  transform: rotate(180deg);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.user-info::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.5s;
}

.user-info:hover::before {
  left: 100%;
}

.user-info:hover {
  background: rgba(255, 255, 255, 0.05);
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
  box-shadow: 
    0 4px 12px rgba(102, 126, 234, 0.4),
    0 0 20px rgba(118, 75, 162, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.user-info:hover .user-avatar {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 
    0 6px 16px rgba(102, 126, 234, 0.6),
    0 0 30px rgba(118, 75, 162, 0.3);
}

.user-details {
  flex: 1;
  overflow: hidden;
}

.user-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #fff;
  letter-spacing: 0.3px;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.2));
  padding: 2px 8px;
  border-radius: 4px;
  display: inline-block;
}

.main-menu {
  flex: 1;
  border-right: none !important;
  background: transparent !important;
  padding: 8px 0;
}

:deep(.main-menu .el-menu-item),
:deep(.main-menu .el-sub-menu__title) {
  background-color: transparent;
  height: 48px;
  line-height: 48px;
  color: rgba(255, 255, 255, 0.8) !important;
  margin: 4px 12px;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

:deep(.main-menu .el-menu-item::before),
:deep(.main-menu .el-sub-menu__title::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 4px 4px 0;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.main-menu .el-menu-item:hover),
:deep(.main-menu .el-sub-menu__title:hover) {
  background: rgba(102, 126, 234, 0.15) !important;
  color: #fff !important;
  transform: translateX(4px);
}

:deep(.main-menu .el-menu-item:hover::before),
:deep(.main-menu .el-sub-menu__title:hover::before) {
  height: 24px;
}

:deep(.main-menu .el-menu-item.is-active) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3) 0%, rgba(118, 75, 162, 0.3) 100%) !important;
  color: #fff !important;
  border: none;
  box-shadow: 
    0 4px 12px rgba(102, 126, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

:deep(.main-menu .el-menu-item.is-active::before) {
  height: 32px;
}

:deep(.main-menu .el-icon) {
  color: inherit;
  margin-right: 12px;
  font-size: 18px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.main-menu .el-menu-item:hover .el-icon),
:deep(.main-menu .el-sub-menu__title:hover .el-icon) {
  transform: scale(1.1);
}

:deep(.main-menu .el-sub-menu .el-menu-item) {
  padding-left: 50px !important;
  margin: 2px 12px;
  height: 40px;
  line-height: 40px;
}

:deep(.main-menu .el-sub-menu__icon-arrow) {
  color: rgba(255, 255, 255, 0.5);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.main-menu .el-sub-menu.is-opened .el-sub-menu__icon-arrow) {
  color: rgba(255, 255, 255, 0.8);
}

.todo-badge,
.message-badge {
  margin-right: 12px;
  position: relative;
}

:deep(.todo-badge .el-badge__content),
:deep(.message-badge .el-badge__content) {
  transform: scale(0.85);
  transform-origin: 100% 0;
  background: linear-gradient(135deg, #f56c6c 0%, #ff4757 100%);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.2);
  animation: pulse 2s ease-in-out infinite;
}

:deep(.message-badge .el-badge__content) {
  background: linear-gradient(135deg, #409eff 0%, #2d8cf0 100%);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.4);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(0.85);
    opacity: 1;
  }
  50% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

.todo-count-text,
.message-count-text {
  margin-left: 4px;
  font-size: 12px;
  color: #f56c6c;
  font-weight: 600;
}

.message-count-text {
  color: #409eff;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.02);
}

.quick-action-btn {
  width: 100%;
  margin-bottom: 16px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%) !important;
  border: 1px solid rgba(102, 126, 234, 0.3) !important;
  color: #fff !important;
  height: 40px;
  border-radius: 10px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.quick-action-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.quick-action-btn:hover::before {
  width: 300px;
  height: 300px;
}

.quick-action-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.4) 0%, rgba(118, 75, 162, 0.4) 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.logout-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: rgba(255, 255, 255, 0.7);
  position: relative;
  overflow: hidden;
}

.logout-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(239, 68, 68, 0.2), transparent);
  transition: left 0.5s;
}

.logout-section:hover::before {
  left: 100%;
}

.logout-section:hover {
  background: rgba(239, 68, 68, 0.15);
  color: #fff;
  transform: translateX(4px);
}



.right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #1e293b;
  padding: 0 24px;
  display: flex;
  align-items: center;
  height: 60px;
  box-shadow: 
    0 1px 3px rgba(0, 0, 0, 0.05),
    0 1px 2px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.header-todo-badge,
.header-message-badge {
  margin-right: 0;
}

:deep(.header-todo-badge .el-badge__content),
:deep(.header-message-badge .el-badge__content) {
  transform: scale(0.85);
  transform-origin: 100% 0;
  background: linear-gradient(135deg, #f56c6c 0%, #ff4757 100%);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

:deep(.header-message-badge .el-badge__content) {
  background: linear-gradient(135deg, #409eff 0%, #2d8cf0 100%);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.header-action-btn {
  color: #64748b !important;
  padding: 8px !important;
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-action-btn:hover {
  color: #667eea !important;
  background: rgba(102, 126, 234, 0.1) !important;
  transform: scale(1.05);
}

.badge-text {
  margin-left: 4px;
  font-size: 12px;
  font-weight: 600;
}

.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(102, 126, 234, 0.05);
  border: 1px solid rgba(102, 126, 234, 0.1);
}

.user-dropdown-trigger:hover {
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
}

.header-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  border: 2px solid #fff;
}

.header-user-name {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

:deep(.user-dropdown .el-icon) {
  margin-right: 8px;
}

.main-content {
  --el-main-padding: 0;
  padding: 0;
  flex: 1;
  overflow: auto;
  background: #f8fafc;
}



@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }
  
  .sidebar-collapsed {
    width: 64px;
  }
  
  .logo-text {
    font-size: 14px;
  }
  
  .user-name {
    font-size: 13px;
  }
  
  .user-role {
    font-size: 11px;
  }
}

@media print {
  .sidebar,
  .header {
    display: none !important;
  }
  
  .right-container {
    margin-left: 0 !important;
  }
}

@media (prefers-color-scheme: dark) {
  .main-content {
    background: #0f172a;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.main-menu :deep(.el-menu-item),
.main-menu :deep(.el-sub-menu__title) {
  animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1) backwards;
}

.main-menu :deep(.el-menu-item:nth-child(1)) { animation-delay: 0.05s; }
.main-menu :deep(.el-menu-item:nth-child(2)) { animation-delay: 0.1s; }
.main-menu :deep(.el-menu-item:nth-child(3)) { animation-delay: 0.15s; }
.main-menu :deep(.el-menu-item:nth-child(4)) { animation-delay: 0.2s; }
.main-menu :deep(.el-menu-item:nth-child(5)) { animation-delay: 0.25s; }
.main-menu :deep(.el-menu-item:nth-child(6)) { animation-delay: 0.3s; }
.main-menu :deep(.el-menu-item:nth-child(7)) { animation-delay: 0.35s; }
.main-menu :deep(.el-menu-item:nth-child(8)) { animation-delay: 0.4s; }

:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
  border-radius: 8px;
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.5) 0%, rgba(118, 75, 162, 0.5) 100%);
  border-radius: 4px;
  transition: background 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.7) 0%, rgba(118, 75, 162, 0.7) 100%);
}

/* 子菜单展开动画 */
:deep(.el-menu--inline) {
  background: rgba(255, 255, 255, 0.03) !important;
  border-radius: 8px;
  margin: 4px 12px;
}

:deep(.el-sub-menu__title:hover) {
  background: rgba(102, 126, 234, 0.15) !important;
}

/* 折叠状态下的tooltip样式 */
:deep(.el-tooltip__popper) {
  background: rgba(15, 23, 42, 0.95) !important;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 8px 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

:deep(.el-tooltip__popper[x-placement^="right"] .el-popper__arrow::before) {
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 添加光晕效果 */
.logo-section,
.user-info,
.sidebar-footer {
  position: relative;
}

.logo-section::before,
.user-info::before,
.sidebar-footer::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.logo-section:hover::before,
.user-info:hover::before {
  opacity: 1;
}
</style>
