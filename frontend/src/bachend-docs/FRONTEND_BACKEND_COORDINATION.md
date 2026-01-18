# 前后端对接问题总结文档

> **生成日期**: 2026-01-18
> **目的**: 总结前端页面显示"No Data"的问题原因及后端修复情况，供前端团队参考调整

---

## 🔴 已发现的问题及修复状态

### 1. 护理记录 (Care Records) - ✅ 后端已修复

**问题现象**: 护理记录列表显示"No Data"

**原因分析**: 
- 原后端 API `GET /api/care/records` 要求 `elderly_id` 参数为**必填**
- 前端首页概览需要查询**所有护理记录**，无法提供特定老人ID

**后端修复**:
- ✅ 已将 `elderly_id` 参数改为**可选** (`required = false`)
- ✅ 当不传 `elderly_id` 时，后端返回所有护理记录

**前端需确认**:
- 调用 `GET /api/care/records?page=1&page_size=10` 时是否正常返回数据
- 如果仍需按老人过滤，可传 `elderly_id=xxx`

```http
# 查询所有护理记录（不传elderly_id）
GET /api/care/records?page=1&page_size=10

# 查询特定老人的护理记录
GET /api/care/records?elderly_id=1&page=1&page_size=10
```

---

### 2. 各楼层床位使用情况 (Bed Floor Stats) - ✅ 后端已新增

**问题现象**: 首页"各楼层床位使用情况"部分显示"No Data"

**原因分析**:
- 前端需要按楼层统计床位使用情况
- 原后端没有提供此类统计API

**后端修复**:
- ✅ 新增 API: `GET /api/beds/floor-stats`

**前端需调用**:
```http
GET /api/beds/floor-stats
Authorization: Bearer <token>
```

**响应示例**:
```json
{
  "code": 200,
  "message": "success",
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

### 3. 我的待办事项 (Todos) - ✅ 后端已新增

**问题现象**: 首页"我的待办事项"报 500 错误

**原因分析**:
- 后端之前没有实现 `/api/todos` 端点

**后端修复**:
- ✅ 新增完整的 Todo CRUD API

**前端可用接口**:

| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/todos` | 获取当前用户的待办列表 |
| GET | `/api/todos?status=open` | 按状态筛选待办 |
| POST | `/api/todos` | 创建待办 |
| PUT | `/api/todos/{id}` | 更新待办 |
| PATCH | `/api/todos/{id}/complete` | 标记完成 |
| DELETE | `/api/todos/{id}` | 删除待办 |

**创建待办请求体**:
```json
{
  "title": "待办标题",
  "due_at": "2026-01-20T10:00:00"  // 可选
}
```

**响应数据字段**:
```json
{
  "id": 1,
  "user_id": 1,
  "title": "待办标题",
  "status": "open",  // 或 "done"
  "due_at": "2026-01-20T10:00:00",
  "created_at": "2026-01-18T12:00:00",
  "updated_at": "2026-01-18T12:00:00"
}
```

---

### 4. 今日照护安排 (Today's Care Tasks) - ⚠️ 待前端确认

**问题现象**: 首页"今日照护安排"显示"No Data"

**后端现有API**:
```http
GET /api/care/tasks/today
Authorization: Bearer <token>
```

**前端需确认**:
1. 是否正确调用了 `/api/care/tasks/today`？
2. 数据库中是否有今天日期的任务数据？
3. 任务的 `scheduled_time` 是否是今天的日期？

**测试建议**:
可以直接用 curl 或 Postman 测试：
```bash
curl -H "Authorization: Bearer <token>" http://localhost:5000/api/care/tasks/today
```

---

### 5. 最新通知 (Notices) - ⚠️ 待前端确认

**问题现象**: 首页"最新通知"显示"No Data"

**后端现有API**:
```http
GET /api/notices?page=1&page_size=5
Authorization: Bearer <token>
```

**前端需确认**:
1. 是否正确调用了 `/api/notices`？
2. 数据库中是否有通知数据？

---

## 📋 完整API端点列表（首页相关）

| 功能 | API端点 | 状态 | 备注 |
|------|---------|------|------|
| 仪表盘统计 | GET `/api/dashboard/stats` | ✅ 可用 | 老人/床位/员工统计 |
| 护理记录列表 | GET `/api/care/records` | ✅ 已修复 | elderly_id现为可选 |
| 楼层床位统计 | GET `/api/beds/floor-stats` | ✅ 新增 | 按楼层统计床位 |
| 待办事项 | GET `/api/todos` | ✅ 新增 | 当前用户待办 |
| 今日照护任务 | GET `/api/care/tasks/today` | ⚠️ 待确认 | 检查调用方式 |
| 通知列表 | GET `/api/notices` | ⚠️ 待确认 | 检查调用方式 |

---

## 🔧 前端需要做的调整

### 1. 各楼层床位使用情况
- **改为调用**: `GET /api/beds/floor-stats`
- **数据格式**: 返回数组，每个元素包含 `floor`, `total`, `occupied`, `free`, `usage_rate`

### 2. 护理记录查询
- 如需查询所有记录，**不再传递** `elderly_id` 参数
- 如需按老人过滤，仍可传递 `elderly_id`

### 3. 待办事项
- 调用 `GET /api/todos` 获取列表
- 状态值: `open` (待处理) / `done` (已完成)

---

## 🐛 调试建议

如果某个接口仍返回空数据，请按以下步骤排查：

1. **检查网络请求**：F12 打开开发者工具 → Network → 查看实际请求URL和响应
2. **验证Token**：确保 Authorization header 正确携带 Bearer token
3. **检查数据库**：确认数据库中有相应的测试数据
4. **查看后端日志**：Spring Boot 控制台会显示错误信息

---

## 📞 联系方式

如有问题，请直接沟通或在项目群中反馈。

后端服务运行地址: `http://localhost:5000`
API文档: `http://localhost:5000/swagger-ui.html`
