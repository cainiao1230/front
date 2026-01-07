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
        <el-menu-item index="/home">
          <el-icon><House /></el-icon>
          <template #title>首页</template>
        </el-menu-item>

        <!-- 老人管理（带子菜单） -->
                <el-sub-menu 
          v-if="canAccess('elderly')" 
          index="elderly"
        >
          <template #title>
            <el-icon><User /></el-icon>
            <span>老人管理</span>
          </template>
          
          <el-menu-item index="/home/elderlies/list">
            <el-icon><List /></el-icon>
            <template #title>老人列表</template>
          </el-menu-item>
          
          <el-menu-item index="/home/elderlies/search">
            <el-icon><Search /></el-icon>
            <template #title>快速查看老人</template>
          </el-menu-item>
          
          <el-menu-item index="/home/tasks/today">
            <el-icon><Clock /></el-icon>
            <template #title>今日护理安排</template>
          </el-menu-item>
          
          <el-menu-item v-if="canAccess('elderly_add')" index="/home/elderlies/approvals">
            <el-icon><CirclePlus /></el-icon>
            <template #title>住房申请审批</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 床位管理（带子菜单） -->
                <el-sub-menu 
          v-if="canAccess('bed')" 
          index="bed"
        >
          <template #title>
            <el-icon><OfficeBuilding /></el-icon>
            <span>床位管理</span>
          </template>
          
          <el-menu-item index="/home/beds/floor">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>各楼层床位使用情况</template>
          </el-menu-item>
          
          <el-menu-item index="/home/beds/list">
            <el-icon><List /></el-icon>
            <template #title>床位列表</template>
          </el-menu-item>
          
          <el-menu-item index="/home/beds/history">
            <el-icon><Histogram /></el-icon>
            <template #title>床位调整记录</template>
          </el-menu-item>
          
          <el-menu-item v-if="canAccess('bed_manage')" index="/home/beds/allocate">
            <el-icon><Setting /></el-icon>
            <template #title>床位分配</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 护理管理（护士/管理员可见） -->
                <el-sub-menu 
          v-if="canAccess('care')" 
          index="care"
        >
          <template #title>
            <el-icon><FirstAidKit /></el-icon>
            <span>护理管理</span>
          </template>
          
          <el-menu-item index="/home/care/tasks">
            <el-icon><List /></el-icon>
            <template #title>护理任务</template>
          </el-menu-item>
          
          <el-menu-item index="/home/care/records">
            <el-icon><Notebook /></el-icon>
            <template #title>护理记录</template>
          </el-menu-item>
          
          <el-menu-item index="/home/care/medication">
            <el-icon><Box /></el-icon>
            <template #title>用药管理</template>
          </el-menu-item>
        </el-sub-menu>

        <!-- 我的待办（带徽章） -->
        <el-menu-item v-if="canAccess('todo')" index="/home/todo">
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
        <el-menu-item v-if="canAccess('message')" index="/home/messages">
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
        <el-menu-item v-if="canAccess('notice')" index="/home/notices">
          <el-icon><Bell /></el-icon>
          <template #title>公告通知</template>
        </el-menu-item>

        <!-- 系统设置（仅管理员可见） -->
                <el-sub-menu 
          v-if="canAccess('system')" 
          index="system"
        >
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统设置</span>
          </template>
          
          <el-menu-item index="/home/system/users">
            <el-icon><UserFilled /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          
          <el-menu-item index="/home/system/roles">
            <el-icon><Lock /></el-icon>
            <template #title>角色权限</template>
          </el-menu-item>
          
          <el-menu-item index="/home/system/logs">
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

// 🔐 角色权限控制
const userInfo = ref({})
const userRole = computed(() => {
  // 支持多种 role 字段名：role, user_role, userRole
  return userInfo.value.role || userInfo.value.user_role || userInfo.value.userRole || 'guest'
})

// 权限检查函数
const canAccess = (permission) => {
  const role = userRole.value.toLowerCase()
  
  console.log('🔍 权限检查:', {
    permission,
    userRole: role,
    userInfo: userInfo.value
  })
  
  const permissions = {
    admin: ['elderly', 'bed', 'care', 'todo', 'message', 'notice', 'system', 'elderly_add', 'bed_manage'],
    nurse: ['elderly', 'bed', 'care', 'todo', 'message', 'notice'],
    caregiver: ['elderly', 'care', 'todo', 'message'],
    family: ['elderly', 'todo', 'message'],
    guest: []
  }
  
  const hasAccess = permissions[role]?.includes(permission) || false
  console.log(`   结果: ${hasAccess ? '✅ 允许' : '❌ 拒绝'}`)
  
  return hasAccess
}

// 用户角色文本
const userRoleText = computed(() => {
  const roleMap = {
    admin: '管理员',
    nurse: '护士',
    caregiver: '护工',
    family: '家属',
    guest: '访客'
  }
  return roleMap[userRole.value.toLowerCase()] || '未知角色'
})

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
const userName = computed(() => userInfo.value.name || '用户')
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
    const user = getUserInfo()
    if (!user.id) return
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // 模拟数据
    const mockCounts = {
      'U001': 3,  // 管理员
      'U002': 5,  // 护士
      'U003': 2   // 护工
    }
    
    todoCount.value = mockCounts[user.id] || 0
  } catch (error) {
    console.error('加载待办数量失败:', error)
    todoCount.value = 0
  }
}

// 加载消息数量
const loadMessageCount = async () => {
  try {
    const user = getUserInfo()
    if (!user.id) return
    
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const mockCounts = {
      'U001': 2,
      'U002': 1,
      'U003': 0
    }
    
    messageCount.value = mockCounts[user.id] || 0
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

// 初始化用户信息
const initUserInfo = () => {
  userInfo.value = getUserInfo()
  console.log('🔐 用户信息已加载:', userInfo.value)
  console.log('👤 用户角色:', userRole.value)
  console.log('📋 角色(小写):', userRole.value.toLowerCase())
  console.log('✅ 权限检查结果:', {
    system: canAccess('system'),
    bed: canAccess('bed'),
    care: canAccess('care'),
    elderly: canAccess('elderly'),
    todo: canAccess('todo')
  })
  
  // 如果没有用户信息，提示重新登录
  if (!userInfo.value || !userInfo.value.id) {
    console.warn('⚠️ 未找到用户信息，请重新登录')
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
  
  // 停止轮询
  stopPolling()
  
  // 跳转到登录页
  router.push('/login')
}

// 生命周期钩子
onMounted(() => {
  // 初始化用户信息
  initUserInfo()
  
  // 加载初始数据
  loadTodoCount()
  loadMessageCount()
  
  // 启动轮询
  startPolling()
  
  
})

onUnmounted(() => {
  // 停止轮询
  stopPolling()
})


</script>
<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  background: #222528;
  color: #fff;
  position: relative;
}



.sidebar {
  width: 240px;
  background: #2d3a4b;
  color: white;
  box-shadow: inset -1px 0 0 rgba(0, 0, 0, 0.2);
  /* transition: width 0.3s ease; */
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
  background: linear-gradient(90deg, #334155, #22303f);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  /* transition: opacity 0.2s; */
}

.logo:hover {
  opacity: 0.8;
}

.logo-text {
  font-weight: 700;
  font-size: 16px;
  color: #fff;
}

.collapse-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  cursor: pointer;
  /* transition: background-color 0.2s; */
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.user-info {
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.user-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
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
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.main-menu {
  flex: 1;
  border-right: none !important;
  background: transparent !important;
}

:deep(.main-menu .el-menu-item),
:deep(.main-menu .el-sub-menu__title) {
  background-color: #1a1a1a;
  height: 48px;
  line-height: 48px;
  color: rgba(255, 255, 255, 0.9) !important;
  /* transition: all 0.2s; */
}


:deep(.main-menu .el-menu-item.is-active) {
  background: rgba(64, 158, 255, 0.2) !important;
  color: #409eff !important;
  border-right: 3px solid #409eff;
}

:deep(.main-menu .el-icon) {
  color: inherit;
  margin-right: 12px;
}

:deep(.main-menu .el-sub-menu .el-menu-item) {
  padding-left: 50px !important;
}

.todo-badge,
.message-badge {
  margin-right: 12px;
}

:deep(.todo-badge .el-badge__content),
:deep(.message-badge .el-badge__content) {
  transform: scale(0.8);
  transform-origin: 100% 0;
}

.todo-count-text,
.message-count-text {
  margin-left: 4px;
  font-size: 12px;
  color: #f56c6c;
}

.message-count-text {
  color: #409eff;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.quick-action-btn {
  width: 100%;
  margin-bottom: 16px;
  background: rgba(64, 158, 255, 0.1) !important;
  border-color: rgba(64, 158, 255, 0.3) !important;
  color: #409eff !important;
}

.quick-action-btn:hover {
  background: rgba(64, 158, 255, 0.2) !important;
}

.logout-section {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.2s;
  color: rgba(255, 255, 255, 0.8);
}

.logout-section:hover {
  background: rgba(255, 255, 255, 0.05);
  color: #fff;
}



.right-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.header {
  background: #334155;
  color: #fff;
  padding: 0 20px;
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  height: 60px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
  z-index: 1000;
}


.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto; /* 👈 关键：推到最右边 */
}

.header-todo-badge,
.header-message-badge {
  margin-right: 0;
}

:deep(.header-todo-badge .el-badge__content),
:deep(.header-message-badge .el-badge__content) {
  transform: scale(0.8);
  transform-origin: 100% 0;
}

.header-action-btn {
  color: rgba(255, 255, 255, 0.8) !important;
  padding: 8px !important;
}

.header-action-btn:hover {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.1) !important;
}

.badge-text {
  margin-left: 4px;
  font-size: 12px;
}

.user-dropdown-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 6px;
  /* transition: background-color 0.2s; */
}

.user-dropdown-trigger:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-weight: 600;
}

.header-user-name {
  font-size: 14px;
  font-weight: 500;
}

:deep(.user-dropdown .el-icon) {
  margin-right: 8px;
}

.main-content {
  --el-main-padding: 0;
  padding: 0;
  flex: 1;
  overflow: auto;
  background: #f5f7fa;
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
    background: #1a1a1a;
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
  animation: slideIn 0.3s ease-out;
}

.main-menu :deep(.el-menu-item:nth-child(1)) { animation-delay: 0.1s; }
.main-menu :deep(.el-menu-item:nth-child(2)) { animation-delay: 0.2s; }
.main-menu :deep(.el-menu-item:nth-child(3)) { animation-delay: 0.3s; }
.main-menu :deep(.el-menu-item:nth-child(4)) { animation-delay: 0.4s; }
.main-menu :deep(.el-menu-item:nth-child(5)) { animation-delay: 0.5s; }

:focus-visible {
  outline: 2px solid #409eff;
  outline-offset: 2px;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>
