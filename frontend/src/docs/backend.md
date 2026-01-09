# 前端权限配置页面实现需求

## 1. 功能概述
实现一个角色权限配置页面，左侧展示角色列表，右侧展示该角色可访问的页面（树形复选框）。管理员默认全部勾选，其他角色部分勾选。用户可以点击复选框修改权限，点击"保存权限"按钮提交修改。

## 2. 后端接口说明

### 2.1 获取所有权限（页面列表）
**接口**: `GET /api/permissions` 或 `GET /api/roles/permissions`  
**返回示例**:
```json
{
  "code": 200,
  "message": "权限列表",
  "data": [
    { "code": "page.dashboard", "name": "首页", "description": "首页/仪表盘" },
    { "code": "page.elderly", "name": "老人管理", "description": "老人管理模块" },
    { "code": "page.elderly.list", "name": "老人列表", "description": "老人列表页面" },
    { "code": "page.elderly.pending", "name": "待审批老人", "description": "待审批老人列表" },
    { "code": "page.elderly.quick", "name": "快速查看老人", "description": "快速查看老人信息" },
    { "code": "page.bed", "name": "床位管理", "description": "床位管理模块" },
    { "code": "page.bed.list", "name": "床位列表", "description": "床位列表页面" },
    { "code": "page.bed.allocate", "name": "床位分配", "description": "床位分配页面" },
    { "code": "page.bed.history", "name": "床位历史", "description": "床位变更历史" },
    { "code": "page.care", "name": "护理管理", "description": "护理管理模块" },
    { "code": "page.care.tasks", "name": "护理任务", "description": "护理任务页面" },
    { "code": "page.care.records", "name": "护理记录", "description": "护理记录页面" },
    { "code": "page.medication", "name": "用药管理", "description": "用药管理页面" },
    { "code": "page.todo", "name": "我的待办", "description": "待办事项页面" },
    { "code": "page.message", "name": "消息中心", "description": "消息中心页面" },
    { "code": "page.notice", "name": "公告通知", "description": "公告通知页面" },
    { "code": "page.system", "name": "系统设置", "description": "系统设置模块" },
    { "code": "page.system.users", "name": "用户管理", "description": "用户管理页面" },
    { "code": "page.system.roles", "name": "角色权限", "description": "角色权限配置页面" },
    { "code": "page.log", "name": "操作日志", "description": "操作日志页面" }
  ]
}
```

### 2.2 获取角色列表
**接口**: `GET /api/roles`  
**返回示例**:
```json
{
  "code": 200,
  "message": "角色列表",
  "data": [
    {
      "id": 1,
      "name": "系统管理员",
      "code": "admin",
      "description": "系统管理员，拥有所有权限",
      "permissions": [
        { "code": "page.dashboard", "name": "首页", "description": "首页/仪表盘" },
        { "code": "page.elderly", "name": "老人管理", "description": "老人管理模块" },
        // ... 包含所有20个权限
      ]
    },
    {
      "id": 2,
      "name": "护士",
      "code": "nurse",
      "description": "护士，负责老人护理和管理",
      "permissions": [
        { "code": "page.dashboard", "name": "首页", "description": "首页/仪表盘" },
        { "code": "page.elderly", "name": "老人管理", "description": "老人管理模块" },
        { "code": "page.elderly.list", "name": "老人列表", "description": "老人列表页面" },
        // ... 部分权限
      ]
    },
    {
      "id": 3,
      "name": "护工",
      "code": "caregiver",
      "description": "护工，负责日常护理工作",
      "permissions": [ /* ... */ ]
    },
    {
      "id": 4,
      "name": "家属",
      "code": "family",
      "description": "家属，查看关联老人信息",
      "permissions": [ /* ... */ ]
    }
  ]
}
```

### 2.3 获取单个角色详情
**接口**: `GET /api/roles/{id}`  
**返回示例**: 同角色列表中的单个对象

### 2.4 保存角色权限
**接口**: `PUT /api/roles/{id}/permissions`  
**请求体**:
```json
{
  "permissions": [
    "page.dashboard",
    "page.elderly",
    "page.elderly.list",
    "page.elderly.pending",
    "page.bed",
    "page.bed.list"
  ]
}
```
**说明**: permissions 数组包含所有选中的权限 code（包括父节点和子节点）

**返回示例**:
```json
{
  "code": 200,
  "message": "角色权限已更新",
  "data": {
    "id": 2,
    "name": "护士",
    "code": "nurse",
    "permissions": [ /* 更新后的权限列表 */ ]
  }
}
```

## 3. 权限 code 命名规则
- **一级页面**: `page.{模块名}` (如 `page.dashboard`, `page.elderly`)
- **二级页面**: `page.{模块名}.{子页面}` (如 `page.elderly.list`, `page.bed.allocate`)

## 4. 树形结构构建逻辑
根据权限 code 的点分割自动构建父子关系：
- `page.elderly` 是父节点
- `page.elderly.list`, `page.elderly.pending`, `page.elderly.quick` 是其子节点

完整树形结构示例：
```
├─ 首页 (page.dashboard)
├─ 老人管理 (page.elderly)
│  ├─ 老人列表 (page.elderly.list)
│  ├─ 待审批老人 (page.elderly.pending)
│  └─ 快速查看老人 (page.elderly.quick)
├─ 床位管理 (page.bed)
│  ├─ 床位列表 (page.bed.list)
│  ├─ 床位分配 (page.bed.allocate)
│  └─ 床位历史 (page.bed.history)
├─ 护理管理 (page.care)
│  ├─ 护理任务 (page.care.tasks)
│  └─ 护理记录 (page.care.records)
├─ 用药管理 (page.medication)
├─ 我的待办 (page.todo)
├─ 消息中心 (page.message)
├─ 公告通知 (page.notice)
├─ 系统设置 (page.system)
│  ├─ 用户管理 (page.system.users)
│  └─ 角色权限 (page.system.roles)
└─ 操作日志 (page.log)
```

## 5. 页面布局要求
- **左侧**: 角色列表（垂直排列，可点击切换）
- **右侧**: 
  - 顶部显示当前角色名称（如"系统管理员 - 权限配置"）
  - 树形复选框展示该角色可访问的页面
  - 底部"保存权限"按钮

## 6. 交互逻辑
1. **初始加载**: 
   - 调用 `GET /api/roles` 获取所有角色
   - 调用 `GET /api/permissions` 获取所有权限
   - 将权限列表转为树形结构

2. **点击角色**:
   - 切换选中状态（高亮）
   - 调用 `GET /api/roles/{id}` 获取该角色详情（含权限）
   - 根据 permissions 数组勾选树形复选框

3. **复选框操作**:
   - 支持父子联动（勾选父节点自动勾选所有子节点，取消同理）
   - 半选中状态（部分子节点勾选时父节点显示半选）

4. **保存权限**:
   - 获取所有选中的节点 code（包括父节点和子节点）
   - 调用 `PUT /api/roles/{id}/permissions` 提交
   - 成功后提示"权限保存成功"，重新加载角色数据

## 7. 特殊说明
- **管理员角色**: permissions 数组包含所有 20 个权限，树形复选框全部勾选
- **其他角色**: 根据后端返回的 permissions 数组部分勾选
- **复选框状态初始化**: 
  - 只勾选叶子节点（三层 code，如 `page.elderly.list`）
  - 如果父节点没有子节点（如 `page.dashboard`），直接勾选父节点
  - 这样可以避免父节点和子节点重复导致的显示问题

## 8. 技术栈建议
- **Vue 3 + Element Plus**: 使用 `el-tree` 组件，设置 `show-checkbox` 属性
- **React + Ant Design**: 使用 `Tree` 组件，设置 `checkable` 属性
- **状态管理**: 需要维护当前选中角色、所有权限、树形结构等状态

## 9. 代码实现参考（Vue 3 + Element Plus）

### 9.1 树形结构转换函数
### 9.1 树形结构转换函数（按菜单顺序）
```javascript
function buildPermissionTree(permissions) {
  // 定义菜单顺序（与左侧导航栏一致）
  const menuOrder = [
    'page.dashboard',
    'page.elderly',
    'page.elderly.list',
    'page.elderly.pending', 
    'page.elderly.quick',
    'page.bed',
    'page.bed.list',
    'page.bed.allocate',
    'page.bed.history',
    'page.care',
    'page.care.tasks',
    'page.care.records',
    'page.medication',
    'page.todo',
    'page.message',
    'page.notice',
    'page.system',
    'page.system.users',
    'page.system.roles',
    'page.log'
  ];
  
  // 创建权限映射
  const permMap = {};
  permissions.forEach(perm => {
    permMap[perm.code] = perm;
  });
  
  // 按定义的顺序构建树
  const tree = [];
  const parentMap = {};
  
  menuOrder.forEach(code => {
    const perm = permMap[code];
    if (!perm) return; // 如果权限不存在则跳过
    
    const parts = code.split('.');
    
    if (parts.length === 2) {
      // 一级菜单
      const node = {
        code: perm.code,
        label: perm.name,
        description: perm.description,
        children: []
      };
      tree.push(node);
      parentMap[perm.code] = node;
    } else if (parts.length === 3) {
      // 二级菜单
      const parentCode = parts.slice(0, 2).join('.');
      const parent = parentMap[parentCode];
      if (parent) {
        parent.children.push({
          code: perm.code,
          label: perm.name,
          description: perm.description
        });
      }
    }
  });
  
  return tree;
}
```

**说明**：
- `menuOrder` 数组定义了权限的展示顺序，与左侧导航栏完全一致
- 如果后续菜单顺序有调整，只需修改这个数组即可
- 建议将 `menuOrder` 提取到单独的配置文件中，与路由配置保持同步

### 9.2 复选框默认勾选逻辑
```javascript
function getDefaultCheckedKeys(rolePermissions, allPermissions) {
  const checkedKeys = [];
  const permissionCodes = rolePermissions.map(p => p.code);
  
  permissionCodes.forEach(code => {
    const parts = code.split('.');
    
    if (parts.length === 3) {
      // 子页面，直接勾选
      checkedKeys.push(code);
    } else if (parts.length === 2) {
      // 父节点，检查是否有子节点
      const hasChildren = allPermissions.some(
        p => p.code.startsWith(code + '.')
      );
      if (!hasChildren) {
        // 无子节点的一级页面，直接勾选
        checkedKeys.push(code);
      }
    }
  });
  
  return checkedKeys;
}
```

### 9.3 保存权限时获取所有选中节点
```javascript
function savePermissions() {
  // treeRef 是 el-tree 的 ref
  const checkedKeys = treeRef.value.getCheckedKeys(); // 完全选中的节点
  const halfCheckedKeys = treeRef.value.getHalfCheckedKeys(); // 半选中的节点
  const allChecked = [...checkedKeys, ...halfCheckedKeys];
  
  // 提交到后端
  await axios.put(`/api/roles/${selectedRole.value.id}/permissions`, {
    permissions: allChecked
  });
}
```

## 10. 完整页面布局示例（HTML）
```html
<div class="permission-config-page">
  <!-- 左侧角色列表 -->
  <div class="role-list-panel">
    <h3>角色列表</h3>
    <div class="role-list">
      <div 
        v-for="role in roles" 
        :key="role.id"
        :class="['role-item', { active: selectedRole?.id === role.id }]"
        @click="selectRole(role)"
      >
        <div class="role-name">{{ role.name }}</div>
        <div class="role-desc">{{ role.description }}</div>
      </div>
    </div>
  </div>
  
  <!-- 右侧权限配置 -->
  <div class="permission-panel">
    <div class="panel-header">
      <h3>{{ selectedRole?.name }} - 权限配置</h3>
    </div>
    
    <div class="tree-container">
      <el-tree
        ref="treeRef"
        :data="permissionTree"
        :props="{ label: 'label', children: 'children' }"
        node-key="code"
        show-checkbox
        :default-checked-keys="checkedPermissions"
        default-expand-all
      />
    </div>
    
    <div class="panel-footer">
      <el-button type="primary" @click="savePermissions">
        保存权限
      </el-button>
    </div>
  </div>
</div>
```

## 11. 样式建议
```css
.permission-config-page {
  display: flex;
  gap: 20px;
  padding: 20px;
  height: calc(100vh - 100px);
}

.role-list-panel {
  width: 250px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.role-item {
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
}

.role-item:hover {
  background: #f5f7fa;
}

.role-item.active {
  background: #409eff;
  color: white;
}

.permission-panel {
  flex: 1;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px 0;
}

.panel-footer {
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: right;
}
```

## 12. 各角色默认权限说明

### 系统管理员 (admin)
拥有所有 20 个权限，全部勾选

### 护士 (nurse)
- 首页 ✓
- 老人管理 ✓（包含所有子页面）
- 床位管理 ✓（包含所有子页面）
- 护理管理 ✓（包含所有子页面）
- 用药管理 ✓
- 我的待办 ✓
- 消息中心 ✓
- 公告通知 ✓
- 操作日志 ✓

### 护工 (caregiver)
- 首页 ✓
- 老人管理（部分）：老人列表 ✓、快速查看老人 ✓
- 床位管理（部分）：床位列表 ✓、床位历史 ✓
- 护理管理 ✓（包含所有子页面）
- 用药管理 ✓
- 我的待办 ✓
- 消息中心 ✓
- 公告通知 ✓

### 家属 (family)
- 首页 ✓
- 老人管理（部分）：老人列表 ✓
- 护理记录 ✓
- 用药管理 ✓
- 消息中心 ✓
- 公告通知 ✓

## 13. 常见问题处理

### Q1: 父节点和子节点都勾选了怎么办？
A: 保存时提交所有选中节点（包括父节点和半选中节点），后端会自动去重处理。

### Q2: 如何处理权限变更后的路由控制？
A: 建议在前端路由守卫中根据当前用户的权限列表动态过滤可访问路由。

### Q3: 树形复选框的父子联动如何实现？
A: Element Plus 的 el-tree 组件默认支持父子联动，无需额外处理。如果需要自定义联动逻辑，可以监听 @check 事件。

## 14. 接口错误处理
- **401**: Token 过期或未登录，跳转登录页
- **403**: 无权限访问，提示"无权限操作"
- **404**: 角色不存在，提示"角色不存在"
- **500**: 服务器错误，提示"保存失败，请稍后重试"
