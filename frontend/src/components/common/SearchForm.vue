<template>
  <div class="search-form-wrapper">
    <el-form :inline="true" :model="modelValue" @submit.prevent="handleSearch">
      <slot></slot>
      
      <el-form-item>
        <el-button type="primary" @click="handleSearch" :icon="Search">
          查询
        </el-button>
        <el-button @click="handleReset" :icon="RefreshLeft">
          重置
        </el-button>
        <slot name="actions"></slot>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { Search, RefreshLeft } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['update:modelValue', 'search', 'reset'])

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  // 重置表单数据
  const resetData = {}
  Object.keys(props.modelValue).forEach(key => {
    resetData[key] = null
  })
  emit('update:modelValue', resetData)
  emit('reset')
}
</script>

<style scoped>
.search-form-wrapper {
  margin-bottom: 16px;
}
</style>
