<template>
  <div class="bed-floor-page">
    <PageCard title="各楼层床位使用情况">
      <el-tabs v-model="activeFloor" @tab-change="loadFloorData">
        <el-tab-pane v-for="floor in floors" :key="floor" :label="`${floor}楼`" :name="floor" />
      </el-tabs>

      <div class="floor-stats">
        <el-row :gutter="16">
          <el-col :span="6">
            <StatCard 
              title="总床位" 
              :value="floorStats.total" 
              suffix="张"
              type="primary"
            />
          </el-col>
          <el-col :span="6">
            <StatCard 
              title="已占用" 
              :value="floorStats.occupied" 
              suffix="张"
              type="success"
            />
          </el-col>
          <el-col :span="6">
            <StatCard 
              title="空闲" 
              :value="floorStats.available" 
              suffix="张"
              type="info"
            />
          </el-col>
          <el-col :span="6">
            <StatCard 
              title="占用率" 
              :value="floorStats.occupancyRate" 
              suffix="%"
              type="warning"
            />
          </el-col>
        </el-row>
      </div>

      <div class="bed-grid" v-loading="loading">
        <div class="room-section" v-for="room in rooms" :key="room.room_number">
          <div class="room-header">
            <span class="room-title">{{ room.room_number }} 房间</span>
            <el-tag :type="getRoomStatusType(room)" size="small">
              {{ room.occupied_count }}/{{ room.total_count }}
            </el-tag>
          </div>
          <div class="bed-items">
            <div
              v-for="bed in room.beds"
              :key="bed.id"
              class="bed-card"
              :class="getBedClass(bed.status)"
              @click="handleBedClick(bed)"
            >
              <div class="bed-number">{{ bed.bed_number }}</div>
              <div class="bed-status">
                <StatusTag type="bedStatus" :value="bed.status" size="small" />
              </div>
              <div v-if="bed.elderly_name" class="bed-elderly">{{ bed.elderly_name }}</div>
            </div>
          </div>
        </div>

        <el-empty v-if="rooms.length === 0" description="暂无床位数据" />
      </div>
    </PageCard>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getFloorBeds } from '@/api'
import PageCard from '@/components/common/PageCard.vue'
import StatCard from '@/components/common/StatCard.vue'
import StatusTag from '@/components/common/StatusTag.vue'

const activeFloor = ref(1)
const floors = [1, 2, 3, 4, 5]
const loading = ref(false)
const rooms = ref([])

const floorStats = computed(() => {
  let total = 0
  let occupied = 0
  
  rooms.value.forEach(room => {
    total += room.total_count
    occupied += room.occupied_count
  })
  
  const available = total - occupied
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0
  
  return { total, occupied, available, occupancyRate }
})

const loadFloorData = async () => {
  loading.value = true
  try {
    const response = await getFloorBeds(activeFloor.value)
    rooms.value = response.data || []
  } catch (error) {
    ElMessage.error('加载楼层数据失败')
  } finally {
    loading.value = false
  }
}

const getRoomStatusType = (room) => {
  const rate = room.occupied_count / room.total_count
  if (rate === 1) return 'danger'
  if (rate >= 0.8) return 'warning'
  if (rate > 0) return 'success'
  return 'info'
}

const getBedClass = (status) => {
  return `bed-${status}`
}

const handleBedClick = (bed) => {
  if (bed.status === 'available') {
    ElMessage.info('床位空闲，可分配')
  } else if (bed.status === 'occupied') {
    ElMessage.info(`床位已分配给：${bed.elderly_name}`)
  }
}

onMounted(() => {
  loadFloorData()
})
</script>

<style scoped>
.bed-floor-page {
  padding: 24px;
  background-color: #f5f7fa;
  min-height: 100%;
}

.floor-stats {
  margin: 20px 0;
}

.bed-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
}

.room-section {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e4e7ed;
}

.room-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.bed-items {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.bed-card {
  padding: 16px;
  border-radius: 8px;
  border: 2px solid #dcdfe6;
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.bed-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.bed-available {
  background: #f0f9ff;
  border-color: #79bbff;
}

.bed-occupied {
  background: #fef0f0;
  border-color: #f56c6c;
}

.bed-maintenance {
  background: #fdf6ec;
  border-color: #e6a23c;
}

.bed-reserved {
  background: #f4f4f5;
  border-color: #909399;
}

.bed-number {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.bed-status {
  margin-bottom: 8px;
}

.bed-elderly {
  font-size: 14px;
  color: #606266;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #dcdfe6;
}
</style>