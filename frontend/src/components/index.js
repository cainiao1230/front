// 全局组件注册
import PageCard from './common/PageCard.vue'
import SearchForm from './common/SearchForm.vue'
import DataTable from './common/DataTable.vue'
import StatCard from './common/StatCard.vue'
import StatusTag from './common/StatusTag.vue'

export default {
  install(app) {
    app.component('PageCard', PageCard)
    app.component('SearchForm', SearchForm)
    app.component('DataTable', DataTable)
    app.component('StatCard', StatCard)
    app.component('StatusTag', StatusTag)
  }
}
