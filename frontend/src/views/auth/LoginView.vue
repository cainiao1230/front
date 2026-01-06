<!-- src/views/LoginView.vue -->
<template>
  <div class="login-page">
    <div class="login-card">
      <h2>智慧养老系统</h2>
      <p class="subtitle">请登录您的账户</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="input-group">
          <label for="username" class="label-text">用户名</label>
          <input
            id="username"
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            required
          />
        </div>

        <div class="input-group">
          <label for="password">密码</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            required
          />
        </div>

        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? '登录中...' : '立即登录' }}
        </button>

        <p v-if="error" class="error-message">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '@/api'
import { ElMessage } from 'element-plus'

// 响应式数据
const form = ref({
  username: '',
  password: ''
})
const loading = ref(false)
const error = ref('')
const router = useRouter()

// 登录方法
const handleLogin = async () => {
  loading.value = true
  error.value = ''

  try {
    // 调用统一的 API（支持 Mock 和真实后端切换）
    const response = await login({
      username: form.value.username,
      password: form.value.password
    })
    
    const { access_token, user } = response.data

    // ✅ 保存 token 和用户信息
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('userInfo', JSON.stringify(user))
    
    ElMessage.success('登录成功')
    router.push('/home')  // 登录成功后跳转到主页
  } catch (err) {
    // 优先使用后端返回的 detail 或 message
    error.value = err.response?.data?.detail || err.response?.data?.message || '用户名或密码错误'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>


.login-page {
  /* cover the entire viewport so the gradient can reach both edges
     regardless of parent centering or max-width rules */
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 48px 40px;
  background: linear-gradient(135deg, #f5f7ff 0%, #e6f3ff 100%);
  color: #1f2937;
}


/* login card base */
.login-card{
  position: relative;
  z-index: 1;
  background: #ffffff;
  padding: 40px 48px;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(31,41,55,0.06);
  width: 100%;
  max-width: 520px;
  text-align: center;
  box-sizing: border-box;
}

/* decorative halo / border using pseudo element (soft pastel) */
.login-card::before{
  content: '';
  position: absolute;
  top: -18px;
  left: -18px;
  right: -18px;
  bottom: -18px;
  z-index: -1;
  border-radius: 18px;
  background: linear-gradient(135deg, rgba(106,17,203,0.08) 0%, rgba(37,117,252,0.08) 100%);
  filter: blur(12px);
  opacity: 0.9;
}

.label-text {
  color: #374151;
  font-size: 14px;
}
.login-card h2 {
  margin: 0 0 8px;
  color: #222;
  font-size: 30px;
}

.subtitle {
  color: #6b7280;
  margin-bottom: 24px;
}

.input-group {
  margin-bottom: 20px;
  text-align: left;
}

.input-group label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  color: #444;
}

.input-group input {
  width: 100%;
  padding: 14px 12px;
  border: 1px solid #e6e9ee;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
  background: #ffffff;
  color: #0f1724;
}

.input-group input:focus {
  outline: none;
  border-color: #60a5fa;
  box-shadow: 0 8px 20px rgba(96,165,250,0.08);
}

.login-btn {
  width: 100%;
  padding: 14px;
  background: #2ea0ff;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease;
  box-shadow: 0 8px 24px rgba(46,160,255,0.16);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.login-btn:disabled {
  background: #dbeeff;
  cursor: not-allowed;
}

.error-message {
  color: #ef4444;
  margin-top: 12px;
  font-size: 14px;
}
</style>