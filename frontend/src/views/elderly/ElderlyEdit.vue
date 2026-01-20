<template>
  <div class="elderly-edit-page">
    <el-card shadow="never" v-loading="loading">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button :icon="ArrowLeft" @click="goBack">返回</el-button>
            <span class="title">编辑老人信息</span>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        class="edit-form"
      >
        <!-- 基本信息 -->
        <div class="form-section">
          <h3><el-icon><User /></el-icon> 基本信息</h3>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="姓名" prop="name">
                <el-input v-model="form.name" placeholder="请输入姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="form.gender">
                  <el-radio value="male">男</el-radio>
                  <el-radio value="female">女</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="出生日期" prop="birthday">
                <el-date-picker
                  v-model="form.birthday"
                  type="date"
                  placeholder="选择出生日期"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="身份证号" prop="id_number">
                <el-input v-model="form.id_number" placeholder="请输入身份证号" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="联系电话" prop="phone">
                <el-input v-model="form.phone" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="护理等级" prop="care_level">
                <el-select v-model="form.care_level" placeholder="请选择护理等级" style="width: 100%">
                  <el-option label="自理" value="self_care" />
                  <el-option label="半护理" value="semi_care" />
                  <el-option label="全护理" value="full_care" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 紧急联系人 -->
        <div class="form-section">
          <h3><el-icon><Phone /></el-icon> 紧急联系人</h3>
          
          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="联系人姓名" prop="emergency_contact_name">
                <el-input v-model="form.emergency_contact_name" placeholder="请输入紧急联系人姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系人电话" prop="emergency_contact_phone">
                <el-input v-model="form.emergency_contact_phone" placeholder="请输入紧急联系人电话" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- 健康信息 -->
        <div class="form-section">
          <h3><el-icon><FirstAidKit /></el-icon> 健康信息</h3>
          
          <el-form-item label="病史">
            <el-input
              v-model="form.medical_history"
              type="textarea"
              :rows="3"
              placeholder="请输入病史信息（如：高血压、糖尿病等）"
            />
          </el-form-item>

          <el-form-item label="过敏史">
            <el-input
              v-model="form.allergies"
              type="textarea"
              :rows="2"
              placeholder="请输入过敏信息（如：青霉素过敏）"
            />
          </el-form-item>

          <el-form-item label="备注">
            <el-input
              v-model="form.notes"
              type="textarea"
              :rows="3"
              placeholder="其他需要注意的信息"
            />
          </el-form-item>
        </div>

        <!-- 提交按钮 -->
        <div class="form-actions">
          <el-button @click="goBack">取消</el-button>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            保存修改
          </el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Phone, FirstAidKit } from '@element-plus/icons-vue'
import { getElderlyDetail, updateElderly } from '@/api'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)

const form = reactive({
  id: null,
  name: '',
  gender: 'male',
  birthday: '',
  id_number: '',
  phone: '',
  care_level: 'semi_care',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  medical_history: '',
  allergies: '',
  notes: ''
})

const rules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  care_level: [{ required: true, message: '请选择护理等级', trigger: 'change' }],
  emergency_contact_name: [{ required: true, message: '请输入紧急联系人姓名', trigger: 'blur' }],
  emergency_contact_phone: [
    { required: true, message: '请输入紧急联系人电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 加载老人详情
const loadElderlyDetail = async () => {
  const id = route.params.id
  if (!id) {
    ElMessage.error('缺少老人ID')
    return
  }

  loading.value = true
  try {
    const res = await getElderlyDetail(id)
    const data = res.data || res
    
    console.log('[DEBUG] 从后端获取的数据:', data)
    console.log('[DEBUG] id_number字段:', data.id_number)
    
    // 填充表单
    Object.keys(form).forEach(key => {
      if (data[key] !== undefined && data[key] !== null) {
        form[key] = data[key]
      } else if (data[key] === null) {
        // null 值转换为空字符串，避免输入框显示 "null"
        form[key] = ''
      }
    })
    form.id = data.id
    
    console.log('[DEBUG] 填充后的表单数据:', form)
  } catch (error) {
    console.error('加载老人详情失败:', error)
    ElMessage.error('加载老人详情失败')
  } finally {
    loading.value = false
  }
}

// 返回
const goBack = () => {
  router.back()
}

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    const submitData = { ...form }
    delete submitData.id
    
    // 调试日志：查看提交的数据
    console.log('提交数据:', submitData)
    console.log('id_number字段:', submitData.id_number)
    
    await updateElderly(form.id, submitData)
    ElMessage.success('保存成功')
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('保存失败:', error)
      ElMessage.error('保存失败')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadElderlyDetail()
})
</script>

<style scoped>
.elderly-edit-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.edit-form {
  max-width: 900px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #fafafa;
  border-radius: 8px;
}

.form-section h3 {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  font-weight: 600;
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #ebeef5;
}
</style>
