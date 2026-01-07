// 表格通用逻辑的组合式函数
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { DEFAULT_PAGE_SIZE, PAGE_SIZES } from '@/utils/constants'

/**
 * 表格数据管理
 * @param {Function} fetchFn - 获取数据的函数
 * @param {Object} options - 配置选项
 */
export function useTable(fetchFn, options = {}) {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    immediate = true,
    onSuccess,
    onError
  } = options

  // 加载状态
  const loading = ref(false)
  
  // 表格数据
  const tableData = ref([])
  const total = ref(0)
  
  // 分页
  const pagination = reactive({
    page: 1,
    page_size: pageSize
  })
  
  // 搜索表单
  const searchForm = reactive({})
  
  // 加载数据
  const loadData = async (resetPage = false) => {
    if (resetPage) {
      pagination.page = 1
    }
    
    loading.value = true
    
    try {
      const params = {
        ...searchForm,
        page: pagination.page,
        page_size: pagination.page_size
      }
      
      const response = await fetchFn(params)
      // 兼容后端直接返回数据或包裹在 data 字段两种格式
      const data = response?.data ?? response ?? {}
      
      tableData.value = data.items || []
      total.value = data.total || 0
      
      onSuccess?.(data)
    } catch (error) {
      ElMessage.error('加载数据失败')
      onError?.(error)
    } finally {
      loading.value = false
    }
  }
  
  // 搜索
  const handleSearch = () => {
    loadData(true)
  }
  
  // 重置
  const handleReset = () => {
    Object.keys(searchForm).forEach(key => {
      searchForm[key] = null
    })
    handleSearch()
  }
  
  // 刷新
  const refresh = () => {
    loadData()
  }
  
  // 分页大小改变
  const handleSizeChange = () => {
    loadData(true)
  }
  
  // 当前页改变
  const handleCurrentChange = () => {
    loadData()
  }
  
  // 初始化加载
  if (immediate) {
    loadData()
  }
  
  return {
    loading,
    tableData,
    total,
    pagination,
    searchForm,
    loadData,
    handleSearch,
    handleReset,
    refresh,
    handleSizeChange,
    handleCurrentChange,
    PAGE_SIZES
  }
}
