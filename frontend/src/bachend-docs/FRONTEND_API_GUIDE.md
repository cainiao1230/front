# 前端API对接指南

## 目录
1. [认证模块](#1-认证模块)
2. [仪表盘模块](#2-仪表盘模块)
3. [老人管理模块](#3-老人管理模块)
4. [床位管理模块](#4-床位管理模块)
5. [护理任务模块](#5-护理任务模块)
6. [护理记录模块](#6-护理记录模块)
7. [用药记录模块](#7-用药记录模块)
8. [公告管理模块](#8-公告管理模块)
9. [消息模块](#9-消息模块)
10. [待办事项模块](#10-待办事项模块)
11. [系统管理模块](#11-系统管理模块)
12. [角色权限模块](#12-角色权限模块)
13. [日志模块](#13-日志模块)

---

## 通用说明

### 基础URL
```
http://localhost:8080/api
```

### 认证方式
所有请求（除登录外）需要在请求头中携带JWT Token：
```
Authorization: Bearer <token>
```

### 通用响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": { ... }
}
```

### 错误响应格式
```json
{
  "code": 40001,
  "message": "错误描述",
  "data": null
}
```

### 分页参数
| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| page | int | 1 | 页码（从1开始） |
| page_size | int | 10 | 每页数量 |

### 分页响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 10,
    "total_pages": 10
  }
}
```

---

## 1. 认证模块

### 1.1 用户登录
**POST** `/auth/login`

**请求体：**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "管理员",
      "role": "admin",
      "avatar": "",
      "permissions": ["system", "elderly", "bed", ...]
    }
  }
}
```

### 1.2 获取当前用户信息
**GET** `/auth/me`

**响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "username": "admin",
    "name": "管理员",
    "role": "admin",
    "avatar": "",
    "permissions": ["system", "elderly", "bed", ...]
  }
}
```

### 1.3 用户登出
**POST** `/auth/logout`

**响应：**
```json
{
  "code": 0,
  "message": "登出成功"
}
```

---

## 2. 仪表盘模块

### 2.1 获取仪表盘统计数据
**GET** `/dashboard/stats`

**权限：** admin, nurse, caregiver

**响应：**
```json
{
  "code": 0,
  "message": "success",
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
    },
    "careRecordTrend": [
      { "date": "2026-01-12", "count": 15 },
      { "date": "2026-01-13", "count": 18 },
      { "date": "2026-01-14", "count": 20 },
      { "date": "2026-01-15", "count": 17 },
      { "date": "2026-01-16", "count": 22 },
      { "date": "2026-01-17", "count": 19 },
      { "date": "2026-01-18", "count": 21 }
    ]
  }
}
```

---

## 3. 老人管理模块

### 3.1 查询老人列表
**GET** `/elderly`

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态筛选：pending/in/out |
| careLevel | string | 护理等级：self_care/semi_care/full_care |
| page | int | 页码 |
| page_size | int | 每页数量 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "张三",
        "gender": "male",
        "age": 75,
        "phone": "13800138001",
        "idNumber": "110101194901010011",
        "medicalHistory": "高血压,糖尿病",
        "allergies": "青霉素",
        "careLevel": "semi_care",
        "status": "in",
        "bedId": 1,
        "emergencyContactName": "张明",
        "emergencyContactPhone": "13900139001",
        "appliedAt": "2026-01-01T10:00:00",
        "admissionDate": "2026-01-05T14:00:00"
      }
    ],
    "total": 50,
    "page": 1,
    "page_size": 10
  }
}
```

### 3.2 获取老人详情
**GET** `/elderly/{id}`

### 3.3 创建老人申请
**POST** `/elderly`

**请求体：**
```json
{
  "name": "李四",
  "gender": "male",
  "age": 80,
  "birthday": "1946-05-20",
  "phone": "13800138002",
  "idNumber": "110101194605200022",
  "medicalHistory": "心脏病",
  "allergies": "",
  "careLevel": "full_care",
  "emergencyContactName": "李明",
  "emergencyContactPhone": "13900139002",
  "notes": "需要特殊护理"
}
```

### 3.4 更新老人信息
**PUT** `/elderly/{id}`

### 3.5 审批老人入住
**POST** `/elderly/{id}/approve`

**请求体：**
```json
{
  "bedId": 5
}
```

### 3.6 拒绝老人入住
**POST** `/elderly/{id}/reject`

**请求体：**
```json
{
  "reason": "床位已满"
}
```

### 3.7 删除老人
**DELETE** `/elderly/{id}`

**权限：** admin

### 3.8 搜索老人
**GET** `/elderly/search`

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| keyword | string | 搜索关键词（姓名） |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [...],
    "total": 5
  }
}
```

---

## 4. 床位管理模块

### 4.1 查询床位列表
**GET** `/beds`

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态：free/occupied/maintenance/locked |
| building | string | 楼栋 |
| floor | string | 楼层 |
| page | int | 页码 |
| page_size | int | 每页数量 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "building": "1号楼",
        "floor": "1层",
        "room": "101",
        "bedNo": "A",
        "status": "occupied",
        "elderlyId": 1,
        "elderlyName": "张三"
      }
    ],
    "total": 100
  }
}
```

### 4.2 创建床位
**POST** `/beds`

**请求体：**
```json
{
  "building": "1号楼",
  "floor": "1层",
  "room": "101",
  "bedNo": "A"
}
```

### 4.3 更新床位状态
**PATCH** `/beds/{id}/status`

**请求体：**
```json
{
  "status": "maintenance"
}
```

### 4.4 分配床位
**POST** `/beds/{id}/assign`

**请求体：**
```json
{
  "elderlyId": 5
}
```

### 4.5 分配床位给老人
**POST** `/beds/allocate`

**请求体：**
```json
{
  "elderly_id": 1,
  "bed_id": 5,
  "reason": "入住分配"
}
```

### 4.6 删除床位
**DELETE** `/beds/{id}`

**权限：** admin

### 4.7 查询床位分配历史
**GET** `/beds/history`

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| elderly_id | long | 老人ID |
| page | int | 页码 |
| page_size | int | 每页数量 |

---

## 5. 护理任务模块

### 5.1 查询护理任务列表
**GET** `/care/tasks`

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| elderlyId | long | 老人ID |
| assignedTo | long | 执行人ID |
| status | string | 状态：pending/in_progress/completed/cancelled |
| startTime | datetime | 开始时间 |
| endTime | datetime | 结束时间 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "elderlyId": 1,
        "elderlyName": "张三",
        "title": "测量血压",
        "description": "早上8点测量血压",
        "priority": "high",
        "status": "pending",
        "scheduledTime": "2026-01-18T08:00:00",
        "assignedTo": 2,
        "assignedToName": "护士小王"
      }
    ]
  }
}
```

### 5.2 创建护理任务
**POST** `/care/tasks`

**请求体：**
```json
{
  "elderlyId": 1,
  "title": "测量血压",
  "description": "早上8点测量血压",
  "priority": "high",
  "scheduledTime": "2026-01-18T08:00:00",
  "assignedTo": 2
}
```

### 5.3 更新任务状态
**PATCH** `/care/tasks/{id}/status`

**请求体：**
```json
{
  "status": "completed"
}
```

### 5.4 获取今日任务
**GET** `/care/tasks/today`

**说明：** 返回当前登录用户今日需要处理的护理任务

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [...],
    "total": 5
  }
}
```

---

## 6. 护理记录模块

### 6.1 查询护理记录
**GET** `/care/records`

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| elderlyId | long | 老人ID |
| careType | string | 护理类型 |
| startTime | datetime | 开始时间 |
| endTime | datetime | 结束时间 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "elderlyId": 1,
        "elderlyName": "张三",
        "careType": "日常护理",
        "content": "协助洗漱、更换衣物",
        "careTime": "2026-01-18T08:00:00",
        "caregiverId": 3,
        "caregiverName": "护工小李"
      }
    ]
  }
}
```

### 6.2 创建护理记录
**POST** `/care/records`

**请求体：**
```json
{
  "elderlyId": 1,
  "careType": "日常护理",
  "content": "协助洗漱、更换衣物",
  "careTime": "2026-01-18T08:00:00"
}
```

---

## 7. 用药记录模块

### 7.1 查询用药记录
**GET** `/care/medications`

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| elderlyId | long | 老人ID |
| startTime | datetime | 开始时间 |
| endTime | datetime | 结束时间 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "elderlyId": 1,
        "elderlyName": "张三",
        "medicationName": "降压药",
        "dosage": "1片",
        "frequency": "每日1次",
        "administeredAt": "2026-01-18T08:00:00",
        "administeredBy": 2,
        "administeredByName": "护士小王",
        "notes": "饭后服用"
      }
    ]
  }
}
```

### 7.2 创建用药记录
**POST** `/care/medications`

**请求体：**
```json
{
  "elderlyId": 1,
  "medicationName": "降压药",
  "dosage": "1片",
  "frequency": "每日1次",
  "notes": "饭后服用"
}
```

### 7.3 更新用药记录
**PUT** `/care/medications/{id}`

**请求体：**
```json
{
  "medicationName": "降压药",
  "dosage": "10mg",
  "frequency": "每日两次",
  "notes": "早晚各一次"
}
```

### 7.4 标记药物已服用
**PATCH** `/care/medications/{id}/taken`

**说明：** 标记该药物已服用，记录服用时间

---

## 8. 公告管理模块

### 8.1 查询公告列表
**GET** `/notices`

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态：draft/published/archived |
| keyword | string | 关键词搜索 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "春节放假通知",
        "content": "春节期间，养老院正常运营...",
        "type": "important",
        "status": "published",
        "publishedAt": "2026-01-15T10:00:00",
        "createdBy": 1,
        "createdByName": "管理员"
      }
    ]
  }
}
```

### 8.2 创建公告
**POST** `/notices`

**请求体：**
```json
{
  "title": "春节放假通知",
  "content": "春节期间，养老院正常运营...",
  "type": "important"
}
```

### 8.3 获取公告详情
**GET** `/notices/{id}`

### 8.4 更新公告
**PUT** `/notices/{id}`

**权限：** admin

**请求体：**
```json
{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "targetRole": "nurse"
}
```

### 8.5 删除公告
**DELETE** `/notices/{id}`

**权限：** admin

---

## 9. 消息模块

### 9.1 查询消息列表
**GET** `/messages`

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| isRead | boolean | 是否已读 |
| type | string | 消息类型 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "新的护理任务",
        "content": "您有一个新的护理任务待处理",
        "type": "task",
        "isRead": false,
        "createdAt": "2026-01-18T08:00:00"
      }
    ],
    "unreadCount": 5
  }
}
```

### 9.2 标记消息为已读
**PATCH** `/messages/{id}/read`

### 9.3 标记所有消息为已读
**POST** `/messages/read-all`

### 9.4 获取未读消息数量
**GET** `/messages/unread-count`

**响应：**
```json
{
  "code": 0,
  "data": {
    "count": 5
  }
}
```

### 9.5 获取消息详情
**GET** `/messages/{id}`

### 9.6 发送消息
**POST** `/messages`

**请求体：**
```json
{
  "userId": 2,
  "content": "请及时处理护理任务"
}
```

---

## 10. 待办事项模块

### 10.1 查询待办列表
**GET** `/todos`

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| status | string | 状态：pending/completed |
| priority | string | 优先级：low/medium/high |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "title": "检查1号楼消防设施",
        "description": "每月例行检查",
        "priority": "high",
        "status": "pending",
        "dueDate": "2026-01-20",
        "createdAt": "2026-01-15T10:00:00"
      }
    ]
  }
}
```

### 10.2 创建待办
**POST** `/todos`

**请求体：**
```json
{
  "title": "检查1号楼消防设施",
  "description": "每月例行检查",
  "priority": "high",
  "dueDate": "2026-01-20"
}
```

### 10.3 完成待办
**PATCH** `/todos/{id}/complete`

### 10.4 删除待办
**DELETE** `/todos/{id}`

---

## 11. 系统管理模块

### 11.1 查询用户列表
**GET** `/system/users`

**权限：** admin

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| role | string | 角色筛选 |
| status | string | 状态：active/disabled |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "username": "admin",
        "name": "管理员",
        "role": "admin",
        "status": 1,
        "avatar": ""
      }
    ]
  }
}
```

### 11.2 创建用户
**POST** `/system/users`

**权限：** admin

**请求体：**
```json
{
  "username": "nurse02",
  "password": "123456",
  "name": "护士小李",
  "role": "nurse",
  "avatar": ""
}
```

### 11.3 更新用户信息
**PUT** `/system/users/{id}`

**权限：** admin

**请求体：**
```json
{
  "name": "新姓名",
  "avatar": "新头像URL",
  "status": "active"
}
```

### 11.4 更新用户角色
**PATCH** `/system/users/{id}/role`

**权限：** admin

**请求体：**
```json
{
  "role": "nurse"
}
```

### 11.5 更新用户状态
**PATCH** `/system/users/{id}/status`

**权限：** admin

**请求体：**
```json
{
  "status": "active"
}
```

### 11.6 重置用户密码
**POST** `/system/users/{id}/reset-password`

**权限：** admin

**请求体（可选）：**
```json
{
  "password": "newPassword"
}
```
> 不传password则重置为默认密码 `123456`

### 11.7 修改当前用户密码
**POST** `/system/change-password`

**请求体：**
```json
{
  "oldPassword": "当前密码",
  "newPassword": "新密码"
}
```

**响应：**
```json
{
  "code": 0,
  "message": "密码修改成功"
}
```

### 11.8 删除用户
**DELETE** `/system/users/{id}`

**权限：** admin

---

## 12. 角色权限模块

### 12.1 查询角色列表
**GET** `/roles`

**权限：** admin

**响应：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "code": "admin",
      "name": "管理员",
      "description": "系统管理员，拥有所有权限",
      "permissions": [...]
    }
  ]
}
```

### 12.2 获取角色详情（含权限树）
**GET** `/roles/{id}`

**权限：** admin

**响应：**
```json
{
  "code": 0,
  "data": {
    "id": 1,
    "code": "admin",
    "name": "管理员",
    "permissions": [
      {
        "id": 1,
        "code": "system",
        "name": "系统管理",
        "parentId": null,
        "children": [
          {
            "id": 2,
            "code": "system:user",
            "name": "用户管理",
            "parentId": 1,
            "children": [...]
          }
        ]
      }
    ]
  }
}
```

### 12.3 更新角色权限
**PUT** `/roles/{id}/permissions`

**权限：** admin

**请求体：**
```json
{
  "permissionIds": [1, 2, 3, 4, 5]
}
```

### 12.4 查询所有权限（树形结构）
**GET** `/permissions`

**权限：** admin

**响应：**
```json
{
  "code": 0,
  "data": [
    {
      "id": 1,
      "code": "system",
      "name": "系统管理",
      "parentId": null,
      "children": [
        {
          "id": 2,
          "code": "system:user",
          "name": "用户管理",
          "parentId": 1,
          "children": [
            { "id": 3, "code": "system:user:view", "name": "查看用户" },
            { "id": 4, "code": "system:user:add", "name": "添加用户" },
            { "id": 5, "code": "system:user:edit", "name": "编辑用户" },
            { "id": 6, "code": "system:user:delete", "name": "删除用户" }
          ]
        }
      ]
    }
  ]
}
```

---

## 13. 日志模块

### 13.1 查询系统日志
**GET** `/logs`

**权限：** admin

**参数：**
| 参数 | 类型 | 说明 |
|------|------|------|
| userId | long | 用户ID |
| action | string | 操作类型 |
| startTime | datetime | 开始时间 |
| endTime | datetime | 结束时间 |

**响应：**
```json
{
  "code": 0,
  "data": {
    "items": [
      {
        "id": 1,
        "userId": 1,
        "username": "admin",
        "action": "LOGIN",
        "resource": "认证",
        "ip": "192.168.1.100",
        "detail": "管理员登录系统",
        "createdAt": "2026-01-18T08:00:00"
      }
    ]
  }
}
```

### 13.2 查询指定用户的日志
**GET** `/system/logs/user/{userId}`

**权限：** admin

---

## 附录

### A. 错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 40001 | 请求参数错误 |
| 40101 | 未认证 |
| 40301 | 无权限 |
| 40401 | 资源不存在 |
| 50001 | 服务器内部错误 |

### B. 角色说明

| 角色代码 | 角色名称 | 说明 |
|----------|----------|------|
| admin | 管理员 | 系统管理员，拥有所有权限 |
| nurse | 护士 | 护理人员，负责护理任务管理 |
| caregiver | 护工 | 护理工人，负责日常护理 |
| family | 家属 | 老人家属，可查看老人信息 |

### C. 状态枚举

**老人状态 (ElderlyStat):**
- `pending` - 待审批
- `in` - 在住
- `out` - 已退住

**床位状态 (BedStatus):**
- `free` - 空闲
- `occupied` - 已占用
- `maintenance` - 维护中
- `locked` - 锁定

**护理任务状态 (TaskStatus):**
- `pending` - 待处理
- `in_progress` - 进行中
- `completed` - 已完成
- `cancelled` - 已取消

**护理等级 (CareLevel):**
- `self_care` - 自理
- `semi_care` - 半护理
- `full_care` - 全护理

### D. 测试账号

| 用户名 | 密码 | 角色 |
|--------|------|------|
| admin | admin123 | 管理员 |
| nurse01 | nurse123 | 护士 |
| caregiver01 | care123 | 护工 |
| family01 | family123 | 家属 |

---

## 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| 1.0.0 | 2026-01-18 | 初始版本 |
