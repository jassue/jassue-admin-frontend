<template>
  <div class="app-container">
    <div v-loading="loading" class="contacts-layout-main">
      <!-- 左侧 -->
      <div class="layout-left">
        <div v-permission="'ROLE_CREATE'" style="text-align: center;margin-bottom: 20px;">
          <el-button style="width: 150px;" type="primary" @click="$refs.roleForm.add()">新增角色</el-button>
        </div>
        <div class="dept-tree">
          <el-tree ref="tree" highlight-current :data="roleList" :props="roleProps" node-key="id" :expand-on-click-node="false" empty-text="" @node-click="nodeClick">
            <span class="custom-tree-node" slot-scope="{node, data}">
              <span><svg-icon v-if="data.id > 0" icon-class="peoples" class="tree-icon" />{{node.label}}</span>
              <el-dropdown v-permission="['ROLE_UPDATE', 'ROLE_DELETE']" v-if="data.id > 0 && !data.is_super && query.role_id === data.id" trigger="click" placement="bottom-start" @command="roleCommand">
                <span class="el-dropdown-link">
                  <i slot="reference" class="el-icon-more" />
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-permission="'ROLE_UPDATE'" command="update_role">编辑</el-dropdown-item>
                  <el-dropdown-item v-permission="'ROLE_DELETE'" v-if="!data.is_preset" style="color: #d84636" command="delete_role">{{$t('table.delete')}}</el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </span>
          </el-tree>
        </div>
      </div>
      <!-- 右侧 -->
      <div class="layout-right">
        <!-- 标题 -->
        <el-row type="flex" justify="space-between" class="dept-info">
          <el-col :span="14"><div class="dept-name">{{currentTreeNode.name}}</div></el-col>
        </el-row>
        <el-divider class="line-divider"></el-divider>
        <!-- 操作 -->
        <el-row type="flex" justify="space-between">
          <el-col :span="18" class="">
            <el-button v-permission="'ADMIN_CREATE'" type="primary" @click="$refs.adminForm.add()">新增</el-button>
            <el-button v-if="selectionList.length === 1" v-permission="'ADMIN_UPDATE'" type="primary" @click="handleAdminEdit">编辑</el-button>
            <el-button v-if="selectionList.length >= 1" v-permission="'ADMIN_UPDATE'" @click="handleAdminResetPwd">重置密码</el-button>
            <el-button v-permission="'ADMIN_DELETE'" type="danger" @click="deleteAdmin">{{$t('table.delete')}}</el-button>
          </el-col>
          <el-col :span="6">
            <el-input class="search" :placeholder="$t('contact.search_member')" prefix-icon="el-icon-search" v-model="query.keyword" @input="getAdminList">
            </el-input>
          </el-col>
        </el-row>
        <el-divider class="line-divider two"></el-divider>
        <!-- 数据表 -->
        <el-table v-loading="tbLoading" ref="multipleTable" :data="adminList" tooltip-effect="dark" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" />
          <el-table-column 
            v-for="(col, index) in tbCols"
            :key="index"
            :prop="col.prop"
            :label="col.label"
            :width="col.width"
            show-overflow-tooltip>
            <template slot-scope="scope">
              <div style="display: flex;" v-if="col.prop === 'name'">
                <div style="width: 25px; height: 25px; display: inline-block; margin-right: 5px;">
                  <avatar-cropper :avatar-url="scope.row['staff']['avatar_url']" :empty-text="scope.row[col.prop].substring(0,1)" :font-size="12.5" :show-change="false"></avatar-cropper>
                </div>
                <span>{{ scope.row[col.prop] }}</span>
                <el-tag v-if="scope.row['staff']['is_preset']" effect="dark" size="mini" class="name-tag">{{$t('contact.creator')}}</el-tag>
              </div>
              <div v-else-if="col.prop === 'status'">
                <el-tag v-if="scope.row[col.prop] === 0">启用</el-tag>
                <el-tag type="danger" v-if="scope.row[col.prop] === 1">禁用</el-tag>
              </div>
              <span v-else>{{ scope.row[col.prop] }}</span>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="paginator-container">
          <pagination v-show="adminTotal > 0" :total="adminTotal" :page.sync="query.page" :limit.sync="query.size" layout="total, prev, pager, next, jumper" @pagination="getAdminList" />
        </div>
      </div>
    </div>
    <!-- 添加/编辑角色 -->
    <role-form ref="roleForm" :permission-list="permissionList" @on-success="roleSubmitSuccess"></role-form>
    <!-- 添加/编辑管理员 -->
    <admin-form ref="adminForm" :role-list="canCheckRoles" @on-success="adminSubmitSuccess"></admin-form>
    <!-- 重置密码 -->
    <reset-pwd-form ref="resetPwdForm"></reset-pwd-form>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import AvatarCropper from '@/components/AvatarCropper'
import AdminResource from '@/api/admin'
import RoleResource from '@/api/role'

import RoleForm from './modules/RoleForm'
import AdminForm from './modules/AdminForm'
import ResetPwdForm from './modules/PasswordForm'

const adminResource = new AdminResource()
const roleResource = new RoleResource()
export default {
  name: 'AdminRole',
  components: {
    Pagination,
    AvatarCropper,
    RoleForm,
    AdminForm,
    ResetPwdForm
  },
  data() {
    return {
      permissionList: [],
      roleList: [],
      roleProps: { children: 'children', 'label': 'name' },
      currentTreeNode: { id: '', name: '全部管理员', permission_ids: [] },
      query: {
        keyword: '',
        role_id: '',
        page: 1,
        size: 10
      },
      selectionList: [],
      adminList: [],
      adminTotal: 0,
      loading: true,
      tbLoading: false,
      tbCols: [
        { prop: 'name', label: '姓名' },
        { prop: 'mobile', label: '手机号（登录账号）' },
        { prop: 'status', label: '状态' },
        { prop: 'created_at', label: '创建时间' }
      ]
    }
  },
  computed: {
    canCheckRoles() {
      let canCheckRoles = JSON.parse(JSON.stringify(this.roleList))
      canCheckRoles.splice(0, 1)
      return canCheckRoles
    }
  },
  created() {
    this.getList()
    this.getPermissionList()
  },
  methods: {
    async getPermissionList() {
      this.permissionList = await roleResource.getPermissionTree()
    },
    async getList() {
      const data = await roleResource.list()
      data.unshift(this.currentTreeNode)
      this.roleList = data
      this.$nextTick(() => {
        this.$refs.tree.$el.firstChild.firstChild.style.height = '40px'
        this.$refs.tree.$el.firstChild.click()
      })
    },
    async nodeClick(data) {
      if (data.id !== '' && data.id === this.currentTreeNode.id) return
      this.query.role_id = data.id
      this.currentTreeNode = {
        id: data.id,
        name: data.name,
        permission_ids: data.permission_ids
      }
      await this.getAdminList()
    },
    async getAdminList() {
      this.tbLoading = true
      const {data, total} = await adminResource.list(this.query)
      this.adminList = data
      this.adminTotal = total
      this.tbLoading = false
      this.loading = false
    },
    roleSubmitSuccess(type, role) {
      if (type === 'add') {
        this.$refs.tree.insertAfter(role, this.$refs.tree.getNode(this.roleList[this.roleList.length-1].id))
      }
      if (type === 'edit') {
        const index = this.roleList.findIndex(item => item.id === role.id)
        this.roleList[index].name = role.name
        this.currentTreeNode.name = role.name
        this.roleList[index].permission_ids = role.permission_ids
        this.currentTreeNode.permission_ids = role.permission_ids
      }
    },
    adminSubmitSuccess(type) {
      if (type === 'add') {
        this.$refs.tree.$el.firstChild.click()
      }
      if (type === 'edit') {
        this.getAdminList()
      }
    },
    roleCommand(command) {
      if (command === 'update_role') {
        this.$refs.roleForm.edit(this.currentTreeNode)
      } else if (command === 'delete_role') {
        this.$confirm(
          this.$t('table.delete_confirm'),
          this.$t('table.tip'),
          {
            confirmButtonText: this.$t('table.confirm'),
            cancelButtonText: this.$t('table.cancel'),
            type: 'warning'
          }
        ).then(async() => {
          await roleResource.delete(this.currentTreeNode.id)
          this.$refs.tree.remove(this.currentTreeNode.id)
          this.$refs.tree.$el.firstChild.click()
          this.$notify.success({
            title: '成功',
            message: this.$t('table.operation_success'),
            duration: 3000
          })
        }).catch(() => {})
      }
    },
    handleAdminEdit() {
      let index = this.adminList.findIndex(item => item.id === this.selectionList[0].id)
      const item = this.adminList[index]
      this.form = {
        role_ids: item.roles.map(item => item.id),
        status: item.status,
        id: item.id,
        name: item.name
      }
      this.$refs.adminForm.edit(this.form)
    },
    handleAdminResetPwd() {
      this.$refs.resetPwdForm.show(this.selectionList.map(item => item.id))
    },
    handleSelectionChange(val) {
      this.selectionList = val
    },
    checkSelection(e) {
      if (this.selectionList.length === 0) {
        this.$message.warning('请选择需要调整部门的成员')
        e.stopPropagation()
      }
    },
    deleteAdmin() {
      if (this.selectionList.length === 0) {
        this.$message.warning(this.$t('table.no_chose_data'))
        return
      }
      const ids = this.selectionList.map(item => item.id)
      this.$confirm(
        this.$t('table.delete_confirm'),
        this.$t('table.tip'),
        {
          confirmButtonText: this.$t('table.confirm'),
          cancelButtonText: this.$t('table.cancel'),
          type: 'warning'
        }
      ).then(async() => {
        await adminResource.delete(ids)
        this.query.page = 1
        this.$refs.tree.$el.firstChild.click()
        this.$message.success(this.$t('table.operation_success'))
      }).catch(() => {})
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '~@/styles/mixin.scss';
  .app-container {
    .contacts-layout-main {
      background-color: #fff;
      height: 665px;
      position: relative;
      .layout-left {
        position: absolute;
        top: 0;
        left: 0;
        width: 270px;
        background-color: #fafcfe;
        height: 100%;
        padding-top: 20px;
        padding-bottom: 20px;
        .dept-tree {
          @include cElTree;
        }
      }
      .layout-right {
        position: relative;
        margin-left: 270px;
        padding: 10px 20px;
        height: 100%;
        .dept-info {
          font-size: 14px;
          .dept-name {
            font-weight: bold;
            height: 40px;
            line-height: 40px;
          }
          .dept-op {
            display: flex;
            justify-content: flex-end;
            align-items: center;
            height: 40px;
            span.op {
              cursor: pointer;
              color: #409eff;
              margin: 0 10px;
            }
            span.divider {
              vertical-align: middle;
              border: solid #e9e9e9;
              border-width: 0 0 0 1px;
              height: 1em;
              margin: 0 10px;
            }
          }
        }
        .line-divider {
          margin: 0 0 6px;
          &.two {
            margin-top: 6px;
          }
        }
        .search /deep/ .el-input__inner {
          border-radius: 16px;
          background-color: #f4f4f4;
          border: none;
        }
        .name-tag {
          border-radius: 12px;
          margin-left: 3px;
        }
        .paginator-container {
          position: absolute;
          left: 0;
          bottom: 0;
          width: 100%;
        }
      }
    }
  }
  .popover-op-container {
    margin-top: 10px;
    button {
      width: 97px;
      &+button {
        margin-left: 6px;
      }
    }
  }
</style>
