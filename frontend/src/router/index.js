// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/auth/LoginView.vue'
import HomeView from '@/views/dashboard/HomeView.vue'
import BasicLayout from '@/layout/BasicLayout.vue'
import component from 'element-plus/es/components/tree-select/src/tree-select-option.mjs'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/home',
    component: BasicLayout,
    children: [
      { 
        path: '', 
        component: HomeView,
        meta: { requiresAuth: true }
      },
      // 老人管理相关路由
      { 
        path: 'elderlies/list', 
        component: () => import('@/views/elderly/ElderlyList.vue'),
        meta: { requiresAuth: true, title: '老人列表' }
      },
      { 
        path: 'elderlies/search', 
        component: () => import('@/views/elderly/ElderlySearch.vue'),
        meta: { requiresAuth: true, title: '快速查看老人' }
      },
      { 
        path: 'elderlies/add', 
        component: () => import('@/views/elderly/ElderlyAdd.vue'),
        meta: { requiresAuth: true, title: '新增老人' }
      },
      // 床位管理相关路由
      { 
        path: 'beds/floor', 
        component: () => import('@/views/bed/BedFloor.vue'),
        meta: { requiresAuth: true, title: '各楼层床位使用情况' }
      },
      { 
        path: 'beds/list', 
        component: () => import('@/views/bed/BedList.vue'),
        meta: { requiresAuth: true, title: '床位列表' }
      },
      { 
        path: 'beds/history', 
        component: () => import('@/views/bed/BedHistory.vue'),
        meta: { requiresAuth: true, title: '床位调整记录' }
      },
      { 
        path: 'beds/allocate', 
        component: () => import('@/views/bed/BedAllocate.vue'),
        meta: { requiresAuth: true, title: '床位分配' }
      },
      // 护理管理相关路由
      { 
        path: 'care/tasks', 
        component: () => import('@/views/care/CareTasks.vue'),
        meta: { requiresAuth: true, title: '护理任务' }
      },
      { 
        path: 'care/records', 
        component: () => import('@/views/care/CareRecords.vue'),
        meta: { requiresAuth: true, title: '护理记录' }
      },
      { 
        path: 'care/medication', 
        component: () => import('@/views/care/CareMedication.vue'),
        meta: { requiresAuth: true, title: '用药管理' }
      },
      // 待办事项
      { 
        path: 'todo', 
        component: () => import('@/views/task/TodoView.vue'),
        meta: { requiresAuth: true, title: '我的待办' }
      },
      // 消息中心
      { 
        path: 'messages', 
        component: () => import('@/views/message/MessageView.vue'),
        meta: { requiresAuth: true, title: '消息中心' }
      },
      // 公告通知
      { 
        path: 'notices', 
        component: () => import('@/views/notice/NoticeView.vue'),
        meta: { requiresAuth: true, title: '公告通知' }
      },
      // 系统设置
      { 
        path: 'system/users', 
        component: () => import('@/views/system/SystemUsers.vue'),
        meta: { requiresAuth: true, title: '用户管理' }
      },
      { 
        path: 'system/roles', 
        component: () => import('@/views/system/SystemRoles.vue'),
        meta: { requiresAuth: true, title: '角色权限' }
      },
      { 
        path: 'system/logs', 
        component: () => import('@/views/system/SystemLogs.vue'),
        meta: { requiresAuth: true, title: '操作日志' }
      },
      // 个人中心
      { 
        path: 'profile', 
        component: () => import('@/views/user/ProfileView.vue'),
        meta: { requiresAuth: true, title: '个人中心' }
      },
      { 
        path: 'settings', 
        component: () => import('@/views/user/SettingsView.vue'),
        meta: { requiresAuth: true, title: '账户设置' }
      },
      // 今日护理安排
      { 
        path: 'tasks/today', 
        component: () => import('@/views/task/TasksToday.vue'),
        meta: { requiresAuth: true, title: '今日护理安排' }
      },
      // 🐛 调试工具
      { 
        path: 'debug', 
        component: () => import('@/views/debug/DebugInfo.vue'),
        meta: { requiresAuth: true, title: '权限诊断' }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局导航守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 智慧养老系统`
  }
  
  // 检查是否需要认证
  if (to.meta.requiresAuth) {
    const token = localStorage.getItem('access_token')
    if (token) {
      next()
    } else {
      next('/login')
    }
  } else {
    next()
  }
})

export default router