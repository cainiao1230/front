# 智慧养老系统 - 前端 API 接口清单

> **文档生成时间**: 2026-01-20  
> **用途**: 供后端开发人员对照检查，确保所有接口都已实现且方法正确  
> **前端项目路径**: `src/api/`

---

## 📋 目录

- [1. 认证模块 (auth.js)](#1-认证模块-authjs)
- [2. 老人管理模块 (elderly.js)](#2-老人管理模块-elderlyjs)
- [3. 床位管理模块 (bed.js)](#3-床位管理模块-bedjs)
- [4. 护理管理模块 (care.js)](#4-护理管理模块-carejs)
- [5. 消息模块 (message.js)](#5-消息模块-messagejs)
- [6. 通知模块 (notice.js)](#6-通知模块-noticejs)
- [7. 待办事项模块 (todo.js)](#7-待办事项模块-todojs)
- [8. 系统管理模块 (system.js)](#8-系统管理模块-systemjs)
- [9. 仪表盘模块 (dashboard.js)](#9-仪表盘模块-dashboardjs)
- [接口统计](#接口统计)

---

## 1. 认证模块 (auth.js)

### 1.1 用户登录
- **接口**: `POST /api/auth/login`
- **请求体**: `{ username, password }`
- **说明**: 用户登录获取 token

### 1.2 用户登出
- **接口**: `POST /api/auth/logout`
- **说明**: 退出登录

### 1.3 获取当前用户信息
- **接口**: `GET /api/auth/me`
- **说明**: 获取当前登录用户的信息及权限

### 1.4 修改密码
- **接口**: `POST /api/auth/change-password`
- **请求体**: `{ oldPassword, newPassword }`
- **说明**: 修改当前用户密码

### 1.5 刷新 Token
- **接口**: `POST /api/auth/refresh`
- **说明**: 刷新访问令牌

---

## 2. 老人管理模块 (elderly.js)

### 2.1 老人列表
- **接口**: `GET /api/elderly`
- **查询参数**: `page, page_size, name, status, care_level`
- **说明**: 获取老人列表（支持分页和筛选）

### 2.2 获取老人详情
- **接口**: `GET /api/elderly/{id}`
- **说明**: 获取指定老人的详细信息

### 2.3 新增老人申请
- **接口**: `POST /api/elderly`
- **请求体**: `{ name, gender, birthday, id_number, phone, care_level, emergency_contact_name, emergency_contact_phone, ... }`
- **说明**: 创建老人入住申请

### 2.4 更新老人信息
- **接口**: `PUT /api/elderly/{id}`
- **请求体**: `{ name, gender, birthday, id_number, phone, care_level, ... }`
- **说明**: 更新老人信息

### 2.5 删除老人（退房）
- **接口**: `DELETE /api/elderly/{id}`
- **说明**: 删除老人记录或办理退房

### 2.6 搜索老人
- **接口**: `GET /api/elderly/search`
- **查询参数**: `keyword`
- **说明**: 按关键词搜索老人

### 2.7 审批住房申请 - 通过
- **接口**: `PATCH /api/elderly/{id}/approve`
- **请求体**: `{ admission_date? }`
- **说明**: 批准老人入住申请，状态变为 `in`

### 2.8 审批住房申请 - 拒绝
- **接口**: `PATCH /api/elderly/{id}/reject`
- **请求体**: `{ reason }`
- **说明**: 拒绝老人入住申请

---

## 3. 床位管理模块 (bed.js)

### 3.1 床位列表
- **接口**: `GET /api/beds`
- **查询参数**: `page, page_size, floor, room, status`
- **说明**: 获取床位列表（支持分页和筛选）

### 3.2 获取床位详情
- **接口**: `GET /api/beds/{id}`
- **说明**: 获取指定床位的详细信息

### 3.3 新增床位
- **接口**: `POST /api/beds`
- **请求体**: `{ bed_number, floor, room, bed_type, status }`
- **说明**: 创建新床位

### 3.4 更新床位信息
- **接口**: `PUT /api/beds/{id}`
- **请求体**: `{ bed_number, floor, room, bed_type, status }`
- **说明**: 更新床位信息

### 3.5 更新床位状态
- **接口**: `PATCH /api/beds/{id}/status`
- **请求体**: `{ status, reason? }`
- **说明**: 更新床位状态（free/occupied/maintenance/locked）

### 3.6 删除床位
- **接口**: `DELETE /api/beds/{id}`
- **说明**: 删除床位记录

### 3.7 分配床位（指定床位）
- **接口**: `POST /api/beds/{bedId}/assign`
- **请求体**: `{ elderlyId }`
- **说明**: 将指定床位分配给指定老人

### 3.8 分配床位（通用接口）
- **接口**: `POST /api/beds/allocate`
- **请求体**: `{ elderly_id, bed_id, allocation_date }`
- **说明**: 床位分配的通用接口

### 3.9 释放床位
- **接口**: `PATCH /api/beds/{bedId}/status`
- **请求体**: `{ status: 'free', reason? }`
- **说明**: 释放床位（将状态设置为 free）

### 3.10 床位使用历史
- **接口**: `GET /api/beds/history`
- **查询参数**: `page, page_size, bed_id, elderly_id`
- **说明**: 获取床位分配/调整历史记录

### 3.11 获取床位历史详情 ✅
- **接口**: `GET /api/beds/history/{id}`
- **说明**: 获取指定床位历史记录的详细信息
- **状态**: ✅ 已添加（2026-01-20）

### 3.12 按楼层统计床位
- **接口**: `GET /api/beds/floor-stats`
- **说明**: 获取各楼层的床位统计数据

### 3.13 获取指定楼层的床位（按房间分组）
- **接口**: `GET /api/beds/floor/{floor}/grouped`
- **路径参数**: `floor` (如: 1F, 2F, 3F)
- **说明**: 获取指定楼层的所有床位，按房间分组

---

## 4. 护理管理模块 (care.js)

### 4.1 护理记录列表
- **接口**: `GET /api/care/records`
- **查询参数**: `page, page_size, elderly_id, care_type, start_date, end_date`
- **说明**: 获取护理记录列表

### 4.2 添加护理记录
- **接口**: `POST /api/care/records`
- **请求体**: `{ elderly_id, care_type, care_content, care_time, remarks?, signature? }`
- **说明**: 创建新的护理记录

### 4.3 获取护理记录详情 ✅
- **接口**: `GET /api/care/records/{id}`
- **说明**: 获取指定护理记录的详细信息
- **状态**: ✅ 已添加（2026-01-20）

### 4.4 更新护理记录 ✅
- **接口**: `PUT /api/care/records/{id}`
- **请求体**: `{ elderly_id?, care_type?, care_content?, care_time?, remarks?, signature? }`
- **说明**: 更新护理记录信息
- **状态**: ✅ 已添加（2026-01-20）

### 4.5 删除护理记录
- **接口**: `DELETE /api/care/records/{id}`
- **说明**: 删除指定的护理记录
- **状态**: ✅ 已添加（2026-01-20）

### 4.6 护理任务列表
- **接口**: `GET /api/care/tasks`
- **查询参数**: `page, page_size, elderly_id, status`
- **说明**: 获取护理任务列表

### 4.7 创建护理任务
- **接口**: `POST /api/care/tasks`
- **请求体**: `{ elderly_id, task_type, task_content, scheduled_time, assigned_to }`
- **说明**: 创建新的护理任务

### 4.8 获取护理任务详情 ✅
- **接口**: `GET /api/care/tasks/{id}`
- **说明**: 获取指定护理任务的详细信息
- **状态**: ✅ 已添加（2026-01-20）

### 4.9 更新护理任务 ✅
- **接口**: `PUT /api/care/tasks/{id}`
- **请求体**: `{ elderly_id?, task_type?, task_content?, scheduled_time?, assigned_to? }`
- **说明**: 更新护理任务信息
- **状态**: ✅ 已添加（2026-01-20）

### 4.10 更新任务状态
- **接口**: `PATCH /api/care/tasks/{id}/status`
- **请求体**: `{ status }`
- **说明**: 更新任务状态（pending/in_progress/completed/cancelled）

### 4.11 删除护理任务 ✅
- **接口**: `DELETE /api/care/tasks/{id}`
- **说明**: 删除护理任务
- **状态**: ✅ 已添加（2026-01-20）

### 4.12 获取今日任务
- **接口**: `GET /api/care/tasks/today`
- **说明**: 获取当天的护理任务列表

### 4.13 用药记录列表
- **接口**: `GET /api/care/medications`
- **查询参数**: `page, page_size, elderly_id`
- **说明**: 获取用药记录列表

### 4.14 添加用药记录
- **接口**: `POST /api/care/medications`
- **请求体**: `{ elderly_id, medication_name, dosage, frequency, start_date, end_date?, notes? }`
- **说明**: 创建用药记录

### 4.15 获取用药记录详情 ✅
- **接口**: `GET /api/care/medications/{id}`
- **说明**: 获取指定用药记录的详细信息
- **状态**: ✅ 已添加（2026-01-20）

### 4.16 更新用药记录
- **接口**: `PUT /api/care/medications/{id}`
- **请求体**: `{ medication_name, dosage, frequency, start_date, end_date?, notes? }`
- **说明**: 更新用药记录信息

### 4.17 删除用药记录 ✅
- **接口**: `DELETE /api/care/medications/{id}`
- **说明**: 删除用药记录
- **状态**: ✅ 已添加（2026-01-20）

### 4.18 标记用药已服用
- **接口**: `PATCH /api/care/medications/{id}/taken`
- **说明**: 标记某次用药已服用

---

## 5. 消息模块 (message.js)

### 5.1 消息列表
- **接口**: `GET /api/messages`
- **查询参数**: `page, page_size, is_read`
- **说明**: 获取消息列表

### 5.2 获取消息详情
- **接口**: `GET /api/messages/{id}`
- **说明**: 获取指定消息的详细内容

### 5.3 标记消息已读
- **接口**: `PATCH /api/messages/{id}/read`
- **说明**: 标记单条消息为已读

### 5.4 批量标记已读
- **接口**: `POST /api/messages/read-all`
- **说明**: 标记所有消息为已读

### 5.5 发送消息
- **接口**: `POST /api/messages`
- **请求体**: `{ receiver_id, title, content }`
- **说明**: 发送消息给指定用户

### 5.6 删除消息
- **接口**: `DELETE /api/messages/{id}`
- **说明**: 删除消息

### 5.7 获取未读消息数量
- **接口**: `GET /api/messages/unread-count`
- **说明**: 获取当前用户的未读消息数量

---

## 6. 通知模块 (notice.js)

### 6.1 通知列表
- **接口**: `GET /api/notices`
- **查询参数**: `page, page_size, type`
- **说明**: 获取通知公告列表

### 6.2 获取通知详情
- **接口**: `GET /api/notices/{id}`
- **说明**: 获取指定通知的详细内容

### 6.3 发布通知
- **接口**: `POST /api/notices`
- **请求体**: `{ title, content, type, priority? }`
- **说明**: 发布新通知（管理员权限）

### 6.4 更新通知
- **接口**: `PUT /api/notices/{id}`
- **请求体**: `{ title, content, type, priority? }`
- **说明**: 更新通知内容

### 6.5 删除通知
- **接口**: `DELETE /api/notices/{id}`
- **说明**: 删除通知

---

## 7. 待办事项模块 (todo.js)

### 7.1 待办列表
- **接口**: `GET /api/todos`
- **查询参数**: `status` (open/done)
- **说明**: 获取待办事项列表

### 7.2 获取待办详情 ✅
- **接口**: `GET /api/todos/{id}`
- **说明**: 获取指定待办事项的详细信息
- **状态**: ✅ 已添加（2026-01-20）

### 7.3 创建待办
- **接口**: `POST /api/todos`
- **请求体**: `{ title, due_at? }`
- **说明**: 创建新的待办事项

### 7.4 更新待办
- **接口**: `PUT /api/todos/{id}`
- **请求体**: `{ title, due_at? }`
- **说明**: 更新待办事项信息

### 7.5 完成待办
- **接口**: `PATCH /api/todos/{id}/complete`
- **说明**: 标记待办事项为已完成

### 7.6 删除待办
- **接口**: `DELETE /api/todos/{id}`
- **说明**: 删除待办事项

---

## 8. 系统管理模块 (system.js)

### 8.1 用户管理

#### 8.1.1 获取用户列表
- **接口**: `GET /api/system/users`
- **查询参数**: `page, page_size, role, status, keyword`
- **说明**: 获取系统用户列表

#### 8.1.2 创建用户
- **接口**: `POST /api/system/users`
- **请求体**: `{ username, password, name, role, email?, phone? }`
- **说明**: 创建新用户

#### 8.1.3 更新用户信息
- **接口**: `PUT /api/system/users/{id}`
- **请求体**: `{ username?, name?, email?, phone? }`
- **说明**: 更新用户基本信息

#### 8.1.4 更新用户角色
- **接口**: `PATCH /api/system/users/{id}/role`
- **请求体**: `{ role }`
- **说明**: 更新用户角色

#### 8.1.5 更新用户状态
- **接口**: `PATCH /api/system/users/{id}/status`
- **请求体**: `{ status }`
- **说明**: 更新用户状态（active/inactive）

#### 8.1.6 重置用户密码
- **接口**: `POST /api/system/users/{id}/reset-password`
- **请求体**: `{ password? }`
- **说明**: 重置指定用户的密码

#### 8.1.7 修改当前用户密码
- **接口**: `POST /api/system/change-password`
- **请求体**: `{ oldPassword, newPassword }`
- **说明**: 当前用户修改自己的密码

#### 8.1.8 删除用户
- **接口**: `DELETE /api/system/users/{id}`
- **说明**: 删除用户

### 8.2 角色管理

#### 8.2.1 获取角色列表
- **接口**: `GET /api/roles`
- **说明**: 获取所有角色列表

#### 8.2.2 创建角色
- **接口**: `POST /api/roles`
- **请求体**: `{ name, description, permissions? }`
- **说明**: 创建新角色

#### 8.2.3 更新角色
- **接口**: `PUT /api/roles/{id}`
- **请求体**: `{ name, description }`
- **说明**: 更新角色信息

#### 8.2.4 删除角色
- **接口**: `DELETE /api/roles/{id}`
- **说明**: 删除角色

#### 8.2.5 获取角色详情
- **接口**: `GET /api/roles/{id}`
- **说明**: 获取角色详情（含权限列表）

#### 8.2.6 保存角色权限
- **接口**: `PUT /api/roles/{id}/permissions`
- **请求体**: `{ permissionIds: [] }`
- **说明**: 更新角色的权限配置

#### 8.2.7 获取所有权限列表
- **接口**: `GET /api/permissions`
- **说明**: 获取系统所有权限（树形结构）

### 8.3 系统日志

#### 8.3.1 获取系统日志
- **接口**: `GET /api/logs`
- **查询参数**: `page, page_size, user_id, action, start_date, end_date`
- **说明**: 获取系统操作日志

#### 8.3.2 获取日志详情 ✅
- **接口**: `GET /api/logs/{id}`
- **说明**: 获取指定日志的详细信息
- **状态**: ✅ 已添加（2026-01-20）

#### 8.3.3 获取指定用户的日志
- **接口**: `GET /api/system/logs/user/{userId}`
- **说明**: 获取指定用户的操作日志

---

## 9. 仪表盘模块 (dashboard.js)

### 9.1 获取仪表盘统计数据
- **接口**: `GET /api/dashboard/stats`
- **说明**: 获取首页仪表盘的统计数据（老人数量、床位使用率、待办事项等）

---

## 接口统计

### 按模块统计

| 模块 | GET | POST | PUT | PATCH | DELETE | 总计 |
|------|-----|------|-----|-------|--------|------|
| 认证模块 | 1 | 4 | 0 | 0 | 0 | **5** |
| 老人管理 | 3 | 1 | 1 | 2 | 1 | **8** |
| 床位管理 | 6 | 2 | 1 | 2 | 1 | **12** |
| 护理管理 | 7 | 3 | 3 | 2 | 3 | **18** |
| 消息模块 | 3 | 2 | 0 | 1 | 1 | **7** |
| 通知模块 | 2 | 1 | 1 | 0 | 1 | **5** |
| 待办事项 | 2 | 1 | 1 | 1 | 1 | **6** |
| 系统管理 | 6 | 3 | 4 | 2 | 3 | **18** |
| 仪表盘 | 1 | 0 | 0 | 0 | 0 | **1** |
| **总计** | **31** | **17** | **11** | **10** | **11** | **80** |

### HTTP 方法分布

```
GET:     31 个接口 (38.8%)  - 查询类操作
POST:    17 个接口 (21.3%)  - 创建类操作
PUT:     11 个接口 (13.8%)  - 完整更新操作
PATCH:   10 个接口 (12.5%)  - 部分更新操作
DELETE:  11 个接口 (13.8%)  - 删除类操作
```

---

## ⚠️ 重点检查项

### 1. 最近补充的接口（2026-01-20）

#### 护理管理模块
- ✅ `GET /api/care/records/{id}` - 护理记录详情
- ✅ `PUT /api/care/records/{id}` - 更新护理记录
- ✅ `DELETE /api/care/records/{id}` - 删除护理记录
- ✅ `GET /api/care/tasks/{id}` - 护理任务详情
- ✅ `PUT /api/care/tasks/{id}` - 更新护理任务
- ✅ `DELETE /api/care/tasks/{id}` - 删除护理任务
- ✅ `GET /api/care/medications/{id}` - 用药记录详情
- ✅ `DELETE /api/care/medications/{id}` - 删除用药记录

#### 床位管理模块
- ✅ `GET /api/beds/history/{id}` - 床位历史详情

#### 待办事项模块
- ✅ `GET /api/todos/{id}` - 待办事项详情

#### 系统管理模块
- ✅ `GET /api/logs/{id}` - 系统日志详情

**共补充 11 个接口**

### 2. 需要后端确认的接口

#### 2.1 床位管理
- `POST /api/beds/{bedId}/assign` vs `POST /api/beds/allocate` - 确认是否需要两个分配接口
- `GET /api/beds/floor/{floor}/grouped` - 确认楼层参数格式（1F, 2F 还是 1, 2）

#### 2.2 用户管理
- `POST /api/system/change-password` vs `POST /api/auth/change-password` - 确认是否重复

#### 2.3 批量操作
- 批量标记消息已读 `POST /api/messages/read-all`
- 批量更新用户状态 - 前端使用循环调用，后端是否需要提供批量接口？

### 3. 接口完整性检查

所有模块的增删改查（CRUD）接口已补全：
- ✅ 护理记录：列表、详情、创建、更新、删除
- ✅ 护理任务：列表、详情、创建、更新、删除、状态变更
- ✅ 用药记录：列表、详情、创建、更新、删除、标记服用
- ✅ 床位历史：列表、详情
- ✅ 待办事项：列表、详情、创建、更新、删除、完成
- ✅ 系统日志：列表、详情

---

## 📌 RESTful 规范建议

### 标准 HTTP 方法使用
- **GET** - 查询资源（幂等，可缓存）
- **POST** - 创建资源（非幂等）
- **PUT** - 完整更新资源（幂等）
- **PATCH** - 部分更新资源（幂等）
- **DELETE** - 删除资源（幂等）

### URL 命名规范
- ✅ 使用名词复数: `/api/elderly`, `/api/beds`, `/api/notices`
- ✅ 使用连字符: `/api/care/medications`, `/api/system/users`
- ✅ 资源嵌套: `/api/beds/{id}/assign`

---

## 📝 后端开发检查清单

### 第一步：验证所有接口是否实现
- [ ] 逐一检查上述 80 个接口是否都已在后端实现
- [ ] 确认 HTTP 方法是否正确（特别是 DELETE 方法）
- [ ] 验证路径参数和查询参数是否匹配
- [ ] **重点检查新补充的 11 个接口**（见"最近补充的接口"部分）

### 第二步：检查接口响应格式
- [ ] 统一响应格式: `{ code, message, data }`
- [ ] 成功码: 0 或 200
- [ ] 错误码: 非 0（40x, 50x 等）

### 第三步：补充缺失接口
- [x] ~~评估"可能缺失的接口"部分，决定是否需要实现~~（已全部补充）
- [x] ~~实现必要的更新/删除/详情接口~~（已完成）
- [ ] 后端实现新补充的 11 个接口

### 第四步：权限控制
- [ ] 确认每个接口的权限要求
- [ ] 实现基于角色的访问控制（RBAC）

### 第五步：测试验证
- [ ] 使用 Postman/Apifox 测试所有接口
- [ ] 验证分页、筛选、排序功能
- [ ] 测试边界情况和错误处理

---

## 📮 联系方式

如有接口问题或需要调整，请及时沟通：
- 前端开发：[前端负责人]
- 后端开发：[后端负责人]
- 文档维护：定期更新

---

**最后更新**: 2026-01-20  
**文档版本**: v2.0  
**更新说明**: 补充了 11 个缺失的接口，接口总数从 70 个增加到 80 个
