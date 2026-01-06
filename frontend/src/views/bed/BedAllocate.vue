<template>
  <div class="bed-allocate-page">
    <el-card shadow="never">
      <template #header>
        <span class="title">床位分配</span>
      </template>

      <el-steps :active="currentStep" finish-status="success" align-center>
        <el-step title="选择老人" />
        <el-step title="选择床位" />
        <el-step title="确认分配" />
      </el-steps>

      <div class="step-content">
        <!-- 步骤1：选择老人 -->
        <div v-show="currentStep === 0" class="step-panel">
          <h3>请选择需要分配床位的老人</h3>
          <el-input
            v-model="elderlyKeyword"
            placeholder="搜索老人姓名"
            clearable
            style="width: 300px; margin-bottom: 20px"
            @input="filterElderly"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-table
            :data="filteredElderlyList"
            highlight-current-row
            @current-change="handleElderlySelect"
            v-loading="elderlyLoading"
            height="400"
          >
            <el-table-column type="index" width="50" />
            <el-table-column prop="name" label="姓名" width="120" />
            <el-table-column label="性别" width="80">
              <template #default="{ row }">
                {{ row.gender === 'male' ? '男' : '女' }}
              </template>
            </el-table-column>
            <el-table-column prop="phone" label="电话" width="150" />
            <el-table-column label="护理等级" width="100">
              <template #default="{ row }">
                <el-tag :type="getCareTypeColor(row.care_level)" size="small">
                  {{ getCareTypeText(row.care_level) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="emergency_contact_name" label="紧急联系人" />
            <el-table-column prop="emergency_contact_phone" label="联系人电话" />
          </el-table>
        </div>

        <!-- 步骤2：选择床位 -->
        <div v-show="currentStep === 1" class="step-panel">
          <h3>请为 <el-tag type="primary">{{ selectedElderly?.name }}</el-tag> 选择床位</h3>
          
          <el-tabs v-model="selectedFloor" type="card" style="margin-top: 20px">
            <el-tab-pane v-for="floor in floors" :key="floor" :label="`${floor}楼`" :name="floor">
              <div class="bed-grid">
                <div
                  v-for="bed in getBedsByFloor(floor)"
                  :key="bed.id"
                  class="bed-card"
                  :class="{
                    'available': bed.status === 'available',
                    'occupied': bed.status === 'occupied',
                    'maintenance': bed.status === 'maintenance',
                    'selected': selectedBed?.id === bed.id
                  }"
                  @click="selectBed(bed)"
                >
                  <div class="bed-number">{{ bed.bed_number }}</div>
                  <div class="bed-room">{{ bed.room_number }}</div>
                  <div class="bed-type">{{ getBedTypeText(bed.bed_type) }}</div>
                  <div class="bed-price">¥{{ bed.price }}/月</div>
                  <div class="bed-status">
                    <el-tag :type="getStatusColor(bed.status)" size="small">
                      {{ getStatusText(bed.status) }}
                    </el-tag>
                  </div>
                  <div v-if="bed.elderly_name" class="bed-elderly">
                    <el-icon><User /></el-icon> {{ bed.elderly_name }}
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>

          <div class="bed-legend">
            <span><span class="legend-dot available"></span> 空闲</span>
            <span><span class="legend-dot occupied"></span> 已占用</span>
            <span><span class="legend-dot maintenance"></span> 维护中</span>
            <span><span class="legend-dot selected"></span> 已选择</span>
          </div>
        </div>

        <!-- 步骤3：确认分配 -->
        <div v-show="currentStep === 2" class="step-panel">
          <h3>请确认分配信息</h3>
          
          <el-row :gutter="20" style="margin-top: 20px">
            <el-col :span="12">
              <div class="info-card">
                <div class="card-title">👴 老人信息</div>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="姓名">
                    {{ selectedElderly?.name }}
                  </el-descriptions-item>
                  <el-descriptions-item label="性别">
                    {{ selectedElderly?.gender === 'male' ? '男' : '女' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="年龄">
                    {{ selectedElderly?.age || '-' }}岁
                  </el-descriptions-item>
                  <el-descriptions-item label="护理等级">
                    <el-tag :type="getCareTypeColor(selectedElderly?.care_level)">
                      {{ getCareTypeText(selectedElderly?.care_level) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="紧急联系人">
                    {{ selectedElderly?.emergency_contact_name }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>
            
            <el-col :span="12">
              <div class="info-card">
                <div class="card-title">🛏️ 床位信息</div>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="床位编号">
                    <el-tag type="primary">{{ selectedBed?.bed_number }}</el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="房间号">
                    {{ selectedBed?.room_number }}
                  </el-descriptions-item>
                  <el-descriptions-item label="楼层">
                    第 {{ selectedBed?.floor }} 楼
                  </el-descriptions-item>
                  <el-descriptions-item label="床位类型">
                    <el-tag type="success" size="small">
                      {{ getCareTypeText(selectedBed?.bed_type) }}
                    </el-tag>
                  </el-descriptions-item>
                  <el-descriptions-item label="月租金">
                    <span style="font-size: 18px; font-weight: 600; color: #f56c6c">
                      ¥{{ selectedBed?.price || 0 }}/月
                    </span>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </el-col>
          </el-row>

          <el-divider />

          <div class="remark-section">
            <label>分配备注（可选）：</label>
            <el-input
              v-model="remarks"
              type="textarea"
              :rows="3"
              placeholder="请输入分配备注信息"
              style="margin-top: 8px"
            />
          </div>

          <el-result
            v-if="allocationSummary"
            :title="`预期费用为 ¥${allocationSummary} 元/月`"
            style="padding: 24px; background: #f0f9ff; border-radius: 8px; margin-top: 20px"
          />
        </div>
      </div>

      <div class="step-actions">
        <el-button v-if="currentStep > 0" @click="prevStep">上一步</el-button>
        <el-button v-if="currentStep < 2" type="primary" @click="nextStep" :disabled="!canNext">
          下一步
        </el-button>
        <el-button v-if="currentStep === 2" type="primary" @click="handleAllocate" :loading="allocating">
          确认分配
        </el-button>
        <el-button @click="handleCancel">取消</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search, User } from '@element-plus/icons-vue'
import { getElderlyList, getBedList, allocateBed as allocateBedApi } from '@/api'

const router = useRouter()
const currentStep = ref(0)
const elderlyLoading = ref(false)
const elderlyKeyword = ref('')
const elderlyList = ref([])
const filteredElderlyList = ref([])
const selectedElderly = ref(null)

const selectedFloor = ref(1)
const floors = [1, 2, 3, 4]
const bedList = ref([])
const selectedBed = ref(null)

const remarks = ref('')
const allocating = ref(false)

// 能否进入下一步
const canNext = computed(() => {
  if (currentStep.value === 0) return selectedElderly.value !== null
  if (currentStep.value === 1) return selectedBed.value !== null
  return true
})

// 分配费用总结
const allocationSummary = computed(() => {
  return selectedBed.value?.price || 0
})

// 加载老人列表（未分配床位的）
const loadElderlyList = async () => {
  elderlyLoading.value = true
  try {
    const response = await getElderlyList({ status: 'in', page: 1, page_size: 100 })
    // 过滤出未分配床位的老人
    elderlyList.value = (response.data.items || []).filter(e => !e.bed_id)
    filteredElderlyList.value = elderlyList.value
  } catch (error) {
    ElMessage.error('加载老人列表失败')
  } finally {
    elderlyLoading.value = false
  }
}

// 过滤老人
const filterElderly = () => {
  if (!elderlyKeyword.value) {
    filteredElderlyList.value = elderlyList.value
  } else {
    filteredElderlyList.value = elderlyList.value.filter(e => 
      e.name.includes(elderlyKeyword.value)
    )
  }
}

// 选择老人
const handleElderlySelect = (row) => {
  selectedElderly.value = row
}

// 加载床位列表
const loadBedList = async () => {
  try {
    const response = await getBedList({ page: 1, page_size: 1000 })
    bedList.value = response.data.items || []
  } catch (error) {
    ElMessage.error('加载床位列表失败')
  }
}

// 获取指定楼层的床位
const getBedsByFloor = (floor) => {
  return bedList.value.filter(bed => bed.floor === floor)
}

// 选择床位
const selectBed = (bed) => {
  if (bed.status !== 'available') {
    ElMessage.warning('该床位不可用')
    return
  }
  selectedBed.value = bed
}

// 护理等级文本
const getCareTypeText = (level) => {
  const map = { 'self_care': '自理', 'semi_care': '半护理', 'full_care': '全护理' }
  return map[level] || level
}

const getCareTypeColor = (level) => {
  const map = { 'self_care': 'success', 'semi_care': 'warning', 'full_care': 'danger' }
  return map[level] || ''
}

const getBedTypeText = (type) => {
  const map = { 'single': '单人间', 'double': '双人间', 'vip': 'VIP' }
  return map[type] || type
}

const getStatusText = (status) => {
  const map = { 'available': '空闲', 'occupied': '已占用', 'maintenance': '维护中' }
  return map[status] || status
}

const getStatusColor = (status) => {
  const map = { 'available': 'success', 'occupied': 'warning', 'maintenance': 'info' }
  return map[status] || ''
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 下一步
const nextStep = () => {
  if (!canNext.value) {
    ElMessage.warning('请完成当前步骤')
    return
  }
  
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

// 确认分配
const handleAllocate = async () => {
  allocating.value = true
  try {
    await allocateBedApi({
      bed_id: selectedBed.value.id,
      elderly_id: selectedElderly.value.id,
      elderly_name: selectedElderly.value.name,
      remarks: remarks.value
    })
    
    ElMessage.success('床位分配成功')
    router.push('/bed/list')
  } catch (error) {
    ElMessage.error('床位分配失败')
  } finally {
    allocating.value = false
  }
}

// 取消
const handleCancel = () => {
  router.back()
}

onMounted(() => {
  loadElderlyList()
  loadBedList()
})
</script>

<style scoped>
.bed-allocate-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.step-content {
  margin: 40px 0;
  min-height: 500px;
}

.step-panel h3 {
  margin-bottom: 20px;
  font-size: 16px;
  color: #303133;
}

.bed-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.bed-card {
  padding: 16px;
  border: 2px solid #dcdfe6;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.bed-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.bed-card.available {
  background-color: #f0f9ff;
  border-color: #67c23a;
}

.bed-card.occupied {
  background-color: #fef0f0;
  border-color: #e6a23c;
  cursor: not-allowed;
  opacity: 0.6;
}

.bed-card.maintenance {
  background-color: #f4f4f5;
  border-color: #909399;
  cursor: not-allowed;
  opacity: 0.6;
}

.bed-card.selected {
  border-color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 0 8px rgba(64, 158, 255, 0.5);
}

.bed-number {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.bed-room,
.bed-type,
.bed-price {
  font-size: 13px;
  color: #606266;
  margin: 4px 0;
}

.bed-status {
  margin-top: 8px;
}

.bed-elderly {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.bed-legend {
  margin-top: 20px;
  display: flex;
  gap: 24px;
  align-items: center;
}

.bed-legend span {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-dot {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  display: inline-block;
}

.legend-dot.available {
  background-color: #67c23a;
}

.legend-dot.occupied {
  background-color: #e6a23c;
}

.legend-dot.maintenance {
  background-color: #909399;
}

.legend-dot.selected {
  background-color: #409eff;
}

.info-card {
  padding: 20px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #303133;
}

.remark-section {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-top: 20px;
}

.remark-section label {
  font-weight: 600;
  color: #303133;
}

.step-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #dcdfe6;
}
</style>