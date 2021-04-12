<template>
  <div class="app-container">
    <div v-loading="loading" class="contacts-layout-main">
      <!-- 左侧 -->
      <div class="layout-left">
        <div class="dept-tree">
          <el-tree ref="deptTree" highlight-current :data="deptList" :props="deptProps" node-key="id" :expand-on-click-node="false" :default-expanded-keys="defaultExpandedKeys" empty-text="" @node-click="deptClick">
            <span class="custom-tree-node" slot-scope="{node, data}">
              <span><svg-icon v-if="data.id > 0" icon-class="tree" class="tree-icon" />{{node.label}}</span>
              <el-dropdown v-permission="['DEPT_UPDATE', 'DEPT_CREATE', 'DEPT_DELETE']" v-if="data.id > 0 && staffQuery.department_id === data.id" trigger="click" placement="bottom-start" @command="deptCommand">
                <span class="el-dropdown-link">
                  <el-popover placement="bottom-start" width="230" trigger="manual" v-model="updateNameVisible" @hide="currentDept.update_name = node.label">
                    <el-input ref="deptName1" :placeholder="$t('contact.please_input_name')" v-model="currentDept.update_name"></el-input>
                    <div class="popover-op-container">
                      <el-button @click="updateNameVisible = false">{{$t('table.cancel')}}</el-button>
                      <el-button type="primary" @click="updateDeptName">{{$t('table.confirm')}}</el-button>
                    </div>
                    <i slot="reference" class="el-icon-more" />
                  </el-popover>
                </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item v-permission="'DEPT_UPDATE'" command="update_name">{{$t('contact.update_name')}}</el-dropdown-item>
                  <el-dropdown-item v-permission="'DEPT_CREATE'" command="add_sub_dept">{{$t('contact.add_sub_dept')}}</el-dropdown-item>
                  <el-dropdown-item v-permission="'DEPT_DELETE'" v-if="data.parent_id !== 0" style="color: #d84636" command="delete_dept">{{$t('table.delete')}}</el-dropdown-item>
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
          <el-col :span="14"><div class="dept-name">{{currentDept.name}}</div></el-col>
          <el-col :span="10" v-permission="['DEPT_UPDATE', 'DEPT_CREATE']" v-if="currentDept.id > 0">
            <div class="dept-op">
              <span v-permission="'DEPT_UPDATE'" class="op">
                <el-popover placement="bottom" width="230" trigger="manual" v-model="updateNameVisible2" @hide="currentDept.update_name = currentDept.name">
                  <el-input ref="deptName2" :placeholder="$t('contact.please_input_name')" v-model="currentDept.update_name"></el-input>
                  <div class="popover-op-container">
                    <el-button @click="updateNameVisible2 = false">{{$t('table.cancel')}}</el-button>
                    <el-button type="primary" @click="updateDeptName">{{$t('table.confirm')}}</el-button>
                  </div>
                  <span slot="reference" @click="deptCommand('update_name2')">{{$t('contact.update_name')}}</span>
                </el-popover>
                </span>
              <span v-permission="'DEPT_CREATE'" class="divider"></span>
              <span v-permission="'DEPT_CREATE'" class="op" @click="handleAddDept">{{$t('contact.add_sub_dept')}}</span>
            </div>
          </el-col>
        </el-row>
        <el-divider class="line-divider"></el-divider>
        <!-- 操作 -->
        <el-row type="flex" justify="space-between">
          <el-col :span="18" class="">
            <el-button v-permission="'STAFF_CREATE'" type="primary" @click="$refs.addStaff.add()">{{$t('contact.add_member')}}</el-button>
            <dept-picker v-permission="'STAFF_UPDATE'" ref="deptPicker" style="display: inline-block;margin-left: 10px" @save="setDept">
              <el-button @click="checkSelection">{{$t('contact.op_dept')}}</el-button>
            </dept-picker>
            <el-button style="margin-left: 10px" v-permission="'STAFF_DELETE'" type="danger" @click="deleteStaff">{{$t('table.delete')}}</el-button>
          </el-col>
          <el-col :span="6">
            <el-input class="search" :placeholder="$t('contact.search_member')" prefix-icon="el-icon-search" v-model="staffQuery.keyword" @input="getStaffList">
            </el-input>
          </el-col>
        </el-row>
        <el-divider class="line-divider two"></el-divider>
        <!-- 数据表 -->
        <el-table v-loading="tbLoading" ref="multipleTable" :data="staffList" tooltip-effect="dark" @selection-change="handleSelectionChange" @row-click="showDetail">
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
                  <avatar-cropper :avatar-url="scope.row['avatar_url']" :empty-text="scope.row[col.prop].substring(0,1)" :font-size="12.5" :show-change="false"></avatar-cropper>
                </div>
                <span>{{ scope.row[col.prop] }}</span>
                <el-tag v-if="scope.row['is_preset']" effect="dark" size="mini" class="name-tag">{{$t('contact.creator')}}</el-tag>
              </div>
              <span v-else>{{ scope.row[col.prop] }}</span>
            </template>
          </el-table-column>
        </el-table>
        <!-- 分页 -->
        <div class="paginator-container">
          <pagination v-show="staffTotal > 0" :total="staffTotal" :page.sync="staffQuery.page" :limit.sync="staffQuery.size" layout="total, prev, pager, next, jumper" @pagination="getStaffList" />
        </div>
      </div>
    </div>

    <!-- 添加部门 -->
    <add-dept-form ref="addDept" @on-success="addDeptSuccess"></add-dept-form>
    <!-- 添加成员 -->
    <add-staff-form ref="addStaff" @on-success="addStaffSuccess"></add-staff-form>
    <!-- 详情 -->
    <edit-staff-form ref="editStaff" @on-success="getStaffList"></edit-staff-form>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import DepartmentResource from '@/api/department'
import StaffResource from '@/api/staff'
import DeptPicker from '@/components/DeptPicker'
import AvatarCropper from '@/components/AvatarCropper'

import AddDeptForm from './modules/AddDeptForm'
import AddStaffForm from './modules/AddStaffForm'
import EditStaffForm from './modules/EditStaffForm'

const departmentResource = new DepartmentResource()
const staffResource = new StaffResource()
export default {
  name: 'StaffDep',
  components: { 
    Pagination,
    DeptPicker,
    AvatarCropper,
    AddDeptForm,
    AddStaffForm,
    EditStaffForm
  },
  data() {
    return {
      deptList: [],
      deptProps: { children: 'children', 'label': 'name' },
      defaultExpandedKeys: [],
      currentDept: { id: '', name: this.$t('contact.all_member'), update_name: '' },
      staffQuery: {
        keyword: '',
        department_id: '',
        page: 1,
        size: 10
      },
      selectionList: [],
      staffList: [],
      staffTotal: 0,
      loading: true,
      tbLoading: false,
      tbCols: [
        { prop: 'name', label: this.$t('personnel.name') },
        { prop: 'mobile', label: this.$t('personnel.mobile') },
        { prop: 'email', label: this.$t('personnel.email') },
        { prop: 'job_number', label: this.$t('personnel.job_number') },
        { prop: 'position', label: this.$t('personnel.position') }
      ],
      updateNameVisible: false,
      updateNameVisible2: false,
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      const data = await departmentResource.list({is_tree: 1})
      this.defaultExpandedKeys = data.map(item => item.id)
      data.unshift(this.currentDept)
      this.deptList = data
      this.$nextTick(() => {
        this.$refs.deptTree.$el.firstChild.firstChild.style.height = '40px'
        this.$refs.deptTree.$el.firstChild.click()
      })
    },
    async deptClick(data) {
      if (data.id !== '' && data.id === this.currentDept.id) return
      this.staffQuery.department_id = data.id
      this.currentDept = {
        id: data.id,
        name: data.name,
        update_name: data.name
      }
      await this.getStaffList()
    },
    async getStaffList() {
      this.tbLoading = true
      const {data, total} = await staffResource.list(this.staffQuery)
      this.staffList = data
      this.staffTotal = total
      this.tbLoading = false
      this.loading = false
    },
    handleAddDept() {
      this.$refs.addDept.add(this.currentDept.id)
    },
    addDeptSuccess(dept) {
      this.$refs.deptTree.append(dept, this.$refs.deptTree.getNode(this.currentDept.id))
      this.$refs.deptTree.defaultExpandedKeys.push(this.currentDept.id)
    },
    deptCommand(command) {
      if (command === 'update_name') {
        this.updateNameVisible = true
        this.updateNameVisible2 = false
        this.$nextTick(() => {
          this.$refs.deptName1.select()
        })
      } else if (command === 'update_name2') {
        this.updateNameVisible2 = true
        this.updateNameVisible = false
        this.$nextTick(() => {
          this.$refs.deptName2.select()
        })
      } else if (command === 'add_sub_dept') {
        this.handleAddDept()
      } else if (command === 'delete_dept') {
        this.$confirm(
          this.$t('table.delete_confirm'),
          this.$t('table.tip'),
          {
            confirmButtonText: this.$t('table.confirm'),
            cancelButtonText: this.$t('table.cancel'),
            type: 'warning'
          }
        ).then(async() => {
          await departmentResource.delete(this.currentDept.id)
          this.$refs.deptTree.remove(this.currentDept.id)
          this.$notify.success({
            title: '成功',
            message: this.$t('table.operation_success'),
            duration: 3000
          })
        }).catch(() => {})
      }
    },
    async updateDeptName() {
      await departmentResource.updateName({
        id: this.currentDept.id,
        name: this.currentDept.update_name
      })
      this.currentDept.name = this.currentDept.update_name
      const node = this.$refs.deptTree.getNode(this.currentDept.id)
      node.data.name = this.currentDept.name
      this.updateNameVisible = false
      this.updateNameVisible2 = false
    },
    addStaffSuccess() {
      this.$refs.deptTree.$el.firstChild.click()
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
    async setDept(departments) {
      await staffResource.setDept(
        this.selectionList.map(item => item.id),
        departments.map(item => item.id)
      )
      this.$message.success(this.$t('table.operation_success'))
      this.$refs.deptTree.$el.firstChild.click()
    },
    deleteStaff() {
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
        await staffResource.delete(ids)
        this.staffQuery.page = 1
        this.$refs.deptTree.$el.firstChild.click()
        this.$message.success(this.$t('table.operation_success'))
      }).catch(() => {})
    },
    showDetail(row) {
      this.$refs.editStaff.show(row)
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
