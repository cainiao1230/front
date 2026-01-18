# 前端API需求文档

> **生成日期**: 2026-01-18
> **目的**: 告知后端团队前端已实现的功能及其依赖的API接口

---

## 📋 API 总览

| 模块 | 接口数量 | 状态 |
|------|----------|------|
| 认证模块 | 3 | ✅ 已对接 |
| 仪表盘模块 | 2 | ⚠️ 部分对接 |
| 老人管理模块 | 7 | ⚠️ 部分对接 |
| 床位管理模块 | 8 | ⚠️ 部分对接 |
| 护理管理模块 | 8 | ⚠️ 部分对接 |
| 待办事项模块 | 5 | ✅ 已对接 |
| 通知公告模块 | 5 | ⚠️ 待确认 |
| 消息模块 | 6 | ⚠️ 待确认 |
| 系统管理模块 | 12 | ⚠️ 部分对接 |

---

## 1. 认证模块

### 1.1 用户登录
- **接口**: `POST /api/auth/login`
- **前端文件**: `src/views/auth/LoginView.vue`
- **状态**: ✅ 已对接

**请求体**:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**期望响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "管理员",
      "role": "admin",
      "permissions": ["system", "elderly", "bed", ...]
    }
  }
}
```

### 1.2 获取当前用户信息
- **接口**: `GET /api/auth/me`
- **前端文件**: `src/layout/BasicLayout.vue`
- **状态**: ✅ 已对接

**期望响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "role": "admin",
    "permissions": ["system", "elderly", ...]
  }
}
```

### 1.3 用户登出
- **接口**: `POST /api/auth/logout`
- **状态**: ✅ 已对接

---

## 2. 仪表盘模块

### 2.1 获取仪表盘统计数据
- **接口**: `GET /api/dashboard/stats`
- **前端文件**: `src/views/dashboard/HomeView.vue`
- **状态**: ✅ 已对接

**期望响应**:
```json
{
  "code": 0,
  "data": {
    "elderly": {
      "total": 50,
      "pending": 5,
      "inResidence": 40,
      "discharged": 5
    },
    "beds": {
      "total": 100,
      "free": 40,
      "occupied": 55,
      "maintenance": 5,
      "occupancyRate": 55.0
    },
    "tasks": {
      "todayTotal": 20,
      "todayCompleted": 15,
      "todayPending": 5,
      "completionRate": 75.0
    }
  }
}
```

### 2.2 获取各楼层床位统计 🆕
- **接口**: `GET /api/beds/floor-stats`
- **前端文件**: `src/views/dashboard/HomeView.vue`
- **状态**: ⚠️ 需要后端实现

**期望响应**:
```json
{
  "code": 200,
  "data": [
    {
      "floor": "1F",
      "total": 10,
      "occupied": 6,
      "free": 3,
      "maintenance": 1,
      "locked": 0,
      "usage_rate": 60
    },
    {
      "floor": "2F",
      "total": 10,
      "occupied": 4,
      "free": 5,
      "maintenance": 1,
      "locked": 0,
      "usage_rate": 40
    }
  ]
}
```

---

## 3. 老人管理模块

### 3.1 查询老人列表
- **接口**: `GET /api/elderly`
- **前端文件**: `src/views/elderly/ElderlyList.vue`
- **状态**: ✅ 已对接

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| page_size | int | 否 | 每页数量，默认10 |
| status | string | 否 | 状态：pending/in/out |
| care_level | string | 否 | 护理等级：self_care/semi_care/full_care |
| name | string | 否 | 姓名模糊搜索 |

### 3.2 搜索老人 🆕
- **接口**: `GET /api/elderly/search`
- **前端文件**: `src/views/elderly/ElderlySearch.vue`
- **状态**: ✅ 已对接

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | string | 是 | 搜索关键词（姓名/电话/身份证号） |

**期望响应**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "张大爷",
        "gender": "male",
        "birthday": "1945-03-15",
        "phone": "13800138000",
        "id_number": "110101194503150011",
        "care_level": "semi_care",
        "status": "in",
        "bed_id": 1,
        "emergency_contact_name": "张华",
        "emergency_contact_phone": "13600136000",
        "medical_history": "高血压",
        "admission_date": "2025-12-22T02:46:20"
      }
    ]
  }
}
```

### 3.3 获取老人详情 🆕
- **接口**: `GET /api/elderly/{id}`
- **前端文件**: `src/views/elderly/ElderlyDetail.vue`
- **状态**: ⚠️ 需要后端确认

**期望响应**:
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "name": "张大爷",
    "gender": "male",
    "birthday": "1945-03-15",
    "phone": "13800138000",
    "id_number": "110101194503150011",
    "care_level": "semi_care",
    "status": "in",
    "bed_id": 1,
    "emergency_contact_name": "张华",
    "emergency_contact_phone": "13600136000",
    "medical_history": "高血压",
    "allergies": "青霉素",
    "notes": "需要定期测量血压",
    "applied_at": "2025-12-20T10:00:00",
    "admission_date": "2025-12-22T02:46:20"
  }
}
```

### 3.4 新增老人申请
- **接口**: `POST /api/elderly`
- **前端文件**: `src/views/elderly/ElderlyAdd.vue`
- **状态**: ✅ 已对接

**请求体**:
```json
{
  "name": "李奶奶",
  "gender": "female",
  "birthday": "1948-05-20",
  "phone": "13800138001",
  "id_number": "110101194805200022",
  "care_level": "full_care",
  "emergency_contact_name": "李明",
  "emergency_contact_phone": "13900139001",
  "medical_history": "糖尿病",
  "allergies": "",
  "notes": ""
}
```

### 3.5 更新老人信息 🆕
- **接口**: `PUT /api/elderly/{id}`
- **前端文件**: `src/views/elderly/ElderlyEdit.vue`
- **状态**: ⚠️ 需要后端确认

**请求体**: 同新增，不含id

### 3.6 审批老人入住 - 通过
- **接口**: `POST /api/elderly/{id}/approve`
- **前端文件**: `src/views/elderly/HousingApproval.vue`
- **状态**: ✅ 已对接

**请求体**:
```json
{
  "bedId": 5
}
```

### 3.7 审批老人入住 - 拒绝
- **接口**: `POST /api/elderly/{id}/reject`
- **前端文件**: `src/views/elderly/HousingApproval.vue`
- **状态**: ✅ 已对接

**请求体**:
```json
{
  "reason": "床位已满"
}
```

---

## 4. 床位管理模块

### 4.1 查询床位列表
- **接口**: `GET /api/beds`
- **前端文件**: `src/views/bed/BedList.vue`
- **状态**: ✅ 已对接

**请求参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态：free/occupied/maintenance/locked |
| floor | string | 楼层 |
| page | int | 页码 |
| page_size | int | 每页数量 |

### 4.2 更新床位状态
- **接口**: `PATCH /api/beds/{id}/status`
- **前端文件**: `src/views/bed/BedList.vue`
- **状态**: ⚠️ 需要后端确认

**请求体**:
```json
{
  "status": "maintenance"
}
```

### 4.3 分配床位
- **接口**: `POST /api/beds/{id}/assign`
- **前端文件**: `src/views/bed/BedAllocate.vue`
- **状态**: ⚠️ 需要后端确认

**请求体**:
```json
{
  "elderlyId": 5
}
```

### 4.4 释放床位（改为空闲状态）
- **接口**: `PATCH /api/beds/{id}/status`
- **前端调用**: `releaseBed(bedId)` → 设置 status 为 "free"
- **状态**: ⚠️ 需要后端确认

### 4.5 床位分配历史
- **接口**: `GET /api/beds/history`
- **前端文件**: `src/views/bed/BedHistory.vue`
- **状态**: ⚠️ 需要后端确认

---

## 5. 护理管理模块

### 5.1 查询护理记录
- **接口**: `GET /api/care/records`
- **前端文件**: `src/views/care/CareRecords.vue`
- **状态**: ✅ 已对接（elderly_id 已改为可选）

**请求参数**:
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| elderly_id | long | **否** | 老人ID（不传则返回所有） |
| care_type | string | 否 | 护理类型 |
| start_date | date | 否 | 开始日期 |
| end_date | date | 否 | 结束日期 |
| page | int | 否 | 页码 |
| page_size | int | 否 | 每页数量 |

### 5.2 创建护理记录
- **接口**: `POST /api/care/records`
- **状态**: ✅ 已对接

**请求体**:
```json
{
  "elderly_id": 1,
  "care_type": "daily",
  "care_content": "协助洗漱、更换衣物",
  "care_time": "2026-01-18T08:00:00",
  "remarks": ""
}
```

### 5.3 查询护理任务
- **接口**: `GET /api/care/tasks`
- **前端文件**: `src/views/care/CareTasks.vue`
- **状态**: ✅ 已对接

### 5.4 获取今日任务
- **接口**: `GET /api/care/tasks/today`
- **前端文件**: `src/views/dashboard/HomeView.vue`, `src/views/task/TasksToday.vue`
- **状态**: ⚠️ 需要后端确认

**期望响应**:
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "elderly_id": 1,
        "elderly_name": "张大爷",
        "title": "测量血压",
        "scheduled_time": "2026-01-18T08:00:00",
        "assigned_to": 2,
        "assigned_to_name": "护士小王",
        "status": "pending"
      }
    ]
  }
}
```

### 5.5 更新任务状态
- **接口**: `PATCH /api/care/tasks/{id}/status`
- **状态**: ✅ 已对接

**请求体**:
```json
{
  "status": "completed"
}
```

### 5.6 用药记录查询
- **接口**: `GET /api/care/medications`
- **前端文件**: `src/views/care/CareMedication.vue`
- **状态**: ⚠️ 需要后端确认

---

## 6. 待办事项模块 🆕

### 6.1 查询待办列表
- **接口**: `GET /api/todos`
- **前端文件**: `src/views/task/TodoView.vue`, `src/views/dashboard/HomeView.vue`
- **状态**: ✅ 已对接

**请求参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态：open/done |

**期望响应**:
```json
{
  "code": 200,
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "title": "检查消防设施",
      "status": "open",
      "due_at": "2026-01-20T10:00:00",
      "created_at": "2026-01-18T12:00:00"
    }
  ]
}
```

### 6.2 创建待办
- **接口**: `POST /api/todos`
- **状态**: ✅ 已对接

**请求体**:
```json
{
  "title": "待办标题",
  "due_at": "2026-01-20T10:00:00"
}
```

### 6.3 更新待办
- **接口**: `PUT /api/todos/{id}`
- **状态**: ✅ 已对接

**请求体**:
```json
{
  "title": "更新后的标题",
  "due_at": "2026-01-21T10:00:00"
}
```

### 6.4 完成待办
- **接口**: `PATCH /api/todos/{id}/complete`
- **状态**: ✅ 已对接

### 6.5 删除待办
- **接口**: `DELETE /api/todos/{id}`
- **状态**: ✅ 已对接

---

## 7. 通知公告模块

### 7.1 查询公告列表
- **接口**: `GET /api/notices`
- **前端文件**: `src/views/notice/NoticeView.vue`, `src/views/dashboard/HomeView.vue`
- **状态**: ⚠️ 需要后端确认

**请求参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态：draft/published/archived |
| page | int | 页码 |
| page_size | int | 每页数量 |

### 7.2 创建公告
- **接口**: `POST /api/notices`
- **状态**: ⚠️ 需要后端确认

### 7.3 更新公告
- **接口**: `PUT /api/notices/{id}`
- **状态**: ⚠️ 需要后端确认

### 7.4 删除公告
- **接口**: `DELETE /api/notices/{id}`
- **状态**: ⚠️ 需要后端确认

---

## 8. 消息模块

### 8.1 查询消息列表
- **接口**: `GET /api/messages`
- **前端文件**: `src/views/message/MessageView.vue`
- **状态**: ⚠️ 需要后端确认

**请求参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| isRead | boolean | 是否已读 |
| type | string | 消息类型 |

### 8.2 标记消息已读
- **接口**: `PATCH /api/messages/{id}/read`
- **状态**: ⚠️ 需要后端确认

### 8.3 标记所有消息已读
- **接口**: `POST /api/messages/read-all`
- **状态**: ⚠️ 需要后端确认

### 8.4 获取未读消息数量
- **接口**: `GET /api/messages/unread-count`
- **前端文件**: `src/views/dashboard/HomeView.vue`
- **状态**: ⚠️ 需要后端确认

**期望响应**:
```json
{
  "code": 0,
  "data": {
    "count": 5
  }
}
```

---

## 9. 系统管理模块

### 9.1 查询用户列表
- **接口**: `GET /api/system/users`
- **前端文件**: `src/views/system/SystemUsers.vue`
- **权限**: admin
- **状态**: ✅ 已对接

### 9.2 创建用户
- **接口**: `POST /api/system/users`
- **状态**: ✅ 已对接

**请求体**:
```json
{
  "username": "nurse02",
  "password": "123456",
  "name": "护士小李",
  "role": "nurse"
}
```

### 9.3 更新用户信息
- **接口**: `PUT /api/system/users/{id}`
- **状态**: ✅ 已对接

### 9.4 更新用户角色
- **接口**: `PATCH /api/system/users/{id}/role`
- **状态**: ⚠️ 需要后端确认

**请求体**:
```json
{
  "role": "nurse"
}
```

### 9.5 更新用户状态
- **接口**: `PATCH /api/system/users/{id}/status`
- **状态**: ⚠️ 需要后端确认

**请求体**:
```json
{
  "status": "active"
}
```

### 9.6 重置用户密码 🆕
- **接口**: `POST /api/system/users/{id}/reset-password`
- **前端文件**: `src/views/system/SystemUsers.vue`
- **状态**: ⚠️ 需要后端实现

**请求体**（可选，不传则重置为默认密码）:
```json
{
  "password": "newPassword"
}
```

### 9.7 修改当前用户密码
- **接口**: `POST /api/system/change-password`
- **状态**: ⚠️ 需要后端确认

**请求体**:
```json
{
  "oldPassword": "当前密码",
  "newPassword": "新密码"
}
```

### 9.8 获取角色列表
- **接口**: `GET /api/roles`
- **前端文件**: `src/views/system/SystemRoles.vue`
- **状态**: ✅ 已对接

### 9.9 获取角色详情（含权限）
- **接口**: `GET /api/roles/{id}`
- **状态**: ✅ 已对接

### 9.10 更新角色权限
- **接口**: `PUT /api/roles/{id}/permissions`
- **状态**: ✅ 已对接

**请求体**:
```json
{
  "permissionIds": [1, 2, 3, 5, 8]
}
```

### 9.11 获取所有权限列表
- **接口**: `GET /api/permissions`
- **状态**: ✅ 已对接

**期望响应**（树形结构）:
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "code": "dashboard",
      "name": "仪表盘",
      "children": []
    },
    {
      "id": 2,
      "code": "elderly",
      "name": "老人管理",
      "children": [
        { "id": 3, "code": "elderly.list", "name": "老人列表" },
        { "id": 4, "code": "elderly.add", "name": "新增老人" }
      ]
    }
  ]
}
```

### 9.12 获取系统日志
- **接口**: `GET /api/logs`
- **前端文件**: `src/views/system/SystemLogs.vue`
- **状态**: ⚠️ 需要后端确认

**请求参数**:
| 参数 | 类型 | 说明 |
|------|------|------|
| operator | string | 操作人 |
| action_type | string | 操作类型：login/create/update/delete |
| module | string | 模块 |
| page | int | 页码 |
| page_size | int | 每页数量 |

---

## 🔴 后端需要优先实现/确认的接口

1. **GET /api/beds/floor-stats** - 各楼层床位统计（首页展示需要）
2. **GET /api/elderly/{id}** - 老人详情（快速查询-查看详情需要）
3. **PUT /api/elderly/{id}** - 更新老人信息（快速查询-编辑需要）
4. **GET /api/care/tasks/today** - 今日护理任务（首页展示需要）
5. **POST /api/system/users/{id}/reset-password** - 重置密码
6. **GET /api/messages/unread-count** - 未读消息数量

---

## 📝 前端API调用文件位置

| API模块 | 文件路径 |
|---------|----------|
| 认证 | `src/api/auth.js` |
| 仪表盘 | `src/api/dashboard.js` |
| 老人管理 | `src/api/elderly.js` |
| 床位管理 | `src/api/bed.js` |
| 护理管理 | `src/api/care.js` |
| 待办事项 | `src/api/todo.js` |
| 通知公告 | `src/api/notice.js` |
| 消息 | `src/api/message.js` |
| 系统管理 | `src/api/system.js` |

---

## 📞 联系方式

如有疑问，请及时沟通。

前端服务地址: `http://localhost:5173`
后端服务地址: `http://localhost:5000`
