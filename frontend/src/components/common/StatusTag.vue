<template>
  <el-tag
    :type="tagType"
    :size="size"
    :effect="effect"
  >
    {{ label }}
  </el-tag>
</template>

<script setup>
import { computed } from 'vue'
import mapper from '@/utils/mapper'

const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => [
      'careLevel', 
      'bedStatus', 
      'bedType', 
      'careType', 
      'taskStatus', 
      'gender', 
      'elderlyStatus', 
      'userRole'
    ].includes(value)
  },
  value: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'default'
  },
  effect: {
    type: String,
    default: 'light'
  }
})

const label = computed(() => {
  return mapper[props.type](props.value, 'label')
})

const tagType = computed(() => {
  return mapper[props.type](props.value, 'type')
})
</script>
