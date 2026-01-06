<template>
  <div class="care-records-page">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <span class="title">护理记录</span>
          <el-button type="primary" @click="showAddDialog">
            <el-icon><Plus /></el-icon> 新增记录
          </el-button>
        </div>
      </template>

      <!-- 筛选条件 -->
      <el-form :inline="true" class="search-form">
        <el-form-item label="老人">
          <el-select v-model="searchForm.elderly_id" placeholder="全部老人" clearable filterable style="width: 200px">
            <el-option
              v-for="elderly in elderlyList"
              :key="elderly.id"
              :label="elderly.name"
              :value="elderly.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="护理类型">
          <el-select v-model="searchForm.care_type" placeholder="全部类型" clearable style="width: 150px">
            <el-option label="日常护理" value="daily" />
            <el-option label="医疗护理" value="medical" />
            <el-option label="康复训练" value="rehabilitation" />
            <el-option label="心理疏导" value="psychological" />
          </el-select>
        </el-form-item>

        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 护理记录列表 -->
      <el-table :data="tableData" v-loading="loading" border stripe style="width: 100%">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="expand-content">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="护理内容">
                  {{ row.care_content }}
                </el-descriptions-item>
                <el-descriptions-item label="护理时间">
                  {{ row.care_time }}
                </el-descriptions-item>
                <el-descriptions-item label="备注" :span="2">
                  {{ row.remarks || '无' }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="id" label="记录ID" width="80" />
        <el-table-column prop="elderly_name" label="老人姓名" width="120" />
        <el-table-column prop="caregiver_name" label="护工" width="120" />
        <el-table-column label="护理类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getCareTypeColor(row.care_type)" size="small">
              {{ getCareTypeText(row.care_type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="care_content" label="护理内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="care_time" label="护理时间" width="180" />
        <el-table-column prop="created_at" label="记录时间" width="180" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" link @click="viewDetail(row)">详情</el-button>
            <el-button type="primary" size="small" link @click="editRecord(row)">编辑</el-button>
            <el-button type="danger" size="small" link @click="deleteRecord(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.page_size"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadRecords"
        @current-change="loadRecords"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 新增/编辑护理记录对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
    >
      <el-form :model="recordForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="选择老人" prop="elderly_id">
          <el-select v-model="recordForm.elderly_id" placeholder="请选择老人" filterable style="width: 100%">
            <el-option
              v-for="elderly in elderlyList"
              :key="elderly.id"
              :label="elderly.name"
              :value="elderly.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="护理类型" prop="care_type">
          <el-select v-model="recordForm.care_type" placeholder="请选择护理类型" style="width: 100%">
            <el-option label="日常护理" value="daily" />
            <el-option label="医疗护理" value="medical" />
            <el-option label="康复训练" value="rehabilitation" />
            <el-option label="心理疏导" value="psychological" />
          </el-select>
        </el-form-item>

        <el-form-item label="护理内容" prop="care_content">
          <el-input
            v-model="recordForm.care_content"
            type="textarea"
            :rows="4"
            placeholder="请输入护理内容"
          />
        </el-form-item>

        <el-form-item label="护理时间" prop="care_time">
          <el-date-picker
            v-model="recordForm.care_time"
            type="datetime"
            placeholder="选择护理时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="recordForm.remarks"
            type="textarea"
            :rows="3"
            placeholder="请输入备注信息（可选）"
          />
        </el-form-item>

        <el-form-item label="护工签名">
          <div class="signature-area">
            <canvas
              ref="signatureCanvas"
              id="signatureCanvas"
              width="500"
              height="120"
              style="border: 1px solid #ddd; border-radius: 4px; cursor: crosshair; background: white"
              @mousedown="startSign"
              @mousemove="drawSign"
              @mouseup="endSign"
              @mouseleave="endSign"
            />
            <div style="margin-top: 8px">
              <el-button size="small" @click="clearSignature">清除签名</el-button>
              <span style="font-size: 12px; color: #909399">在上方区域签名</span>
            </div>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
      </template>
    </el-dialog>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="护理记录详情"
      width="600px"
    >
      <div v-if="currentRecord" class="detail-content">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="老人姓名">
            {{ currentRecord.elderly_name }}
          </el-descriptions-item>
          <el-descriptions-item label="护工">
            {{ currentRecord.caregiver_name }}
          </el-descriptions-item>
          <el-descriptions-item label="护理类型">
            <el-tag :type="getCareTypeColor(currentRecord.care_type)">
              {{ getCareTypeText(currentRecord.care_type) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="护理时间">
            {{ currentRecord.care_time }}
          </el-descriptions-item>
          <el-descriptions-item label="护理内容">
            <div style="white-space: pre-wrap">{{ currentRecord.care_content }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="备注" v-if="currentRecord.remarks">
            {{ currentRecord.remarks }}
          </el-descriptions-item>
          <el-descriptions-item label="记录时间">
            {{ currentRecord.created_at }}
          </el-descriptions-item>
          <el-descriptions-item label="护工签名" v-if="currentRecord.signature">
            <img :src="currentRecord.signature" style="max-width: 100%; border: 1px solid #ddd; border-radius: 4px" />
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCareRecords, createCareRecord, getElderlyList } from '@/api'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const elderlyList = ref([])
const dateRange = ref([])

const searchForm = reactive({
  elderly_id: null,
  care_type: null
})

const pagination = reactive({
  page: 1,
  page_size: 10
})

const dialogVisible = ref(false)
const dialogTitle = computed(() => '新增护理记录')
const formRef = ref(null)
const submitting = ref(false)

const detailDialogVisible = ref(false)
const currentRecord = ref(null)
const signatureCanvas = ref(null)
let isDrawing = false

const recordForm = reactive({
  elderly_id: null,
  care_type: '',
  care_content: '',
  care_time: '',
  remarks: '',
  signature: ''
})

const rules = {
  elderly_id: [{ required: true, message: '请选择老人', trigger: 'change' }],
  care_type: [{ required: true, message: '请选择护理类型', trigger: 'change' }],
  care_content: [{ required: true, message: '请输入护理内容', trigger: 'blur' }],
  care_time: [{ required: true, message: '请选择护理时间', trigger: 'change' }]
}

// 加载护理记录
const loadRecords = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm,
      page: pagination.page,
      page_size: pagination.page_size
    }
    
    if (dateRange.value && dateRange.value.length === 2) {
      params.start_date = dateRange.value[0]
      params.end_date = dateRange.value[1]
    }
    
    const response = await getCareRecords(params)
    tableData.value = response.data.items || []
    total.value = response.data.total || 0
  } catch (error) {
    ElMessage.error('加载护理记录失败')
  } finally {
    loading.value = false
  }
}

// 加载老人列表
const loadElderlyList = async () => {
  try {
    const response = await getElderlyList({ status: 'in', page: 1, page_size: 1000 })
    elderlyList.value = response.data.items || []
  } catch (error) {
    console.error('加载老人列表失败')
  }
}

// 搜索
const handleSearch = () => {
  pagination.page = 1
  loadRecords()
}

// 重置
const handleReset = () => {
  searchForm.elderly_id = null
  searchForm.care_type = null
  dateRange.value = []
  handleSearch()
}

// 护理类型文本
const getCareTypeText = (type) => {
  const map = {
    'daily': '日常护理',
    'medical': '医疗护理',
    'rehabilitation': '康复训练',
    'psychological': '心理疏导'
  }
  return map[type] || type
}

// 护理类型颜色
const getCareTypeColor = (type) => {
  const map = {
    'daily': '',
    'medical': 'danger',
    'rehabilitation': 'warning',
    'psychological': 'success'
  }
  return map[type] || ''
}

// 显示新增对话框
const showAddDialog = () => {
  Object.assign(recordForm, {
    elderly_id: null,
    care_type: '',
    care_content: '',
    care_time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    remarks: '',
    signature: ''
  })
  dialogVisible.value = true
  
  // 清空canvas
  nextTick(() => {
    clearSignature()
  })
}

// 签名方法
const startSign = (e) => {
  isDrawing = true
  const canvas = signatureCanvas.value
  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()
  ctx.beginPath()
  ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
}

const drawSign = (e) => {
  if (!isDrawing) return
  const canvas = signatureCanvas.value
  const ctx = canvas.getContext('2d')
  const rect = canvas.getBoundingClientRect()
  ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
  ctx.strokeStyle = '#333'
  ctx.lineWidth = 2
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.stroke()
}

const endSign = () => {
  isDrawing = false
  const canvas = signatureCanvas.value
  recordForm.signature = canvas.toDataURL('image/png')
}

const clearSignature = () => {
  const canvas = signatureCanvas.value
  if (canvas) {
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    recordForm.signature = ''
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        // 获取护工信息
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        const elderly = elderlyList.value.find(e => e.id === recordForm.elderly_id)
        
        await createCareRecord({
          ...recordForm,
          elderly_name: elderly?.name,
          caregiver_id: userInfo.id,
          caregiver_name: userInfo.name
        })
        
        ElMessage.success('护理记录添加成功')
        dialogVisible.value = false
        loadRecords()
      } catch (error) {
        ElMessage.error('添加护理记录失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 查看详情
const viewDetail = (row) => {
  currentRecord.value = row
  detailDialogVisible.value = true
}

// 编辑记录
const editRecord = (row) => {
  ElMessage.info('编辑功能开发中')
}

// 删除记录
const deleteRecord = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该护理记录吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    ElMessage.success('护理记录已删除')
    loadRecords()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除护理记录失败')
    }
  }
}

onMounted(() => {
  loadRecords()
  loadElderlyList()
})
</script>

<style scoped>
.care-records-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 18px;
  font-weight: 600;
}

.search-form {
  margin-bottom: 16px;
}

.expand-content {
  padding: 16px;
}

.signature-area {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.detail-content {
  padding: 20px 0;
}
</style>