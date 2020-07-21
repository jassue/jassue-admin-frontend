<template>
  <div class="app-container">
    <div class="filter-container clearfix">
      <div style="float:left">
        <el-input v-model="query.keyword" :placeholder="$t('table.enter_keyword')" style="width:200px" />
        <el-select v-model="query.status" clearable :placeholder="$t('status')" style="width:100px">
          <el-option :label="$t('table.enable')" value="0" />
          <el-option :label="$t('table.disable')" value="1" />
        </el-select>
        <el-button type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('table.search') }}
        </el-button>
      </div>
      <div style="float:right">
        <el-button v-if="checkPermission('ADMIN_CREATE')" type="primary" icon="el-icon-plus" @click="newBtn">
          {{ $t('table.add') }}
        </el-button>
      </div>
    </div>
    <!-- 批量操作 -->
    <div v-if="selectionList.length > 0 && selectionBarList.length > 0" class="selection-bar">
      <div class="selected—title">
        {{ $t('selection_bar.selected') }}
        <span class="selected—count">{{ selectionList.length }}</span>
        {{ $t('selection_bar.item') }}
      </div>
      <div class="selection-items-box">
        <div v-for="(item, index) in selectionBarList" :key="index" class="selection-item">
          <i :class="item.icon">
            <span class="selection-item-name" @click="selectionBarClick(item.type)">{{ item.name }}</span>
          </i>
        </div>
      </div>
    </div>
    <!-- 数据表 -->
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
      <el-table-column :label="$t('operation')" align="center" width="250">
        <template v-if="scope.row.is_actionable" slot-scope="scope">
          <el-button v-if="scope.row.status" size="mini" type="success" @click="toggleStatus(scope.row, 0)">{{ statusMap[0] }}</el-button>
          <el-button v-else size="mini" type="info" @click="toggleStatus(scope.row, 1)">{{ statusMap[1] }}</el-button>
          <el-button v-if="checkPermission('ADMIN_UPDATE')" size="mini" type="primary" @click="editBtn(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button v-if="checkPermission('ADMIN_DELETE')" size="mini" type="danger" @click="deleteOne(scope.row.id)">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" :page.sync="query.page" :limit.sync="query.limit" @pagination="getList" />
    <!-- 添加/编辑弹出框 -->
    <el-dialog :title="form.id ? $t('table.edit') : $t('table.add')" :visible.sync="dialogVisible" :before-close="dialogClose" width="680px">
      <el-form label-width="20%" ref="dialogForm" :model="form" :rules="formRules" class="dialog-form">
        <el-form-item
          v-for="(item, index) in formList"
          :key="index"
          :prop="item.prop"
          :label="item.label">
          <span slot="label">{{ item.label }}</span>
          <el-tooltip
            v-if="item.tips"
            slot="label"
            :content="item.tips"
            effect="dark"
            placement="top">
            <svg-icon class="tooltip-icon" icon-class="question" />
          </el-tooltip>
          <template v-if="item.type === 'checkbox'">
            <el-checkbox-group v-model="form[item.prop]">
              <el-checkbox v-for="role in roleList" :key="role.id" :label="role.id">{{ role.name }}</el-checkbox>
            </el-checkbox-group>
          </template>
          <template v-else-if="item.type === 'switch'">
            <el-switch v-model="form[item.prop]"
            active-color="#409eff"
            active-value="0"
            inactive-color="#dcdfe6"
            inactive-value="1" />
          </template>
          <el-input v-else v-model="form[item.prop]" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="dialogSubmit">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
    <!-- 重置密码 -->
    <el-dialog :title="$t('reset_password')" :visible.sync="resetPwdDialog" :before-close="resetPwdDialogClose" width="680px">
      <el-form label-width="20%" ref="resetPwd" :model="passForm" :rules="formRules" class="dialog-form">
        <el-form-item :label="$t('login.password')" prop="password">
          <el-input v-model="passForm.password" type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPwdDialogClose">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="resetPwd">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
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
      dialogVisible: false,
      form: {},
      roleList: [],
      resetPwdDialog: false,
      passForm: {}
    }
  },
  computed: {
    tableColumn() {
      return [
        { prop: 'id', label: 'ID', width: '55' },
        { prop: 'username', label: this.$t('login.username') },
        { prop: 'name', label: this.$t('nick_name') },
        { prop: 'roles', label: this.$t('role') },
        { prop: 'status', label: this.$t('status') },
        { prop: 'created_at', label: this.$t('create_time') }
      ]
    },
    statusMap() {
      return {
        0: this.$t('table.enable'),
        1: this.$t('table.disable')
      }
    },
    formRules() {
      return {
        name: [
          { required: true, trigger: 'blur', message: this.$t('rule_nick_name_req') },
          { max: 10, trigger: 'blur', message: this.$t('rule_nick_name_len') }
        ],
        username: [
          { required: true, trigger: 'blur', message: this.$t('rule_nick_name_req') },
          { max: 16, min: 3, trigger: 'blur', message: this.$t('login.rule_username_len') }
        ],
        password: [
          { required: true, min: 6, trigger: 'blur', message: this.$t('login.rule_pass_len') }
        ],
        role_ids: [
          { required: true, trigger: 'blur', message: this.$t('rule_role_req') }
        ],
        status: [
          { required: true, trigger: 'blur' }
        ]
      }
    },
    selectionBarList() {
      let barList = [
        { icon: 'el-icon-circle-close', name: this.$t('table.disable'), type: 'disable', permission: 'ADMIN_UPDATE'},
        { icon: 'el-icon-circle-check', name: this.$t('table.enable'), type: 'enable', permission: 'ADMIN_UPDATE'},
        { icon: 'el-icon-refresh-right', name: this.$t('reset_password'), type: 'reset-pwd', permission: 'ADMIN_UPDATE'},
        { icon: 'el-icon-delete', name: this.$t('table.delete'), type: 'delete', permission: 'ADMIN_DELETE'},
      ]
      return barList.filter(item => item.permission === undefined || checkPermission(item.permission))
    },
    formList() {
      if (this.form.id) {
        return [
          { prop: 'username', label: this.$t('login.username') },
          { prop: 'name', label: this.$t('nick_name') },
          { prop: 'role_ids', label: this.$t('role'), type: 'checkbox' },
          { prop: 'status', label: this.$t('status'), type: 'switch' }
        ]
      } else {
        return [
          { prop: 'username', label: this.$t('login.username') },
          { prop: 'name', label: this.$t('nick_name') },
          { prop: 'password', label: this.$t('login.password') },
          { prop: 'role_ids', label: this.$t('role'), type: 'checkbox' },
          { prop: 'status', label: this.$t('status'), type: 'switch' }
        ]
      }
    }
  },
  watch: {
    '$store.getters.language'() {
      this.getList()
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
      else if (type === 'reset-pwd') {
        this.passForm = { ids: ids }
        this.resetPwdDialog = true
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
    },
    getRoleList() {
      adminResource.getRoleListForCreateOrUpdate()
      .then(res => {
        this.roleList = res
      })
    },
    newBtn() {
      this.dialogVisible = true
      this.getRoleList()
      this.form = {
        role_ids: [],
        status: '0'
      }
    },
    editBtn(detail) {
      this.getRoleList()
      let form = {}
      this.formList.forEach(item => {
        if (item.prop !== 'password') {
          if (item.prop === 'role_ids') {
            form[item.prop] = detail.roles.map(item => item.id)
          } else if (item.prop === 'status') {
            form[item.prop] = detail.status.toString()
          } else {
            form[item.prop] = detail[item.prop]
          }
        }
      })
      form.id = detail.id
      this.form = form
      this.dialogVisible = true
    },
    dialogClose() {
      this.$refs['dialogForm'].clearValidate()
      this.dialogVisible = false
    },
    dialogSubmit() {
      this.$refs['dialogForm'].validate(async(valid) => {
        if (valid) {
          if (this.form.id) {
            await adminResource.update(this.form.id, this.form)
          } else {
            await adminResource.store(this.form)
          }
          this.dialogClose()
          this.getList()
          this.$message.success(this.$t('table.operation_success'))
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetPwdDialogClose() {
      this.$refs['resetPwd'].resetFields()
      this.resetPwdDialog = false
    },
    resetPwd() {
      this.$refs['resetPwd'].validate(async(valid) => {
        if (valid) {
          await adminResource.resetPassword(this.passForm)
          this.resetPwdDialogClose()
          this.$message.success(this.$t('table.operation_success'))
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
