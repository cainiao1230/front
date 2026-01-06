<template>
  <el-table
    :data="data"
    :loading="loading"
    v-bind="$attrs"
    border
    stripe
    style="width: 100%"
  >
    <slot></slot>
  </el-table>
  
  <el-pagination
    v-if="showPagination && total > 0"
    v-model:current-page="currentPage"
    v-model:page-size="currentPageSize"
    :total="total"
    :page-sizes="pageSizes"
    :layout="layout"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    style="margin-top: 20px; justify-content: flex-end"
  />
</template>

<script setup>
import { computed } from 'vue'
import { PAGE_SIZES } from '@/utils/constants'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  total: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  showPagination: {
    type: Boolean,
    default: true
  },
  pageSizes: {
    type: Array,
    default: () => PAGE_SIZES
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
})

const emit = defineEmits(['update:page', 'update:pageSize', 'change'])

const currentPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
})

const currentPageSize = computed({
  get: () => props.pageSize,
  set: (val) => emit('update:pageSize', val)
})

const handleSizeChange = () => {
  emit('change')
}

const handleCurrentChange = () => {
  emit('change')
}
</script>
