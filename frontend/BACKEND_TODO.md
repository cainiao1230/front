# 后端待办事项清单

> **文档生成时间**: 2026-01-24  
> **目的**: 配合前端完成答辩演示，确保核心功能可用  
> **优先级**: 🔴 高优先级必须完成，🟡 中优先级建议完成，🟢 低优先级可选

---

## 🔴 P0 级别（答辩前必须完成）

### 0. 【重要】修复时区问题 ⭐⭐⭐⭐⭐
**问题描述**: 前端选择时间后，数据库保存的时间比选择的时间早8小时

**原因**: 后端可能将前端传来的本地时间（北京时间 UTC+8）误解析为 UTC 时间

**解决方案（任选其一）**:

**方案1**: 后端解析时间时明确使用北京时区
```python
# Python Flask 示例
from datetime import datetime
import pytz

beijing_tz = pytz.timezone('Asia/Shanghai')
# 解析时间时指定时区
scheduled_time = datetime.strptime(time_str, '%Y-%m-%d %H:%M:%S')
scheduled_time = beijing_tz.localize(scheduled_time)
```

**方案2**: 数据库和后端统一使用 UTC，但前端传入时带时区信息
```javascript
// 前端示例：发送带时区的 ISO 格式
new Date().toISOString() // 2026-01-24T08:00:00.000Z
```

**方案3（推荐，最简单）**: 后端直接存储前端传来的字符串，不做时区转换
```python
# 直接使用字符串存入数据库的 DATETIME 字段
scheduled_time = request.json.get('scheduled_time')  # "2026-01-24 16:00:00"
# 不要用 datetime.fromisoformat() 或其他会做时区转换的方法
```

**验证方法**:
1. 前端选择 2026-01-24 16:00
2. 检查数据库，应该也是 2026-01-24 16:00:00
3. 如果数据库显示 2026-01-24 08:00:00，说明被减了8小时

---

### 1. 实现楼层床位统计接口 ⭐⭐⭐
**接口**: `GET /api/beds/floor-stats`

**功能**: 按楼层统计床位使用情况

**请求**: 无参数

**响应格式**:
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "floor": "1",
      "total": 20,
      "occupied": 15,
      "free": 5,
      "maintenance": 0,
      "locked": 0,
      "usage_rate": 75.0
    },
    {
      "floor": "2",
      "total": 20,
      "occupied": 18,
      "free": 2,
      "maintenance": 0,
      "locked": 0,
      "usage_rate": 90.0
    }
  ]
}
```

**SQL 参考**:
```sql
SELECT 
    floor,
    COUNT(*) as total,
    SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,
    SUM(CASE WHEN status = 'free' THEN 1 ELSE 0 END) as free,
    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,
    SUM(CASE WHEN status = 'locked' THEN 1 ELSE 0 END) as locked,
    ROUND(SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as usage_rate
FROM beds
GROUP BY floor
ORDER BY floor;
```

**影响功能**: 首页"各楼层床位使用情况"模块

---

### 2. 准备演示数据

#### 2.1 床位数据（beds 表）
**必填字段**:
- `bed_no`: 床位编号（如 "101-1", "201-2"）
- `room`: 房间号（如 "101", "201"）
- `floor`: 楼层（必须填写，如 "1", "2", "3"）
- `building`: 楼栋（如 "1号楼"）
- `status`: 状态（`free`, `occupied`, `maintenance`, `locked` 之一）
- `bed_type`: 床位类型（`single`, `double`, `vip` 之一）
- `price`: 价格（如 2000）

**最少准备**: 3个楼层，每层至少10张床位（部分occupied，部分free）

**示例SQL**:
```sql
INSERT INTO beds (bed_no, room, floor, building, status, bed_type, price) VALUES
('101-1', '101', '1', '1号楼', 'occupied', 'single', 2000),
('101-2', '101', '1', '1号楼', 'free', 'single', 2000),
('102-1', '102', '1', '1号楼', 'occupied', 'double', 3000),
('201-1', '201', '2', '1号楼', 'free', 'single', 2000),
('201-2', '201', '2', '1号楼', 'occupied', 'vip', 5000);
-- 继续添加更多数据...
```

#### 2.2 老人数据（elderly 表）
**状态说明**:
- `pending`: 待审批（用于演示审批流程）
- `in`: 已入住（用于演示护理任务）
- `out`: 已退房

**最少准备**: 
- 3-5个 pending 状态（演示审批）
- 10-15个 in 状态（演示护理任务、床位分配）

**关键字段**:
- `name`: 姓名
- `status`: 状态
- `care_level`: 护理等级（`self_care`, `semi_care`, `full_care`）
- `admission_date`: 入住日期
- `bed_id`: 床位ID（已入住的需要关联床位）

#### 2.3 护理任务数据（care_tasks 表）
**状态流转**: `pending` → `in_progress` → `completed`

**最少准备**: 
- 5-8个今日任务（scheduled_time 为今天）
- 包含不同状态：pending、in_progress、completed

**示例**:
```sql
INSERT INTO care_tasks (elderly_id, title, description, status, priority, scheduled_time, assigned_to) VALUES
(1, '晨间护理', '协助洗漱、更衣', 'pending', 'high', '2026-01-24 08:00:00', 10),
(2, '用药提醒', '高血压药物服用', 'in_progress', 'high', '2026-01-24 09:00:00', 11),
(3, '陪同就医', '眼科复查', 'completed', 'medium', '2026-01-24 10:00:00', 10);
```

---

## 🟡 P1 级别（建议完成，提升演示效果）

### 3. 确保仪表盘统计接口数据准确
**接口**: `GET /api/dashboard/stats`

**检查要点**:
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "elderly": {
      "total": 45,
      "in": 42,
      "pending": 3
    },
    "beds": {
      "total": 55,
      "occupied": 43,
      "free": 12,
      "occupancyRate": 78.2
    },
    "caregivers": {
      "total": 15,
      "active": 12
    },
    "todayTasks": {
      "total": 28,
      "completed": 15,
      "pending": 10,
      "in_progress": 3
    }
  }
}
```

**确保**:
- 数字计算正确（不要出现 0/0 导致 NaN）
- 各项统计与数据库实际数据一致

---

### 4. 床位管理接口完整性

#### 4.1 新增床位
**接口**: `POST /api/beds`

**请求体**:
```json
{
  "bed_no": "301-1",
  "room": "301",
  "floor": "3",
  "building": "1号楼",
  "bed_type": "single",
  "price": 2000,
  "status": "free"
}
```

#### 4.2 更新床位
**接口**: `PUT /api/beds/{id}`

**请求体**: 同新增（允许部分字段更新）

---

### 5. 今日护理任务接口优化
**接口**: `GET /api/care/tasks/today`

**建议逻辑**:
```python
today = datetime.now().date()
tasks = db.query(CareTask).filter(
    func.date(CareTask.scheduled_time) == today
).all()
```

**响应格式**:
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "elderly_id": 5,
      "elderly_name": "张三",
      "title": "晨间护理",
      "description": "协助洗漱",
      "status": "pending",
      "priority": "high",
      "scheduled_time": "2026-01-24T08:00:00",
      "assigned_to": 10,
      "assigned_to_name": "护工小王"
    }
  ]
}
```

---

## 🟢 P2 级别（可选，锦上添花）

### 6. 老人搜索接口优化
**接口**: `GET /api/elderly/search?keyword={keyword}`

**建议**: 支持模糊搜索多个字段
```python
keyword = request.args.get('keyword')
results = db.query(Elderly).filter(
    or_(
        Elderly.name.like(f'%{keyword}%'),
        Elderly.phone.like(f'%{keyword}%'),
        Elderly.id_number.like(f'%{keyword}%')
    )
).all()
```

---

### 7. 权限数据准备

#### 7.1 角色配置
确保数据库中至少有以下角色：
- `admin`: 管理员（所有权限）
- `nurse`: 护理员（护理相关权限）
- `receptionist`: 前台（老人管理、床位查看）

#### 7.2 权限列表（permissions 表）
```sql
INSERT INTO permissions (code, name, description) VALUES
('page.dashboard', '首页', '访问首页'),
('page.elderly.list', '老人列表', '查看老人列表'),
('page.elderly.pending', '住房审批', '审批入住申请'),
('page.bed', '床位管理', '访问床位管理'),
('page.bed.allocate', '床位分配', '分配床位'),
('page.care.tasks', '护理任务', '管理护理任务'),
('page.system.users', '用户管理', '管理系统用户');
```

---

## 📋 数据准备检查清单

### 最低要求（答辩演示可用）
- [ ] `beds` 表有 30+ 条数据，至少3个楼层
- [ ] 每张床位的 `floor` 字段已填写（不能为空）
- [ ] `elderly` 表有 3个 pending + 10个 in 状态
- [ ] `care_tasks` 表有 5个今日任务
- [ ] `GET /api/beds/floor-stats` 接口已实现
- [ ] `GET /api/dashboard/stats` 返回数据无 NaN

### 建议补充
- [ ] 床位状态分布合理（70% occupied, 30% free）
- [ ] 护理任务包含 pending/in_progress/completed 三种状态
- [ ] 至少2个用户（admin + nurse）可用于演示权限
- [ ] 公告表（notices）有 2-3 条测试数据

---

## 🛠️ 接口规范

### 统一响应格式
```json
// 成功
{ "code": 0, "message": "ok", "data": { ... } }

// 失败
{ "code": 400, "message": "错误描述", "data": null }
```

### 分页格式
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

### CORS 配置
```python
from flask_cors import CORS
CORS(app, origins=['http://localhost:5173'])
```

---

## 🎯 优先级总结

1. **立即做**: 楼层统计接口 + 床位数据准备
2. **今天完成**: 床位新增/更新接口 + 今日任务接口
3. **答辩前**: 所有演示数据准备完毕

---

**最后更新**: 2026-01-24
