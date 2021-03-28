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
              <span v-permission="'DEPT_CREATE'" class="op" @click="addDeptDialog = true">{{$t('contact.add_sub_dept')}}</span>
            </div>
          </el-col>
        </el-row>
        <el-divider class="line-divider"></el-divider>
        <!-- 操作 -->
        <el-row type="flex" justify="space-between">
          <el-col :span="18" class="">
            <el-button v-permission="'STAFF_CREATE'" type="primary" @click="(addStaffDialog = true) && (addStaffDialogTab = 1)">{{$t('contact.add_member')}}</el-button>
            <dept-picker v-permission="'STAFF_UPDATE'" ref="deptPicker" style="display: inline-block;margin-left: 10px" @save="setDept">
              <el-button @click="checkSelection">{{$t('contact.op_dept')}}</el-button>
            </dept-picker>
            <el-button style="margin-left: 10px" v-permission="'STAFF_DELETE'" type="danger" @click="staffCommand('delete')">{{$t('table.delete')}}</el-button>
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
              <div v-if="col.prop === 'name'">
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
    <el-dialog :title="$t('contact.add_sub_dept')" :visible.sync="addDeptDialog" :destroy-on-close="true" width="40%">
      <el-form ref="addDept" label-width="15%" label-position="left" :model="addDeptForm" :rules="formRules">
        <el-form-item :label="$t('contact.name')" prop="dept_name">
          <el-input v-model="addDeptForm.dept_name" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDeptDialog=false">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="addDept">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>
    
    <!-- 添加成员 -->
    <el-dialog custom-class="add-staff" :title="$t('contact.add_member')" :visible.sync="addStaffDialog" :destroy-on-close="true" :close-on-click-modal="false" :before-close="dialogClose" width="600px" top="70px">
      <div class="tabs">
        <div class="tab" :class="{'active': addStaffDialogTab === 1}" @click="addStaffDialogTab = 1">手动添加成员</div>
        <div class="tab" :class="{'active': addStaffDialogTab === 2}"  @click="addStaffDialogTab = 2">批量导入成员</div>
      </div>
      <!-- 手动添加 -->
      <div v-if="addStaffDialogTab === 1" class="tab-content">
        <el-form label-width="15%" ref="dialogForm" :model="form" :rules="formRules">
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
            <template v-else-if="item.type === 'radio'">
              <el-radio-group v-model="form[item.prop]" @change="$refs.dialogForm.clearValidate(item.prop)">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </template>
            <template v-else-if="item.type === 'department'">
              <dept-picker :depts.sync="form[item.prop]" @save="$refs.dialogForm.clearValidate(item.prop)"></dept-picker>
            </template>
            <el-input v-else v-model="form[item.prop]" />
          </el-form-item>
        </el-form>
      </div>
      <!-- 批量导入 -->
      <div v-else>
        <div class="dialog-tips">
          <li><span>请下载<a class="template-link" @click="downloadTemplate">通讯录模板</a>，按格式修改后导入</span></li>
          <li><span>每次最多导入200名成员，已经在通讯录内或信息有误的成员不导入</span></li>
        </div>
        <div>
          <el-upload
            class="upload-excel"
            drag
            accept=".xlsx"
            :show-file-list="false"
            :disabled="uploadStep !== 1"
            action=""
            :http-request="fileUpload">
            <div class="content">
              <template v-if="uploadStep === 1">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
              </template>
              <template v-if="uploadStep === 2">
                <el-progress style="padding: 0 20px" :percentage="progress"></el-progress>
              </template>
              <template v-if="uploadStep === 3">
                <i class="el-icon-circle-check"></i>
                <div class="success-tip">
                  <span>成功导入{{ importDetail.success_count ? importDetail.success_count:0 }}名成员，失败<span class="fail">{{ importDetail.failure_count ? importDetail.failure_count:0}}</span>名</span>
                </div>
                <div>
                  <el-button @click.stop="importDrawer = true">查看失败详情</el-button>
                  <el-button type="primary" @click.stop="(uploadStep = 1) || (importDetail = {})">继续导入</el-button>
                </div>
              </template>
            </div>
          </el-upload>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="dialogSubmit">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
    
    <!-- 批量导入失败详情 -->
    <el-drawer
      title="导入失败详情"
      :visible.sync="importDrawer"
      direction="btt"
      size="90%"
      :before-close="() => {this.importDrawer = false}">
      <div class="drawer-container">
        <el-table border :data="importDetail.failure_data">
          <el-table-column type="index" label="序号" width="50"></el-table-column>
          <el-table-column
            v-for="(col, index) in formList"
            :key="index"
            :prop="col.prop"
            :label="col.label">
          </el-table-column>
          <el-table-column prop="error" label="失败原因">
            <template slot-scope="scope">
              <span style="color: #d84636">{{ scope.row['error'] }}</span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-drawer>

    <!-- 详情 -->
    <el-drawer
      custom-class="staff-detail"
      :wrapperClosable="false"
      :destroy-on-close="true"
      size="350px"
      :visible.sync="detailDrawer">
      <template slot="title">
        <div class="info-header">
          <div style="width: 50px; height: 50px">
            <avatar-cropper :avatar-url="detail.avatar_url" :empty-text="detail.name_one" @save="uploadImg"></avatar-cropper>
          </div>
          <div class="title">
            <div>{{ detail.name }}</div>
            <div>{{ detail.created_at }}</div>
          </div>
        </div>
      </template>
      <div class="info-content">
        <el-form ref="detailForm" :model="detail" :rules="formRules">
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
            <template v-else-if="item.type === 'radio'">
              <el-radio-group v-model="detail[item.prop]" @change="$refs.detailForm.clearValidate(item.prop)">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </template>
            <template v-else-if="item.type === 'department'">
              <dept-picker :depts.sync="detail[item.prop]" :isAppendToBody="false" @save="$refs.detailForm.clearValidate(item.prop)"></dept-picker>
            </template>
            <el-input v-else v-model="detail[item.prop]" :disabled="item.disable" />
          </el-form-item>
          <div class="btn-group">
            <el-button type="primary" @click="staffCommand('update')">修改</el-button>
          </div>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import Pagination from '@/components/Pagination'
import DepartmentResource from '@/api/department'
import StaffResource from '@/api/staff'
import CommonResource from '@/api/common'
import DeptPicker from '@/components/DeptPicker'
import AvatarCropper from '@/components/AvatarCropper'

const departmentResource = new DepartmentResource()
const staffResource = new StaffResource()
const commonResource = new CommonResource()
export default {
  name: 'StaffDep',
  components: { Pagination, DeptPicker, AvatarCropper },
  data() {
    const checkGender = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('contact.please_checked_gender')))
      } else {
        callback()
      }
    }
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
      addDeptDialog: false,
      addDeptForm: {
        dept_name: ''
      },
      addStaffDialog: false,
      addStaffDialogTab: 1,
      uploadStep: 1,
      progress: 0,
      importDetail: {},
      importDrawer: false,
      detailDrawer: false,
      detail: {},
      formList: [
        { prop: 'name', label: this.$t('personnel.name') },
        { prop: 'mobile', label: this.$t('personnel.mobile'), disable: true },
        { prop: 'email', label: this.$t('personnel.email'), disable: true },
        { prop: 'job_number', label: this.$t('personnel.job_number') },
        { prop: 'position', label: this.$t('personnel.position') },
        { prop: 'gender', label: this.$t('personnel.gender'), type: 'radio' },
        { prop: 'departments', label: this.$t('personnel.dept'), type: 'department' },
      ],
      form: {},
      formRules: {
        dept_name: [
          { required: true, trigger: 'blur', message: this.$t('contact.please_input_name') }
        ],
        name: [
          { required: true, trigger: 'blur', message: this.$t('rule_name_req') }
        ],
        mobile: [
          { required: true, trigger: 'blur', message: this.$t('login.rule_username_req') },
          { len: 11, trigger: 'blur', message: this.$t('login.rule_username_len') }
        ],
        gender: [
          { validator: checkGender, trigger: 'blur' }
        ],
        departments: [
          { required: true, trigger: 'blur', message: this.$t('contact.please_checked_dept') }
        ]
      }
    }
  },
  async created() {
    this.loading = true
    await Promise.all([this.getList(), this.getStaffList()])
    this.loading = false
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
      const {data, total} = await departmentResource.listStaff(this.staffQuery)
      this.staffList = data
      this.staffTotal = total
      this.tbLoading = false
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
        this.addDeptDialog = true
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
          this.$notify.success(this.$t('table.operation_success'))
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
    async addDept() {
      this.$refs.addDept.validate(async(valid) => {
        if (valid) {
          const dept = await departmentResource.create({
            parent_id: this.currentDept.id,
            name: this.addDeptForm.dept_name
          })
          this.$refs.deptTree.append(dept, this.$refs.deptTree.getNode(this.currentDept.id))
          this.$refs.deptTree.defaultExpandedKeys.push(this.currentDept.id)
          this.addDeptDialog = false
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    dialogClose() {
      this.form = {}
      this.uploadStep = 1
      this.progress = 0
      this.importDetail = {}
      this.addStaffDialog = false
    },
    dialogSubmit() {
      if (this.addStaffDialogTab === 1) {
        this.$refs.dialogForm.validate(async(valid) => {
          if (valid) {
            this.form.department_ids = this.form.departments.map(item => item.id)
            await staffResource.create(this.form)
            this.dialogClose()
            this.$refs.deptTree.$el.firstChild.click()
            this.$message.success(this.$t('table.operation_success'))
          } else {
            console.log('error submit!!')
            return false
          }
        })
      } else if (this.addStaffDialogTab === 2) {
        if (this.uploadStep === 3) {
          this.$refs.deptTree.$el.firstChild.click()
        }
        this.dialogClose()
      }
    },
    downloadTemplate() {
      commonResource.downloadExcelTemplate('staff')
    },
    async fileUpload({ file }) {
      this.uploadStep = 2
      this.progress = 0
      const onUploadProgress = progressEvent => {
        this.progress = ((progressEvent.loaded / progressEvent.total) * 100) | 0
      }
      try {
        const { cache_key } = await commonResource.excelUpload(file, onUploadProgress)
        const data = await staffResource.excelImport(cache_key)
        this.importDetail = data
        this.importDetail.failure_data = data.failure_data.map(item => {
          item.row_data.error = item.error
          return item.row_data
        })
        this.uploadStep = 3
      } catch (e) {
        this.uploadStep = 1
      }
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
    async staffCommand(command) {
      if (command === 'delete') {
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
      } else if (command === 'update') {
        this.$refs['detailForm'].validate(async(valid) => {
          if (valid) {
            this.detail.department_ids = this.detail.departments.map(item => item.id)
            await staffResource.update(this.detail)
            this.getStaffList()
            this.detailDrawer = false
            this.$message.success(this.$t('table.operation_success'))
          } else {
            console.log('error submit!!')
            return false
          }
        })
      }
    },
    showDetail(row) {
      this.detailDrawer = true
      this.detail = JSON.parse(JSON.stringify(row))
      this.detail.name_one = row.name.substring(0, 1)
    },
    async uploadImg(img) {
      const { id, url } = await commonResource.imageUpload(img, 'avatar')
      this.detail.avatar_id = id
      this.detail.avatar_url = url
    }
  }
}
</script>

<style lang="scss">
  .app-main {
    background-color: #f0f2f5;
    .add-staff  {
      .el-dialog__header {
        border-bottom: 1px solid #e9e9e9 !important;
      }
      .el-dialog__body {
        padding: 0 35px;
      }
    }
  }
</style>

<style lang="scss" scoped>
  @import '~@/styles/mixin.scss';
  .app-container {
    .contacts-layout-main {
      background-color: #fff;
      height: 665px;
      position: relative;
      border: 1px solid #e7eaf1;
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
    @include cTab(100%, 49px);
    .tab-content {
      padding-top: 20px;
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
  .staff-detail {
    .info-header {
      display: flex;
      align-self: center;
      .title {
        margin-left: 20px;
        div {
          margin: 5px 0;
        }
        div + div {
          margin-top: 8px;
          font-size: 13px;
        }
      }
    }
  }
</style>
