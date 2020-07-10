<template>
  <div class="app-container">
    <div class="filter-container clearfix">
      <div style="float:left">
        <el-input v-model="query.keyword" :placeholder="$t('table.enter_keyword')" style="width:200px" />
        <el-button type="primary" icon="el-icon-search" @click="handleFilter">
          {{ $t('table.search') }}
        </el-button>
      </div>
      <div style="float: right">
        <el-button v-if="checkPermission('ROLE_CREATE')" type="primary" icon="el-icon-plus" @click="newBtn">
          {{ $t('table.add') }}
        </el-button>
      </div>
    </div>
    <!-- 批量操作 -->
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
    <!-- 数据表 -->
    <el-table ref="multipleTable" v-loading="loading" :data="list" tooltip-effect="dark" border style="width: 100%" @selection-change="handleSelectionChange">
      <el-table-column :selectable="checkSelectable" type="selection" width="55" />
      <el-table-column 
        v-for="(column, index) in tableColumn"
        :key="index"
        :prop="column.prop"
        :label="column.label"
        :width="column.width">
        <template slot-scope="scope">
          <span>{{ scope.row[column.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="$t('operation')" align="center">
        <template v-if="scope.row.is_actionable" slot-scope="scope">
          <router-link v-if="checkPermission('ROLE_UPDATE')" :to="'/administrator/roles/edit/' + scope.row.id">
            <el-button type="text">{{ $t('table.edit') }}</el-button>
          </router-link>
          <el-button v-if="checkPermission('ROLE_UPDATE')" type="primary" @click="editBtn(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button v-if="checkPermission('ROLE_DELETE')" type="danger" @click="deleteOne(scope.row.id)">{{ $t('table.delete') }}</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination v-show="total > 0" :total="total" :page.sync="query.page" :limit.sync="query.limit" @pagination="getList" />
    <!-- 添加/编辑弹出框 -->
    <el-dialog :title="form.id ? '编辑角色' : '添加角色'" :visible.sync="dialogVisible" :before-close="dialogClose" width="680px">
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
          <template v-if="item.type === 'tree'">
            <el-tree
              ref="tree"
              :data="permissionList"
              show-checkbox
              node-key="id"
              :props="{ children: 'children', label: 'name' }"
              @check="check" />
          </template>
          <el-input v-else v-model="form[item.prop]" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">取 消</el-button>
        <el-button type="primary" @click="dialogSubmit">确 定</el-button>
      </div>
    </el-dialog>
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
      tableColumn: [
        { prop: 'id', label: 'ID', width: '55' },
        { prop: 'name', label: this.$t('name') },
        { prop: 'created_at', label: this.$t('create_time') }
      ],
      list: [],
      total: 0,
      loading: true,
      selectionList: [],
      query: {
        keyword: '',
        limit: 15,
        page: 1
      },
      dialogVisible: false,
      permissionList: [],
      form: {},
      formRules: {
        name: [
          { required: true, trigger: 'blur', message: this.$t('rule_name_req') },
          { max: 20, trigger: 'blur', message: this.$t('rule_name_len') }
        ]
      }
    }
  },
  computed: {
    selectionBarList() {
      let barList = [
        { icon: 'el-icon-delete', name: '删除', type: 'delete', permission: 'ROLE_DELETE'}
      ]
      return barList.filter(item => item.permission === undefined || checkPermission(item.permission))
    },
    formList() {
      return [
        { prop: 'name', label: this.$t('name') },
        { prop: 'permission_ids', label: this.$t('permission_title'), type: 'tree' }
      ]
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
      this.selectionList = val
    },
    selectionBarClick(type) {
      if (this.selectionList.length === 0) {
        this.$message.error(this.$t('table.no_chose_data'))
        return
      }
      const ids = this.selectionList.map(item => item.id)
      if (type === 'delete') {
        this.$confirm(
          this.$t('table.delete_confirm'),
          this.$t('table.tip'),
          {
            confirmButtonText: this.$t('table.confirm'),
            cancelButtonText: this.$t('table.cancel'),
            type: 'warning'
          }
        ).then(async() => {
          await roleResource.batchDelete({ ids: ids })
          this.$message.success(this.$t('table.operation_success'))
          this.query.page = 1
          this.getList()
        }).catch(() => {})
      }
    },
    deleteOne(id) {
      this.$confirm(
        this.$t('table.delete_confirm'),
        this.$t('table.tip'),
        {
          confirmButtonText: this.$t('table.confirm'),
          cancelButtonText: this.$t('table.cancel'),
          type: 'warning'
        }).then(async() => {
          await roleResource.destroy(id)
          this.$message.success(this.$t('table.operation_success'))
          this.query.page = 1
          this.getList()
      }).catch(() => {})
    },
    async getPermissionList() {
      const data = await roleResource.getPermissionTree()
      this.permissionList = data.map(item => this.buildTreeNode(item))
      this.$nextTick(() => {
        this.$refs['tree'][0].setCheckedKeys(this.form.permission_ids)
      })
    },
    buildTreeNode(item) {
      item.name = this.$t('permission.' + item.key)
      if (item.children !== undefined && item.children.length > 0) {
        item.children.map(child => this.buildTreeNode(child))
      }
      return item
    },
    newBtn() {
      this.getPermissionList()
      this.dialogVisible = true
      this.form = { permission_ids: [1] }
    },
    editBtn(detail) {
      this.getPermissionList()
      let form = {}
      console.log(this.formList)
      this.formList.forEach(item => {
        form[item.prop] = detail[item.prop]
      })
      form.id = detail.id
      this.form = form
      this.dialogVisible = true
    },
    check(obj, checkObj) {
      this.form.permission_ids = checkObj.checkedKeys
    },
    dialogClose() {
      this.$refs['dialogForm'].resetFields()
      this.dialogVisible = false
    },
    dialogSubmit() {
      this.$refs['dialogForm'].validate(async(valid) => {
        if (valid) {
          if (this.form.id) {
            await roleResource.update(this.form.id, this.form)
          } else {
            await roleResource.store(this.form)
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
  }
}
</script>

<style lang="scss" scoped>
.dialog-form {
  /deep/ .el-form-item {
    margin-bottom: 8px;
    padding-bottom: 15px;
    .el-form-item__content {
      width: 60%;
    }
  }
}
</style>
