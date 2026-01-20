# 首页功能实现情况说明

> **文档生成时间**: 2026-01-20  
> **问题**: 首页"各楼层床位使用情况"显示 No Data  
> **原因分析**: 后端接口未实现或数据为空  

---

## 🔍 问题定位

### 现象
用户打开首页时，"各楼层床位使用情况"模块显示 **No Data**（无数据）。

### 前端实现情况
✅ 前端代码已完成，包括：
- 数据加载逻辑
- 错误处理和回退机制
- 界面展示组件
- 加载动画

### 后端接口依赖

首页楼层床位统计功能依赖以下接口（**按优先级排序**）：

#### 主接口（优先使用）
```
GET /api/beds/floor-stats
```

**优先级**: 🔴 高  
**状态**: ⚠️ 可能未实现  

**功能**: 获取各楼层的床位统计数据

**请求**: 无参数

**期望响应**:
```json
{
  "code": 0,
  "message": "ok",
  "data": [
    {
      "floor": "1F",
      "total": 20,
      "occupied": 15,
      "free": 5,
      "maintenance": 0,
      "locked": 0,
      "usage_rate": 75.0
    },
    {
      "floor": "2F",
      "total": 20,
      "occupied": 18,
      "free": 2,
      "maintenance": 0,
      "locked": 0,
      "usage_rate": 90.0
    },
    {
      "floor": "3F",
      "total": 15,
      "occupied": 10,
      "free": 5,
      "maintenance": 0,
      "locked": 0,
      "usage_rate": 66.7
    }
  ]
}
```

**字段说明**:
- `floor`: 楼层名称（如 "1F", "2F", "3F"）
- `total`: 该楼层总床位数
- `occupied`: 已占用床位数
- `free`: 空闲床位数
- `maintenance`: 维护中床位数
- `locked`: 锁定床位数
- `usage_rate`: 使用率百分比（0-100）

---

#### 备用接口（回退方案）
```
GET /api/dashboard/stats
```

**优先级**: 🟡 中  
**状态**: ✅ 应该已实现  

**功能**: 获取仪表盘统计数据（包含全部床位汇总）

**期望响应**:
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

**说明**: 
- 当 `GET /api/beds/floor-stats` 失败时，前端会自动使用这个接口的床位数据
- 只能显示全部床位的汇总，无法按楼层分类
- 用户体验会下降（无法看到各楼层明细）

---

## 🎯 前端代码逻辑

### 数据加载流程

```javascript
async function loadFloors() {
  try {
    // 1. 优先尝试楼层统计接口
    const res = await getBedStatsByFloor()
    
    if (接口成功 && 有数据) {
      // 展示各楼层数据
      显示楼层明细表格
    } else {
      // 2. 回退到仪表盘统计
      const dashRes = await getDashboardStats()
      
      if (仪表盘成功 && 有床位数据) {
        // 展示全部床位汇总
        显示单行汇总数据
      } else {
        // 3. 完全失败
        显示 No Data
      }
    }
  } catch (error) {
    // 4. 出错时的回退逻辑
    尝试仪表盘统计
  }
}
```

### 前端已实现的错误处理

1. **控制台日志**: 详细记录每个步骤的结果
   ```javascript
   console.log('[首页] 楼层统计接口响应:', res)
   console.log('[首页] 楼层数据加载成功:', floors.value)
   console.warn('[首页] 楼层统计接口返回格式异常，尝试使用仪表盘统计')
   ```

2. **用户提示**: 当数据加载失败时显示友好提示
   ```javascript
   ElMessage.warning('床位数据加载失败，请稍后刷新')
   ElMessage.error('无法加载床位数据')
   ```

3. **加载状态**: 显示 loading 动画，防止用户以为页面卡住

---

## 🛠️ 后端实现建议

### 方案 1: 实现楼层统计接口（推荐）

**文件位置**: `backend/routes/beds.py` 或 `backend/controllers/bed_controller.py`

**实现逻辑**:
```python
@router.get("/beds/floor-stats")
def get_bed_stats_by_floor():
    """获取各楼层床位统计"""
    try:
        # 1. 从数据库按楼层分组统计
        floors = db.query(
            Bed.floor,
            func.count(Bed.id).label('total'),
            func.sum(case((Bed.status == 'occupied', 1), else_=0)).label('occupied'),
            func.sum(case((Bed.status == 'free', 1), else_=0)).label('free'),
            func.sum(case((Bed.status == 'maintenance', 1), else_=0)).label('maintenance'),
            func.sum(case((Bed.status == 'locked', 1), else_=0)).label('locked')
        ).group_by(Bed.floor).all()
        
        # 2. 计算使用率
        result = []
        for floor in floors:
            usage_rate = (floor.occupied / floor.total * 100) if floor.total > 0 else 0
            result.append({
                'floor': floor.floor,
                'total': floor.total,
                'occupied': floor.occupied,
                'free': floor.free,
                'maintenance': floor.maintenance,
                'locked': floor.locked,
                'usage_rate': round(usage_rate, 1)
            })
        
        return {
            'code': 0,
            'message': 'ok',
            'data': result
        }
    except Exception as e:
        return {
            'code': 500,
            'message': str(e),
            'data': []
        }
```

**SQL 示例**:
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

---

### 方案 2: 确保仪表盘统计接口正常（最低要求）

如果暂时无法实现楼层统计，至少要保证 `GET /api/dashboard/stats` 返回正确的床位数据。

**检查要点**:
1. 接口能正常访问（不返回 404）
2. 返回的 JSON 格式正确
3. `data.beds` 对象包含所需字段
4. 床位数量计算正确

---

## 🧪 测试方法

### 1. 测试楼层统计接口

```bash
# 使用 curl 测试
curl -X GET http://localhost:5000/api/beds/floor-stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# 预期看到各楼层的统计数据
```

### 2. 测试仪表盘统计接口

```bash
curl -X GET http://localhost:5000/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_TOKEN"

# 确认响应中包含 beds 对象
```

### 3. 前端调试

打开浏览器控制台（F12），刷新首页，查看：

**Console 标签**:
- 应该看到 `[首页] 楼层统计接口响应:` 日志
- 查看返回的数据结构是否正确

**Network 标签**:
- 找到 `/api/beds/floor-stats` 请求
- 查看状态码（应该是 200）
- 查看响应内容是否符合预期

---

## 📊 数据库检查

### 检查床位表数据

```sql
-- 1. 检查床位总数
SELECT COUNT(*) as total_beds FROM beds;

-- 2. 检查各楼层床位数量
SELECT floor, COUNT(*) as count 
FROM beds 
GROUP BY floor 
ORDER BY floor;

-- 3. 检查各状态床位数量
SELECT status, COUNT(*) as count 
FROM beds 
GROUP BY status;

-- 4. 检查是否有楼层字段为空
SELECT COUNT(*) as beds_without_floor 
FROM beds 
WHERE floor IS NULL OR floor = '';
```

### 可能的问题

1. **床位表为空**: 需要先添加测试数据
2. **楼层字段为空**: 需要更新床位记录，填写楼层信息
3. **状态字段值不规范**: 应该是 `free`, `occupied`, `maintenance`, `locked` 之一

---

## ✅ 解决方案优先级

### 立即处理（影响用户体验）
1. ✅ 实现 `GET /api/beds/floor-stats` 接口
2. ✅ 确保数据库床位表有数据且楼层字段已填写
3. ✅ 测试接口返回格式是否符合前端预期

### 短期优化（提升功能）
4. 🔄 如果床位表数据不完整，先添加测试数据
5. 🔄 完善 dashboard 统计接口，作为可靠的回退方案

### 长期改进（增强体验）
6. 📈 添加床位使用趋势图表
7. 📊 添加床位热力图展示
8. 🔔 添加床位预警功能（如某楼层即将满员）

---

## 📝 前后端对接检查清单

### 后端开发
- [ ] `GET /api/beds/floor-stats` 接口已实现
- [ ] 接口返回格式与文档一致
- [ ] SQL 查询逻辑正确（按楼层分组）
- [ ] 使用率计算正确（保留一位小数）
- [ ] 接口已添加权限验证
- [ ] 已编写单元测试

### 数据准备
- [ ] 床位表有测试数据
- [ ] 每条床位记录的 floor 字段已填写
- [ ] status 字段值规范（free/occupied/maintenance/locked）
- [ ] 至少有 2-3 个不同楼层的数据

### 前端验证
- [ ] 打开首页，床位表格有数据显示
- [ ] 控制台无错误日志
- [ ] Network 请求成功（200 状态码）
- [ ] 点击楼层行可以跳转到床位详情

---

## 🔗 相关文档

- [API 完整清单](./API_INTERFACE_CHECKLIST.md) - 第 3.12 节
- [补充接口文档](./API_SUPPLEMENTARY_INTERFACES.md)
- 前端代码: [src/views/dashboard/HomeView.vue](./src/views/dashboard/HomeView.vue) - 第 573 行
- 接口定义: [src/api/bed.js](./src/api/bed.js) - getBedStatsByFloor

---

## 🎯 预期效果

实现后，首页应显示：

| 楼层 | 总床位 | 已占用 | 空余 | 使用率 |
|------|--------|--------|------|--------|
| 1F   | 20     | 15     | 5    | ████████░░ 75% |
| 2F   | 20     | 18     | 2    | █████████░ 90% |
| 3F   | 15     | 10     | 5    | ███████░░░ 67% |
| 4F   | 18     | 12     | 6    | ███████░░░ 67% |
| 5F   | 22     | 16     | 6    | ████████░░ 73% |

**总使用率**: 77%

---

**最后更新**: 2026-01-20  
**紧急程度**: 🔴 高优先级  
**预计解决时间**: 0.5 人天  
**建议负责人**: 后端开发 + 数据库管理员
