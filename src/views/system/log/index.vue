<template>
  <div class="app-container">
    <el-card shadow="never">
      <div class="card-title">操作日志</div>
      <search-form
        :search-form.sync="searchForm"
        :search-form-list="searchFormList"
        @search="search">
      </search-form>
      <el-table
        v-loading="tbLoading"
        :data="list"
        tooltip-effect="dark">
          <el-table-column 
            v-for="(col, index) in tbCols"
            :key="index"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            :align="col.align"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <span >{{ scope.row[col.prop] }}</span>
            </template>
          </el-table-column>
        </el-table>
        <pagination v-show="listTotal > 0" :total="listTotal" :page.sync="searchForm.page" :limit.sync="searchForm.size" layout="total, prev, pager, next, jumper" @pagination="getList" />
    </el-card>
  </div>
</template>

<script>
import SearchForm from '@/components/SearchForm'
import Pagination from '@/components/Pagination'
import LogResource from '@/api/log'

const logResource = new LogResource()
export default {
  name: 'Log',
  components: { SearchForm, Pagination },
  data() {
    return {
      searchForm: {
        page: 1,
        size: 15
      },
      searchFormList: [
        { prop: 'admin_name', label: '管理员姓名' },
        { prop: 'operate_time', label: '操作时间', type: 'date-range' }
      ],
      list: [],
      listTotal: 0,
      tbCols: [
        { prop: 'operator_id', label: '管理员ID', width: '120px' },
        { prop: 'operator_name', label: '管理员姓名' },
        { prop: 'content', label: '内容', width: '300px' },
        { prop: 'client_ip', label: '客户端IP' },
        { prop: 'created_at', label: '操作时间' }
      ],
      tbLoading: true
    }
  },
  created() {
    this.getList()
  },
  methods: {
    search() {
      this.searchForm.page = 1
      this.getList()
    },
    async getList() {
      this.tbLoading = true
      const { data, total } = await logResource.list(Object.assign(this.searchForm, {
        start_time: this.searchForm.operate_time ? this.searchForm.operate_time[0] : '',
        end_time: this.searchForm.operate_time ? this.searchForm.operate_time[1] : ''
      }))
      this.list = data
      this.listTotal = total
      this.tbLoading = false
    }
  }
}
</script>
