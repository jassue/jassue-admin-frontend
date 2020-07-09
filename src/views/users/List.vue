<template>
  <div class="app-container">
    <div class="filter-container clearfix">
      <div style="float:left">
        <el-input v-model="query.keyword" :placeholder="$t('table.enter_keyword')" style="width:200px" />
        <el-select v-model="query.status" style="width:100px">
          <el-option :label="$t('table.all_status')" value="" />
          <el-option :label="$t('table.enable')" value="0" />
          <el-option :label="$t('table.disable')" value="1" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('table.search') }}
        </el-button>
      </div>
      <div style="float:right">
        <router-link v-if="checkPermission('ADMIN_CREATE')" to="/administrator/users/create">
          <el-button type="primary" icon="el-icon-plus">
            {{ $t('table.add') }}
          </el-button>
        </router-link>
      </div>
    </div>
    <div v-if="selectionList.length > 0 && selectionBarList.length > 0" class="selection-bar">
      <div class="selected—title">已选中<span class="selected—count">{{ selectionList.length }}</span>项</div>
      <div class="selection-items-box">
        <div v-for="(item, index) in selectionBarList" :key="index" class="selection-item">
          <i :class="item.icon">
            <span class="selection-item-name" @click="selectionBarClick(item.type)">{{ item.name }}</span>
          </i>
        </div>
      </div>
    </div>
    <el-table ref="multipleTable"
      v-loading="loading" 
      :data="list"
      tooltip-effect="dark"
      style="width: 100%"
      :border="true"
      @selection-change="handleSelectionChange">
      <el-table-column :selectable="checkSelectable" type="selection" width="55" />
      <el-table-column 
        v-for="(column, index) in tableColumn"
        :key="index"
        :prop="column.prop"
        :label="column.label"
        :width="column.width">
        <template slot-scope="scope">
          <div v-if="column.prop === 'roles'">
            <el-tag v-for="(role, index) in scope.row[column.prop]" :key="index" type="primary" disable-transitions>{{ role.name }}</el-tag>
          </div>
          <div v-else-if="column.prop === 'status'">
            <el-tag :type="scope.row[column.prop] === 0 ? 'success' : 'danger'" disable-transitions>{{ statusMap[scope.row[column.prop]] }}</el-tag>
          </div>
          <span v-else>{{ scope.row[column.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('operation')" width="200" align="center">
        <template v-if="scope.row.is_actionable" slot-scope="scope">
          <el-button size="mini" v-if="scope.row.status" type="success" @click="toggleStatus(scope.row, 0)">{{ statusMap[0] }}</el-button>
          <el-button size="mini" v-else type="info" @click="toggleStatus(scope.row, 1)">{{ statusMap[1] }}</el-button>
          <router-link v-if="checkPermission('ADMIN_UPDATE')" :to="'/administrator/users/edit/' + scope.row.id">
            <el-button size="mini" type="primary">{{ $t('table.edit') }}</el-button>
          </router-link>
          <el-button size="mini" v-if="checkPermission('ADMIN_DELETE')" type="danger" @click="deleteOne(scope.row.id)">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="query.page" :limit.sync="query.limit" @pagination="getList" />
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import AdminResource from '@/api/admin'
import checkPermission from '@/utils/permission'

const adminResource = new AdminResource()
export default {
  name: 'UserList',
  components: { Pagination },
  data() {
    return {
      tableColumn: [
        { prop: 'id', label: 'ID', width: '55' },
        { prop: 'name', label: this.$t('nick_name') },
        { prop: 'username', label: this.$t('login.username') },
        { prop: 'name', label: this.$t('nick_name') },
        { prop: 'roles', label: this.$t('role') },
        { prop: 'status', label: this.$t('status') },
        { prop: 'created_at', label: this.$t('create_time') }
      ],
      list: [],
      total: 0,
      loading: true,
      selectionList: [],
      query: {
        status: '',
        keyword: '',
        limit: 15,
        page: 1
      },
      statusMap: {
        0: this.$t('table.enable'),
        1: this.$t('table.disable')
      }
    }
  },
  computed: {
    selectionBarList() {
      let barList = [
        { icon: 'el-icon-circle-close', name: '禁用', type: 'disable', permission: 'ADMIN_UPDATE'},
        { icon: 'el-icon-circle-check', name: '启用', type: 'enable', permission: 'ADMIN_UPDATE'},
        { icon: 'el-icon-delete', name: '删除', type: 'delete', permission: 'ADMIN_DELETE'}
      ]
      return barList.filter(item => item.permission === undefined || checkPermission(item.permission))
    }
  },
  created() {
    this.getList()
  },
  methods: {
    checkPermission,
    async getList() {
      this.loading = true
      const { data, meta } = await adminResource.list(this.query)
      this.list = data
      this.total = meta.total
      this.loading = false
    },
    handleFilter() {
      this.query.page = 1
      this.getList()
    },
    checkSelectable(row) {
      return row.is_actionable
    },
    handleSelectionChange(val) {
      this.selectionList = val
    },
    selectionBarClick(type) {
      if (this.selectionList.length === 0) {
        this.$message.error(this.$t('table.no_chose_data'))
        return
      }
      const ids = this.selectionList.map(item => item.id)
      if (type === 'enable' || type === 'disable') {
        const status = type === 'enable' ? 0 : 1
        adminResource.toggleStatus({ ids: ids, status: status })
        .then(() => {
          this.selectionList.map(item => {
            item.status = status
          })
          this.$message.success(this.$t('table.operation_success'))
        })
      }
      else if (type === 'delete') {
        this.$confirm(
          this.$t('table.delete_confirm'),
          this.$t('table.tip'),
          {
            confirmButtonText: this.$t('table.confirm'),
            cancelButtonText: this.$t('table.cancel'),
            type: 'warning'
          }
        ).then(async() => {
          await adminResource.batchDelete({ ids: ids })
          this.$message.success(this.$t('table.operation_success'))
          this.query.page = 1
          this.getList()
        }).catch(() => {})
      }
    },
    async toggleStatus(row, status) {
      const data = await adminResource.toggleStatus({ ids: [row.id], status: status })
      row.status = data.status
      this.$message.success(this.$t('table.operation_success'))
    },
    deleteOne(id) {
      this.$confirm(
        this.$t('table.delete_confirm'),
        this.$t('table.tip'),
        {
          confirmButtonText: this.$t('table.confirm'),
          cancelButtonText: this.$t('table.cancel'),
          type: 'warning'
        }
      ).then(async() => {
        await adminResource.destroy(id)
        this.$message.success(this.$t('table.operation_success'))
        this.query.page = 1
        this.getList()
      }).catch(() => {})
    }
  }
}
</script>
