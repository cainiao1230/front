<template>
  <div class="elderly-add-page">







































































































































































































































































































































































































**联系人**: 前端开发（需要时沟通字段格式）**最后更新**: 2026-01-24  ---3. **答辩前**: 所有演示数据准备完毕，接口响应正常2. **今天完成**: 床位新增/更新接口 + 今日任务接口1. **立即做**: 楼层统计接口 + 床位数据准备**优先级总结**:---- 后端返回: 保持一致，建议用 ISO 8601 格式- 前端发送: `YYYY-MM-DD` 或 `YYYY-MM-DDTHH:mm:ss`### 3. 日期时间格式前端发送请求时带 `Authorization: Bearer {token}` 头，后端需解析验证。### 2. Token 验证```CORS(app, origins=['http://localhost:5173'])from flask_cors import CORS```python确保后端允许前端域名跨域访问：### 1. CORS 配置## 📞 前后端联调要点---- 422: 参数格式错误- 409: 状态冲突（如床位已被占用）- 404: 资源不存在- 400: 参数校验失败（如床位编号重复）### 错误处理- 分页接口做好索引优化- 确保所有接口响应时间 < 500ms### 接口响应速度3. **任务数据**: 今日任务5个（2个完成、2个进行中、1个待开始）2. **老人数据**: 3个 pending 用于演示审批，10个 in 用于演示护理1. **床位数据**: 让使用率在 70-85% 之间（看起来业务繁忙但不拥挤）### 演示数据要点## 🎯 答辩演示建议配合---```}  }    "pages": 10            // 总页数（可选）    "page_size": 10,       // 每页条数    "page": 1,             // 当前页    "total": 100,          // 总条数    "items": [...],        // 当前页数据  "data": {  "message": "ok",  "code": 0,{```json### 3. 分页格式```}  "data": null  "message": "错误描述",  "code": 400/404/500,{// 失败}  "data": { ... }  "message": "ok",  "code": 0,{// 成功```json### 2. 统一响应格式前端已定义好所有接口路径和参数，后端照着实现即可。参考文件: `src/api/bed.js`, `src/api/dashboard.js`### 1. 使用前端已有的接口定义## 🛠️ 接口调试建议---- [ ] 公告表（notices）有 2-3 条测试数据- [ ] 至少2个用户（admin + nurse）可用于演示权限- [ ] 护理任务包含 pending/in_progress/completed 三种状态- [ ] 床位状态分布合理（70% occupied, 30% free）### 建议补充（演示更流畅）- [ ] `GET /api/dashboard/stats` 返回数据无 NaN 或 null- [ ] `GET /api/beds/floor-stats` 接口已实现并返回正确数据- [ ] `care_tasks` 表有 5个今日任务- [ ] `elderly` 表有 3个 pending + 10个 in 状态- [ ] 每张床位的 `floor` 字段已填写（不能为空）- [ ] `beds` 表有 30+ 条数据，至少3个楼层### 最低要求（答辩演示可用）## 📋 数据准备检查清单---```('page.system.users', '用户管理', '管理系统用户');('page.care.tasks', '护理任务', '管理护理任务'),('page.bed.allocate', '床位分配', '分配床位'),('page.bed', '床位管理', '访问床位管理'),('page.elderly.pending', '住房审批', '审批入住申请'),('page.elderly.list', '老人列表', '查看老人列表'),('page.dashboard', '首页', '访问首页'),INSERT INTO permissions (code, name, description) VALUES```sql**示例**:前端使用的权限码格式: `page.模块.功能`#### 7.2 权限列表（permissions 表）- `receptionist`: 前台（老人管理、床位查看）- `nurse`: 护理员（护理相关权限）- `admin`: 管理员（所有权限）确保数据库中至少有以下角色：#### 7.1 角色配置### 7. 权限数据准备---```).all()    )        Elderly.id_number.like(f'%{keyword}%')        Elderly.phone.like(f'%{keyword}%'),        Elderly.name.like(f'%{keyword}%'),    or_(results = db.query(Elderly).filter(keyword = request.args.get('keyword')```python**建议**: 支持模糊搜索多个字段**接口**: `GET /api/elderly/search?keyword={keyword}`### 6. 老人搜索接口优化## 🟢 P2 级别（可选，锦上添花）---```}  ]    }      "assigned_to_name": "护工小王"      "assigned_to": 10,      "scheduled_time": "2026-01-24T08:00:00",      "priority": "high",      "status": "pending",      "description": "协助洗漱",      "title": "晨间护理",      "elderly_name": "张三",      "elderly_id": 5,      "id": 1,    {  "data": [  "message": "ok",  "code": 0,{```json**响应格式**:```).all()    func.date(CareTask.scheduled_time) == todaytasks = db.query(CareTask).filter(today = datetime.now().date()# 筛选今日的任务（scheduled_time 在今天）```python**建议逻辑**:**当前问题**: 前端需要今日任务，后端可能返回所有任务**接口**: `GET /api/care/tasks/today`### 5. 今日护理任务接口优化---**注意**: 如果床位已被占用（status=occupied），不允许修改 `floor`, `room`, `bed_no` 等核心字段**请求体**: 同新增（允许部分字段更新）**接口**: `PUT /api/beds/{id}`#### 4.2 更新床位```}  }    ...    "bed_no": "301-1",    "id": 100,  "data": {  "message": "床位添加成功",  "code": 0,{```json**响应**: ```}  "status": "free"  "price": 2000,  "bed_type": "single",  "building": "1号楼",  "floor": "3",  "room": "301",  "bed_no": "301-1",{```json**请求体**:**接口**: `POST /api/beds`#### 4.1 新增床位### 4. 床位管理接口完整性---- 各项统计与数据库实际数据一致- 数字计算正确（不要出现 0/0 导致 NaN）**确保**:```}  }    }      "in_progress": 3    // 进行中      "pending": 10,      // 未开始      "completed": 15,    // 已完成      "total": 28,        // 今日任务总数    "todayTasks": {    },      "active": 12        // 在岗      "total": 15,        // 护工总数    "caregivers": {    },      "occupancyRate": 78.2  // 使用率      "free": 12,         // 空闲      "occupied": 43,     // 已占用      "total": 55,        // 床位总数    "beds": {    },      "pending": 3        // 待审批      "in": 42,           // 已入住      "total": 45,        // 老人总数    "elderly": {  "data": {  "message": "ok",  "code": 0,{```json**检查要点**:**接口**: `GET /api/dashboard/stats`### 3. 确保仪表盘统计接口数据准确## 🟡 P1 级别（建议完成，提升演示效果）---```(3, '陪同就医', '眼科复查', 'completed', 'medium', '2026-01-24 10:00:00', 10);(2, '用药提醒', '高血压药物服用', 'in_progress', 'high', '2026-01-24 09:00:00', 11),(1, '晨间护理', '协助洗漱、更衣', 'pending', 'high', '2026-01-24 08:00:00', 10),INSERT INTO care_tasks (elderly_id, title, description, status, priority, scheduled_time, assigned_to) VALUES```sql**示例**:- 包含不同状态：pending、in_progress、completed- 5-8个今日任务（scheduled_time 为今天）**最少准备**: **状态流转**: `pending` → `in_progress` → `completed`#### 2.3 护理任务数据（care_tasks 表）- `bed_id`: 床位ID（已入住的需要关联床位）- `admission_date`: 入住日期- `care_level`: 护理等级（`self_care`, `semi_care`, `full_care`）- `status`: 状态- `name`: 姓名**关键字段**:- 10-15个 in 状态（演示护理任务、床位分配）- 3-5个 pending 状态（演示审批）**最少准备**: - `out`: 已退房- `in`: 已入住（用于演示护理任务）- `pending`: 待审批（用于演示审批流程）**状态说明**:#### 2.2 老人数据（elderly 表）```-- 继续添加更多数据...('201-2', '201', '2', '1号楼', 'occupied', 'vip', 5000);('201-1', '201', '2', '1号楼', 'free', 'single', 2000),('102-1', '102', '1', '1号楼', 'occupied', 'double', 3000),('101-2', '101', '1', '1号楼', 'free', 'single', 2000),('101-1', '101', '1', '1号楼', 'occupied', 'single', 2000),INSERT INTO beds (bed_no, room, floor, building, status, bed_type, price) VALUES```sql**示例SQL**:**最少准备**: 3个楼层，每层至少10张床位（部分occupied，部分free）- `price`: 价格（如 2000）- `bed_type`: 床位类型（`single`, `double`, `vip` 之一）- `status`: 状态（`free`, `occupied`, `maintenance`, `locked` 之一）- `building`: 楼栋（如 "1号楼"）- `floor`: 楼层（必须填写，如 "1", "2", "3"）- `room`: 房间号（如 "101", "201"）- `bed_no`: 床位编号（如 "101-1", "201-2"）**必填字段**:#### 2.1 床位数据（beds 表）### 2. 准备演示数据---**影响功能**: 首页"各楼层床位使用情况"模块```ORDER BY floor;GROUP BY floorFROM beds    ROUND(SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1) as usage_rate    SUM(CASE WHEN status = 'locked' THEN 1 ELSE 0 END) as locked,    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance,    SUM(CASE WHEN status = 'free' THEN 1 ELSE 0 END) as free,    SUM(CASE WHEN status = 'occupied' THEN 1 ELSE 0 END) as occupied,    COUNT(*) as total,    floor,SELECT ```sql**SQL 参考**:```}  ]    }      "usage_rate": 90.0      "locked": 0,      "maintenance": 0,      "free": 2,      "occupied": 18,      "total": 20,      "floor": "2",    {    },      "usage_rate": 75.0      "locked": 0,      "maintenance": 0,      "free": 5,      "occupied": 15,      "total": 20,      "floor": "1",    {  "data": [  "message": "ok",  "code": 0,{```json**响应格式**:**请求**: 无参数**功能**: 按楼层统计床位使用情况**接口**: `GET /api/beds/floor-stats`### 1. 实现楼层床位统计接口 ⭐⭐⭐## 🔴 P0 级别（答辩前必须完成）---> **优先级**: 🔴 高优先级必须完成，🟡 中优先级建议完成，🟢 低优先级可选> **目的**: 配合前端完成答辩演示，确保核心功能可用  > **文档生成时间**: 2026-01-24      <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">{{ isEdit ? '编辑老人信息' : '新增老人' }}</span>
      </template>
    </el-page-header>

    <el-card class="form-card" shadow="never">
      <!-- 头像上传部分 -->
      <div class="avatar-section">
        <div class="avatar-upload">
          <el-upload
            class="avatar-uploader"
            action="#"
            :auto-upload="false"
            :on-change="handleAvatarChange"
            :show-file-list="false"
          >
            <img v-if="form.avatar" :src="form.avatar" class="avatar-img" />
            <div v-else class="avatar-placeholder">
              <el-icon class="icon"><Plus /></el-icon>
              <span>上传头像</span>
            </div>
          </el-upload>
        </div>
        <div class="avatar-info">
          <div class="info-item">
            <span class="label">年龄：</span>
            <span class="value">{{ calculateAge }}</span>
          </div>
          <div class="info-item">
            <span class="label">入住时长：</span>
            <span class="value">{{ calculateStayDays }}</span>
          </div>
        </div>
      </div>

      <el-divider />

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        size="default"
      >
        <!-- 基本信息 -->
        <el-divider content-position="left">
          <el-icon><User /></el-icon> 基本信息
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="请输入老人姓名" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio label="male">男</el-radio>
                <el-radio label="female">女</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="出生日期" prop="birthday">
              <el-date-picker
                v-model="form.birthday"
                type="date"
                placeholder="选择出生日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="年龄">
              <el-input :value="calculateAge" disabled placeholder="自动计算" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="身份证号" prop="id_number">
              <el-input v-model="form.id_number" placeholder="请输入身份证号" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="form.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 护理信息 -->
        <el-divider content-position="left">
          <el-icon><FirstAidKit /></el-icon> 护理信息
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="护理等级" prop="care_level">
              <el-select v-model="form.care_level" placeholder="请选择护理等级" style="width: 100%">
                <el-option label="自理" value="self_care">
                  <div style="display: flex; align-items: center; justify-content: space-between">
                    <span>自理</span>
                    <el-tag type="success" size="small">生活完全自理</el-tag>
                  </div>
                </el-option>
                <el-option label="半护理" value="semi_care">
                  <div style="display: flex; align-items: center; justify-content: space-between">
                    <span>半护理</span>
                    <el-tag type="warning" size="small">需部分协助</el-tag>
                  </div>
                </el-option>
                <el-option label="全护理" value="full_care">
                  <div style="display: flex; align-items: center; justify-content: space-between">
                    <span>全护理</span>
                    <el-tag type="danger" size="small">需全面照料</el-tag>
                  </div>
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="入住日期" prop="admission_date">
              <el-date-picker
                v-model="form.admission_date"
                type="date"
                placeholder="选择入住日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="既往病史">
              <el-input
                v-model="form.medical_history"
                type="textarea"
                :rows="3"
                placeholder="请输入既往病史，如：高血压、糖尿病等"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="过敏信息">
              <el-input
                v-model="form.allergies"
                type="textarea"
                :rows="3"
                placeholder="请输入过敏信息，如：青霉素、海鲜等"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 紧急联系人 -->
        <el-divider content-position="left">
          <el-icon><Phone /></el-icon> 紧急联系人
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="联系人姓名" prop="emergency_contact_name">
              <el-input v-model="form.emergency_contact_name" placeholder="请输入联系人姓名" />
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="联系人电话" prop="emergency_contact_phone">
              <el-input v-model="form.emergency_contact_phone" placeholder="请输入联系人电话" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="与老人关系">
              <el-input v-model="form.relationship" placeholder="如：子女、配偶等" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 其他信息 -->
        <el-divider content-position="left">
          <el-icon><Document /></el-icon> 其他信息
        </el-divider>

        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input
                v-model="form.remarks"
                type="textarea"
                :rows="3"
                placeholder="其他需要说明的信息"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading" size="large">
            <el-icon><Check /></el-icon> {{ isEdit ? '保存修改' : '确认新增' }}
          </el-button>
          <el-button @click="handleReset" size="large">
            <el-icon><RefreshLeft /></el-icon> 重置
          </el-button>
          <el-button @click="goBack" size="large">
            <el-icon><Close /></el-icon> 取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, FirstAidKit, Phone, Document, Check, RefreshLeft, Close, Plus } from '@element-plus/icons-vue'
import { createElderly, updateElderly, getElderlyDetail } from '@/api'
import { formatDate } from '@/utils/format'

const router = useRouter()
const route = useRoute()
const formRef = ref(null)
const loading = ref(false)
const isEdit = ref(false)

// 表单数据
const form = ref({
  avatar: '',
  name: '',
  gender: 'male',
  birthday: '',
  id_number: '',
  phone: '',
  care_level: 'self_care',
  admission_date: '',
  medical_history: '',
  allergies: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  relationship: '',
  remarks: ''
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入老人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  birthday: [
    { required: true, message: '请选择出生日期', trigger: 'change' }
  ],
  id_number: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    { pattern: /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  care_level: [
    { required: true, message: '请选择护理等级', trigger: 'change' }
  ],
  admission_date: [
    { required: true, message: '请选择入住日期', trigger: 'change' }
  ],
  emergency_contact_name: [
    { required: true, message: '请输入紧急联系人姓名', trigger: 'blur' }
  ],
  emergency_contact_phone: [
    { required: true, message: '请输入紧急联系人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 计算年龄
const calculateAge = computed(() => {
  if (!form.value.birthday) return '-'
  const birthday = new Date(form.value.birthday)
  const today = new Date()
  let age = today.getFullYear() - birthday.getFullYear()
  const monthDiff = today.getMonth() - birthday.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthday.getDate())) {
    age--
  }
  return age > 0 ? `${age} 岁` : '-'
})

// 计算入住时长
const calculateStayDays = computed(() => {
  if (!form.value.admission_date) return '-'
  const admission = new Date(form.value.admission_date)
  const today = new Date()
  const diff = today.getTime() - admission.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return '今日入住'
  if (days === 1) return '1 天'
  return `${days} 天`
})

// 头像处理
const handleAvatarChange = (file) => {
  if (!file.raw) return
  
  // 限制文件大小（2MB）
  if (file.raw.size > 2 * 1024 * 1024) {
    ElMessage.error('头像大小不能超过 2MB')
    return
  }
  
  // 限制文件类型
  if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.raw.type)) {
    ElMessage.error('只支持 JPG、PNG、GIF 格式的图片')
    return
  }
  
  // 使用 FileReader 转换为 base64
  const reader = new FileReader()
  reader.onload = (e) => {
    form.value.avatar = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

// 返回
const goBack = () => {
  router.back()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        if (isEdit.value) {
          await updateElderly(route.params.id, form.value)
          ElMessage.success('老人信息更新成功')
        } else {
          await createElderly(form.value)
          ElMessage.success('老人信息添加成功')
        }
        router.push('/home/elderlies/list')
      } catch (error) {
        ElMessage.error(error.response?.data?.detail || '操作失败')
      } finally {
        loading.value = false
      }
    } else {
      ElMessage.warning('请填写完整的表单信息')
    }
  })
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  // 重置非表单项字段
  form.value = {
    avatar: '',
    name: '',
    gender: 'male',
    birthday: '',
    id_number: '',
    phone: '',
    care_level: 'self_care',
    admission_date: new Date().toISOString().split('T')[0],
    medical_history: '',
    allergies: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    relationship: '',
    remarks: ''
  }
}

// 加载老人详情（编辑模式）
const loadElderlyDetail = async () => {
  try {
    const response = await getElderlyDetail(route.params.id)
    form.value = { ...form.value, ...response.data }
  } catch (error) {
    ElMessage.error('加载老人信息失败')
    router.back()
  }
}

onMounted(() => {
  // 判断是否为编辑模式
  if (route.params.id) {
    isEdit.value = true
    loadElderlyDetail()
  } else {
    // 新增模式：默认入住日期为今天
    form.value.admission_date = new Date().toISOString().split('T')[0]
  }
})
</script>

<style scoped>
.elderly-add-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.form-card {
  margin-top: 20px;
  max-width: 1200px;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 40px;
  margin-bottom: 24px;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 8px;
}

.avatar-upload {
  flex-shrink: 0;
}

.avatar-uploader {
  width: 120px;
  height: 120px;
}

:deep(.avatar-uploader .el-upload) {
  border: 2px dashed #409eff;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

:deep(.avatar-uploader .el-upload:hover) {
  border-color: #66b1ff;
  background-color: #f5f7fa;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  color: #909399;
  font-size: 14px;
}

.avatar-placeholder .icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.avatar-img {
  width: 120px;
  height: 120px;
  display: block;
  border-radius: 6px;
  object-fit: cover;
}

.avatar-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.info-item .label {
  color: #606266;
  min-width: 60px;
}

.info-item .value {
  color: #303133;
  font-weight: 600;
}

:deep(.el-divider) {
  margin: 32px 0 24px;
}

:deep(.el-divider__text) {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

:deep(.el-form-item) {
  margin-bottom: 24px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

.el-button + .el-button {
  margin-left: 12px;
}
</style>