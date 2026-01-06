<template>
  <el-card shadow="never" :body-style="{ padding: '20px' }">
    <template #header v-if="$slots.header || title">
      <div class="page-card-header">
        <slot name="header">
          <span class="title">{{ title }}</span>
        </slot>
        <div class="actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </template>
    
    <slot></slot>
  </el-card>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>

<style scoped>
.page-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>
