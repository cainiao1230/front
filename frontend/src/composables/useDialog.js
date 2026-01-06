// 对话框通用逻辑的组合式函数
import { ref, reactive, computed } from 'vue'

/**
 * 对话框管理
 * @param {Object} defaultForm - 默认表单数据
 */
export function useDialog(defaultForm = {}) {
  const dialogVisible = ref(false)
  const dialogMode = ref('add') // add | edit | view
  const formRef = ref(null)
  const submitting = ref(false)
  
  const form = reactive({ ...defaultForm })
  
  // 对话框标题
  const dialogTitle = computed(() => {
    const titles = {
      add: '新增',
      edit: '编辑',
      view: '查看'
    }
    return titles[dialogMode.value] || '新增'
  })
  
  // 是否只读模式
  const isReadonly = computed(() => dialogMode.value === 'view')
  
  // 打开对话框
  const openDialog = (mode = 'add', data = null) => {
    dialogMode.value = mode
    
    // 重置表单
    Object.keys(form).forEach(key => {
      form[key] = defaultForm[key]
    })
    
    // 填充数据（编辑/查看模式）
    if (data && (mode === 'edit' || mode === 'view')) {
      Object.keys(form).forEach(key => {
        if (data[key] !== undefined) {
          form[key] = data[key]
        }
      })
    }
    
    dialogVisible.value = true
  }
  
  // 关闭对话框
  const closeDialog = () => {
    dialogVisible.value = false
    formRef.value?.resetFields()
  }
  
  // 提交表单
  const submitForm = async (callback) => {
    if (!formRef.value) return false
    
    let isValid = false
    await formRef.value.validate((valid) => {
      isValid = valid
    })
    
    if (!isValid) return false
    
    submitting.value = true
    try {
      await callback(form, dialogMode.value)
      closeDialog()
      return true
    } catch (error) {
      return false
    } finally {
      submitting.value = false
    }
  }
  
  return {
    dialogVisible,
    dialogMode,
    dialogTitle,
    isReadonly,
    formRef,
    form,
    submitting,
    openDialog,
    closeDialog,
    submitForm
  }
}
