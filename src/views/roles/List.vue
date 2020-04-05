<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="query.keyword" :placeholder="$t('table.enter_keyword')" style="width:200px" />
      <el-button type="primary" icon="el-icon-search" @click="handleFilter">
        {{ $t('table.search') }}
      </el-button>
      <router-link v-if="checkPermission('ROLE_CREATE')" to="/administrator/roles/create">
        <el-button type="primary" icon="el-icon-plus">
          {{ $t('table.add') }}
        </el-button>
      </router-link>
      <el-button v-if="checkPermission('ROLE_DELETE')" type="danger" @click="batchDelete">{{ $t('table.delete') }}</el-button>
    </div>
    <el-table ref="multipleTable" v-loading="loading" :data="list" tooltip-effect="dark" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column :selectable="checkSelectable" type="selection" width="55" />
      <el-table-column prop="id" label="ID" width="55" />
      <el-table-column prop="name" :label="$t('name')" />
      <el-table-column prop="created_at" :label="$t('create_time')" />
      <el-table-column :label="$t('operation')" width="150" align="center">
        <template v-if="scope.row.is_actionable" slot-scope="scope">
          <router-link v-if="checkPermission('ROLE_UPDATE')" :to="'/administrator/roles/edit/' + scope.row.id">
            <el-button type="text">{{ $t('table.edit') }}</el-button>
          </router-link>
          <el-button v-if="checkPermission('ROLE_DELETE')" type="text" @click="deleteOne(scope.row.id)">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination v-show="total > 0" :total="total" :page.sync="query.page" :limit.sync="query.limit" @pagination="getList" />
  </div>
</template>

<script>
import RoleResource from '@/api/role'
import Pagination from '@/components/Pagination'
import checkPermission from '@/utils/permission'

const roleResource = new RoleResource()

export default {
  name: 'RoleList',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      loading: true,
      multipleSelection: [],
      query: {
        keyword: '',
        limit: 15,
        page: 1
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
      const { data, meta } = await roleResource.list(this.query)
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
          await roleResource.batchDelete({ ids: ids })
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
        roleResource.destroy(id)
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
