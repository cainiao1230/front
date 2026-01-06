<template>
  <div class="settings-view-page">
    <PageCard title="账户设置">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本设置" name="basic">
          <el-form :model="basicForm" :rules="basicRules" ref="basicFormRef" label-width="120px" style="max-width: 600px">
            <el-form-item label="用户名">
              <el-input v-model="basicForm.username" disabled />
            </el-form-item>
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="basicForm.realName" />
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="basicForm.phone" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="basicForm.email" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveBasicSettings">保存修改</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="修改密码" name="password">
          <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="120px" style="max-width: 600px">
            <el-form-item label="原密码" prop="oldPassword">
              <el-input v-model="passwordForm.oldPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
              <el-input v-model="passwordForm.newPassword" type="password" show-password />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="changePassword">修改密码</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="通知设置" name="notification">
          <el-form label-width="120px" style="max-width: 600px">
            <el-form-item label="任务提醒">
              <el-switch v-model="notificationSettings.taskReminder" />
              <span class="setting-desc">开启后将在任务到期前提醒</span>
            </el-form-item>
            <el-form-item label="用药提醒">
              <el-switch v-model="notificationSettings.medicationReminder" />
              <span class="setting-desc">开启后将在用药时间提醒</span>
            </el-form-item>
            <el-form-item label="紧急通知">
              <el-switch v-model="notificationSettings.urgentNotice" />
              <span class="setting-desc">开启后将接收紧急通知</span>
            </el-form-item>
            <el-form-item label="系统通知">
              <el-switch v-model="notificationSettings.systemNotice" />
              <span class="setting-desc">开启后将接收系统通知</span>
            </el-form-item>
            <el-form-item label="邮件通知">
              <el-switch v-model="notificationSettings.emailNotice" />
              <span class="setting-desc">开启后将通过邮件接收通知</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveNotificationSettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="隐私设置" name="privacy">
          <el-form label-width="120px" style="max-width: 600px">
            <el-form-item label="个人资料可见">
              <el-switch v-model="privacySettings.profileVisible" />
              <span class="setting-desc">关闭后其他人无法查看你的详细资料</span>
            </el-form-item>
            <el-form-item label="活动记录可见">
              <el-switch v-model="privacySettings.activityVisible" />
              <span class="setting-desc">关闭后其他人无法查看你的活动记录</span>
            </el-form-item>
            <el-form-item label="在线状态可见">
              <el-switch v-model="privacySettings.onlineVisible" />
              <span class="setting-desc">关闭后其他人无法看到你的在线状态</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="savePrivacySettings">保存设置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </PageCard>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserInfo } from '@/composables/useUserInfo'
import { required, phoneValidator } from '@/utils/validators'

const { userInfo } = useUserInfo()

const activeTab = ref('basic')
const basicFormRef = ref(null)
const passwordFormRef = ref(null)

const basicForm = ref({
  username: userInfo.value.username,
  realName: userInfo.value.realName,
  phone: userInfo.value.phone,
  email: userInfo.value.email
})

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const notificationSettings = ref({
  taskReminder: true,
  medicationReminder: true,
  urgentNotice: true,
  systemNotice: false,
  emailNotice: false
})

const privacySettings = ref({
  profileVisible: true,
  activityVisible: true,
  onlineVisible: true
})

const basicRules = {
  realName: [required('请输入真实姓名')],
  phone: [phoneValidator]
}

const passwordRules = {
  oldPassword: [required('请输入原密码')],
  newPassword: [
    required('请输入新密码'),
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ],
  confirmPassword: [
    required('请确认新密码'),
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const saveBasicSettings = async () => {
  try {
    await basicFormRef.value.validate()
    ElMessage.success('保存成功')
  } catch (error) {
    console.error('表单验证失败')
  }
}

const changePassword = async () => {
  try {
    await passwordFormRef.value.validate()
    ElMessage.success('密码修改成功，请重新登录')
    // 清空表单
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('表单验证失败')
  }
}

const saveNotificationSettings = () => {
  ElMessage.success('通知设置已保存')
}

const savePrivacySettings = () => {
  ElMessage.success('隐私设置已保存')
}
</script>

<style scoped>
.settings-view-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.setting-desc {
  margin-left: 12px;
  font-size: 13px;
  color: #909399;
}
</style>