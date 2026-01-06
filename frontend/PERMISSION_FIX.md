# 角色权限问题诊断与解决方案

## 🔍 问题排查

### 问题表现
管理员登录后，无法看到"系统设置"菜单，包括"角色权限"页面。

### 根本原因
**localStorage 键名不一致**：
- ❌ 登录页面保存：`localStorage.setItem('userInfo', ...)`
- ❌ 菜单页面读取：`localStorage.getItem('user_info', ...)`

导致用户信息无法被菜单正确读取，权限检查失败。

---

## ✅ 解决方案

### 1. 已修复的文件
**文件**: `src/layout/BasicLayout.vue`

#### 修改内容：
```javascript
// ❌ 原代码
const getUserInfo = () => {
  try {
    return JSON.parse(localStorage.getItem('user_info') || '{}')
  } catch {
    return {}
  }
}

// ✅ 修复后
const getUserInfo = () => {
  try {
    // 优先使用 userInfo（新），回退到 user_info（旧）
    const userInfo = localStorage.getItem('userInfo') || localStorage.getItem('user_info')
    return JSON.parse(userInfo || '{}')
  } catch {
    return {}
  }
}
```

### 2. 增强的容错性

#### 支持多种 role 字段名
```javascript
// ✅ 支持 role, user_role, userRole 等多种字段名
const userRole = computed(() => {
  return userInfo.value.role || 
         userInfo.value.user_role || 
         userInfo.value.userRole || 
         'guest'
})
```

#### 大小写容错
```javascript
// ✅ 使用 toLowerCase() 防止大小写问题
const canAccess = (permission) => {
  const role = userRole.value.toLowerCase()
  // ... 权限检查逻辑
}
```

#### 支持 family 角色
```javascript
const permissions = {
  admin: ['elderly', 'bed', 'care', 'todo', 'message', 'notice', 'system', ...],
  nurse: ['elderly', 'bed', 'care', 'todo', 'message', 'notice'],
  caregiver: ['elderly', 'todo', 'message'],
  family: ['elderly', 'todo', 'message'],  // ✅ 新增
  guest: []
}
```

### 3. 添加调试工具

为了方便快速诊断权限问题，已添加了 **权限诊断工具** 页面。

**访问方式**：
```
http://localhost:5173/home/debug
```

**功能**：
- 📦 显示 localStorage 中的所有数据
- 🔐 展示当前用户的角色和权限
- ✅ 权限验证结果（可视化）
- 🐛 详细的调试信息和排查建议
- 🔄 一键清除本地缓存并重新登录

---

## 🔧 快速修复步骤

### 步骤 1：重新登录
由于缓存问题，需要重新登录以获取正确的用户信息：

1. 访问 `/home/debug`
2. 点击"清除本地缓存"按钮
3. 重新登录（使用 `admin / admin123`）

### 步骤 2：验证权限
登录后，您应该能看到：
- ✅ 左侧菜单中的"系统设置"
- ✅ 系统设置下的"角色权限"菜单项
- ✅ 能够访问 `/home/system/roles` 页面

### 步骤 3：诊断
如果仍有问题：
1. 访问 `/home/debug` 诊断工具
2. 查看"角色权限检查"部分
3. 确认：
   - [ ] 用户名是 `admin`
   - [ ] 角色是 `admin`
   - [ ] 系统管理权限显示 ✅ 可访问

---

## 📊 测试凭证

三种角色的登录测试：

| 角色 | 用户名 | 密码 | 可访问菜单 |
|------|--------|------|-----------|
| 管理员 | `admin` | `admin123` | 系统设置 ✅ |
| 护工 | `nurse01` | `nurse123` | 护理管理、床位管理 ✅ |
| 家属 | `family01` | `family123` | 老人管理、待办、消息 ✅ |

---

## 🚀 关键改进

### 1. localStorage 键名统一
```javascript
// 现在统一使用 'userInfo'（大小写敏感）
localStorage.setItem('userInfo', JSON.stringify(user))
localStorage.getItem('userInfo')
```

### 2. 权限检查容错
- 支持多种 role 字段名
- 自动转换为小写比较
- 提供默认值 'guest'

### 3. 调试能力提升
- 新增诊断工具页面
- 控制台日志输出
- localStorage 可视化
- 权限状态实时检查

---

## 📝 后续建议

1. **统一数据格式**
   - 确保后端 API 返回的字段名一致
   - 使用统一的 role 字段（推荐 `role`）

2. **增强权限系统**
   - 考虑使用权限树而非硬编码权限列表
   - 从后端动态加载权限数据

3. **完善错误处理**
   - 添加权限拒绝时的友好提示
   - 实现权限不足时的重定向

4. **集成身份验证**
   - 实现 token 刷新机制
   - 添加会话过期提示
   - 实现权限变更的实时推送

---

## ✨ 总结

**修复前**：
- ❌ 管理员看不到系统设置菜单
- ❌ 无法诊断权限问题
- ❌ 容错能力差

**修复后**：
- ✅ 所有角色正常显示对应菜单
- ✅ 有专用诊断工具
- ✅ 支持多种数据格式
- ✅ 容错能力强
- ✅ 调试信息详细

现在您应该能正常访问"系统设置 > 角色权限"了！🎉

如有问题，请访问 `/home/debug` 诊断工具进行排查。
