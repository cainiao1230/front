<template>
  <el-card :body-style="{ padding: '0' }" class="stat-card" :class="`stat-${type}`">
    <div class="stat-content">
      <div class="stat-icon">
        <el-icon :size="iconSize">
          <component :is="icon" />
        </el-icon>
      </div>
      <div class="stat-info">
        <div class="stat-title">{{ title }}</div>
        <div class="stat-value">
          {{ value }}
          <span v-if="suffix" class="stat-suffix">{{ suffix }}</span>
        </div>
        <div v-if="trend" class="stat-trend" :class="`trend-${trend.type}`">
          <el-icon :size="12">
            <CaretTop v-if="trend.type === 'up'" />
            <CaretBottom v-else />
          </el-icon>
          {{ trend.value }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'

defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    required: true
  },
  suffix: {
    type: String,
    default: ''
  },
  icon: {
    type: [String, Object],
    required: true
  },
  iconSize: {
    type: Number,
    default: 28
  },
  type: {
    type: String,
    default: 'primary', // primary, success, warning, danger, info
    validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  trend: {
    type: Object,
    default: null
    // { type: 'up' | 'down', value: string }
  }
})
</script>

<style scoped>
.stat-card {
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 20px;
  gap: 16px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-suffix {
  font-size: 14px;
  font-weight: normal;
  color: #909399;
  margin-left: 4px;
}

.stat-trend {
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-up {
  color: #67c23a;
}

.trend-down {
  color: #f56c6c;
}

/* 不同类型的配色 */
.stat-primary .stat-icon {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-success .stat-icon {
  background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);
  color: #409eff;
}

.stat-warning .stat-icon {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
  color: white;
}

.stat-danger .stat-icon {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.stat-info .stat-icon {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}
</style>
