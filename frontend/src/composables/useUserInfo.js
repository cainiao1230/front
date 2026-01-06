// 用户信息管理
import { ref, computed } from 'vue'
import { USER_ROLES } from '@/utils/constants'

/**
 * 用户信息管理
 */
export function useUserInfo() {
  // 从 localStorage 获取用户信息
  const getUserInfo = () => {
    try {
      const userInfoStr = localStorage.getItem('userInfo')
      return userInfoStr ? JSON.parse(userInfoStr) : null
    } catch {
      return null
    }
  }
  
  const userInfo = ref(getUserInfo())
  
  // 是否已登录
  const isLoggedIn = computed(() => !!userInfo.value)
  
  // 用户角色
  const userRole = computed(() => userInfo.value?.role || '')
  
  // 用户名
  const userName = computed(() => userInfo.value?.name || '')
  
  // 用户ID
  const userId = computed(() => userInfo.value?.id || null)
  
  // 权限判断
  const isAdmin = computed(() => userRole.value === USER_ROLES.ADMIN)
  const isCaregiver = computed(() => userRole.value === USER_ROLES.CAREGIVER)
  const isFamily = computed(() => userRole.value === USER_ROLES.FAMILY)
  
  // 更新用户信息
  const updateUserInfo = (newUserInfo) => {
    userInfo.value = newUserInfo
    if (newUserInfo) {
      localStorage.setItem('userInfo', JSON.stringify(newUserInfo))
    } else {
      localStorage.removeItem('userInfo')
    }
  }
  
  // 清除用户信息
  const clearUserInfo = () => {
    userInfo.value = null
    localStorage.removeItem('userInfo')
    localStorage.removeItem('access_token')
  }
  
  return {
    userInfo,
    isLoggedIn,
    userRole,
    userName,
    userId,
    isAdmin,
    isCaregiver,
    isFamily,
    updateUserInfo,
    clearUserInfo
  }
}
