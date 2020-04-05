<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="query.keyword" :placeholder="$t('table.enter_keyword')" style="width:200px" />
      <el-select v-model="query.status" style="width:100px">
        <el-option :label="$t('table.all_status')" value="" />
        <el-option :label="$t('table.enable')" value="0" />
        <el-option :label="$t('table.disable')" value="1" />
      </el-select>
      <el-button type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <router-link v-if="checkPermission('ADMIN_CREATE')" to="/administrator/users/create">
        <el-button type="primary" icon="el-icon-plus">
          {{ $t('table.add') }}
        </el-button>
      </router-link>
      <el-dropdown>
        <el-button type="primary">{{ $t('table.batch') }}<i class="el-icon-arrow-down el-icon--right"></i></el-button>
        <el-dropdown-menu slot="dropdown">
          <div @click="batchToggleStatus(0)">
            <el-dropdown-item>{{ $t('table.enable') }}</el-dropdown-item>
          </div>
          <div @click="batchToggleStatus(1)">
            <el-dropdown-item>{{ $t('table.disable') }}</el-dropdown-item>
          </div>
          <div v-if="checkPermission('ADMIN_DELETE')" @click="batchDelete">
            <el-dropdown-item>{{ $t('table.delete') }}</el-dropdown-item>
          </div>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <el-table ref="multipleTable" v-loading="loading" :data="list" tooltip-effect="dark" style="width: 100%" :border="true" @selection-change="handleSelectionChange">
      <el-table-column :selectable="checkSelectable" type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="55" />
      <el-table-column prop="name" :label="$t('nick_name')" />
      <el-table-column prop="username" :label="$t('login.username')" />
      <el-table-column :label="$t('role')">
        <template slot-scope="scope">
          <el-tag v-for="(role, index) in scope.row.roles" :key="index" type="primary" disable-transitions>{{ role.name }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('status')">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === 0 ? 'success' : 'danger'" disable-transitions>{{ statusMap[scope.row.status] }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" :label="$t('create_time')" />
      <el-table-column :label="$t('operation')" width="150" align="center">
        <template v-if="scope.row.is_actionable" slot-scope="scope">
          <el-button v-if="scope.row.status" type="text" @click="toggleStatus(scope.row, 0)">{{ statusMap[0] }}</el-button>
          <el-button v-else type="text" @click="toggleStatus(scope.row, 1)">{{ statusMap[1] }}</el-button>
          <router-link v-if="checkPermission('ADMIN_UPDATE')" :to="'/administrator/users/edit/' + scope.row.id">
            <el-button type="text">{{ $t('table.edit') }}</el-button>
          </router-link>
          <el-button v-if="checkPermission('ADMIN_DELETE')" type="text" @click="deleteOne(scope.row.id)">{{ $t('table.delete') }}</el-button>
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
      list: null,
      total: 0,
      loading: true,
      multipleSelection: [],
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
      this.multipleSelection = val
    },
    batchToggleStatus(status) {
      if (this.multipleSelection.length === 0) {
        this.$message.error(this.$t('table.no_chose_data'))
        return
      }
      var ids = this.multipleSelection.map(item => {
        return item.id
      })
      adminResource.toggleStatus({ ids: ids, status: status })
        .then(() => {
          this.multipleSelection.map(item => {
            item.status = status
          })
          this.$message.success(this.$t('table.operation_success'))
        })
        .catch(error => {
          this.$message.error(error.response.data.message)
        })
    },
    async toggleStatus(row, status) {
      const data = await adminResource.toggleStatus({ ids: [row.id], status: status })
      row.status = data.status
      this.$message.success(this.$t('table.operation_success'))
    },
    batchDelete() {
      if (this.multipleSelection.length === 0) {
        this.$message.error(this.$t('table.no_chose_data'))
        return
      }
      this.$confirm(this.$t('table.delete_confirm'), this.$t('table.tip'), {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning'
      }).then(async() => {
        var ids = this.multipleSelection.map(item => item.id)
        try {
          await adminResource.batchDelete({ ids: ids })
          this.$message.success(this.$t('table.operation_success'))
          this.query.page = 1
          this.getList()
        } catch (error) {
          this.$message.error(error.response.data.message)
        }
      }).catch(() => {})
    },
    deleteOne(id) {
      this.$confirm(this.$t('table.delete_confirm'), this.$t('table.tip'), {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning'
      }).then(() => {
        adminResource.destroy(id)
          .then(() => {
            this.$message.success(this.$t('table.operation_success'))
            this.query.page = 1
            this.getList()
          })
          .catch(error => {
            this.$message.error(error.response.data.message)
          })
      }).catch(() => {})
    }
  }
}
</script>
