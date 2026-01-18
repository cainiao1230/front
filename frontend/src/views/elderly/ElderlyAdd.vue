<template>
  <div class="elderly-add-page">
    <el-page-header @back="goBack" title="返回">
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