<template>
  <div>
    <el-dialog
      custom-class="c-dialog"
      width="600px"
      top="70px"
      :title="title"
      :visible.sync="visible"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :before-close="handleCancel">
      <div class="tabs">
        <div
          class="tab"
          v-for="tab in tabs"
          :key="tab.key"
          :class="{'active': currentTab === tab.key}"
          @click="currentTab = tab.key">
          {{ tab.label }}
        </div>
      </div>
      <!-- 手动添加 -->
      <div v-if="currentTab === 1" class="tab-content">
        <el-form label-width="15%" ref="form" :model="form" :rules="formRules">
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
            <template v-else-if="item.prop === 'gender'">
              <el-radio-group v-model="form[item.prop]" @change="$refs.form.clearValidate(item.prop)">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </template>
            <template v-else-if="item.prop === 'departments'">
              <dept-picker :depts.sync="form[item.prop]" @save="$refs.form.clearValidate(item.prop)"></dept-picker>
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
        <el-button @click="handleCancel">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('table.confirm') }}</el-button>
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
  </div>
</template>

<script>
import DeptPicker from '@/components/DeptPicker'
import CommonResource from '@/api/common'
import StaffResource from '@/api/staff'

const commonResource = new CommonResource()
const staffResource = new StaffResource()
export default {
  components: { DeptPicker },
  data() {
    let checkGender = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('contact.please_checked_gender')))
      } else {
        callback()
      }
    }
    return {
      title: '',
      visible: false,
      form: {},
      formRules: {
        name: [
          { required: true, trigger: 'blur', message: this.$t('rule_name_req') }
        ],
        mobile: [
          { required: true, trigger: 'blur', message: this.$t('login.rule_username_req') },
          { len: 11, trigger: 'blur', message: this.$t('login.rule_username_len') }
        ],
        gender: [
          { required: true, trigger: 'blur', message: this.$t('contact.please_checked_gender') },
          { validator: checkGender, trigger: 'blur' }
        ],
        departments: [
          { required: true, trigger: 'blur', message: this.$t('contact.please_checked_dept') }
        ]
      },
      formList: [
        { prop: 'name', label: this.$t('personnel.name') },
        { prop: 'mobile', label: this.$t('personnel.mobile'), disable: true },
        { prop: 'email', label: this.$t('personnel.email'), disable: true },
        { prop: 'job_number', label: this.$t('personnel.job_number') },
        { prop: 'position', label: this.$t('personnel.position') },
        { prop: 'gender', label: this.$t('personnel.gender') },
        { prop: 'departments', label: this.$t('personnel.dept') },
      ],
      tabs: [
        { key: 1, label: '手动添加成员' },
        { key: 2, label: '批量导入成员' }
      ],
      currentTab: 1,
      uploadStep: 1,
      progress: 0,
      importDrawer: false,
      importDetail: {},
      submitLoading: false
    }
  },
  methods: {
    add() {
      this.form = {}
      this.title = this.$t('contact.add_member')
      this.visible = true
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
    handleSubmit() {
      if (this.currentTab === 1) {
        this.$refs.form.validate(async(valid) => {
          if (valid) {
            this.submitLoading = true
            try {
              this.form.department_ids = this.form.departments.map(item => item.id)
              await staffResource.create(this.form)
              this.$emit('on-success')
              this.$message.success(this.$t('table.operation_success'))
              this.handleCancel()
            } finally {
              this.submitLoading = false
            }
          }
        })
      } else if (this.currentTab === 2) {
        if (this.uploadStep === 3) {
          this.$emit('handleSubmit')
        }
        this.handleCancel()
      }
    },
    handleCancel() {
      this.currentTab = 1
      this.progress = 0
      this.uploadStep = 1
      this.importDetail = {}
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';
@include cTab(100%, 49px);
.tab-content {
  padding-top: 20px;
}
</style>
