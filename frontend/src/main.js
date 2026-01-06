// src/main.js
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import GlobalComponents from './components'

// 开发环境：自动登录为admin用户用于测试
if (!localStorage.getItem('userInfo')) {
  localStorage.setItem('userInfo', JSON.stringify({
    id: 1,
    username: 'admin',
    name: '管理员',
    role: 'admin',
    phone: '13800000001',
    email: 'admin@example.com'
  }))
  localStorage.setItem('access_token', 'mock-jwt-token-' + Date.now())
  console.log('✅ 开发环境已自动注入admin用户')
}

// -----------------------------
// 创建并挂载应用
// -----------------------------
const app = createApp(App)

app.use(router)
app.use(ElementPlus)
app.use(GlobalComponents) // 注册全局组件

app.mount('#app')