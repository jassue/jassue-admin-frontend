<template>
  <div>
    <el-drawer
      custom-class="staff-detail"
      size="350px"
      ref="detailDrawer"
      :wrapperClosable="false"
      :destroy-on-close="true"
      :visible.sync="visible">
      <template slot="title">
        <div class="info-header">
          <div style="width: 50px; height: 50px">
            <avatar-cropper
              :avatar-url.sync="form.avatar_url"
              :empty-text="form.name_one"
              @on-success="result => form.avatar_id = result.id">
            </avatar-cropper>
          </div>
          <div class="title">
            <div>{{ form.name }}</div>
            <div>{{ form.created_at }}</div>
          </div>
        </div>
      </template>
      <div class="info-content">
        <el-form ref="form" :model="form" :rules="formRules">
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
              <dept-picker :depts.sync="form[item.prop]" :isAppendToBody="false" @save="$refs.form.clearValidate(item.prop)"></dept-picker>
            </template>
            <el-input v-else v-model="form[item.prop]" :disabled="item.disable" />
          </el-form-item>
          <div class="btn-group">
            <el-button type="primary" :loading="submitLoading" @click="handleSubmit">修改</el-button>
          </div>
        </el-form>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import AvatarCropper from '@/components/AvatarCropper'
import DeptPicker from '@/components/DeptPicker'
import StaffResource from '@/api/staff'

const staffResource = new StaffResource()
export default {
  components: {
    AvatarCropper,
    DeptPicker
  },
  data() {
    let checkGender = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('contact.please_checked_gender')))
      } else {
        callback()
      }
    }
    return {
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
      submitLoading: false
    }
  },
  methods: {
    show(detail) {
      this.form = Object.assign({}, detail)
      this.form.name_one = detail.name.substring(0, 1)
      this.visible = true
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            this.form.department_ids = this.form.departments.map(item => item.id)
            await staffResource.update(this.form)
            this.$emit('on-success')
            this.handleCancel()
            this.$message.success(this.$t('table.operation_success'))
          } finally {
            this.submitLoading = false
          }
        }
      })
    },
    handleCancel() {
      this.visible = false
      this.$refs.detailDrawer.closeDrawer()
    }
  }
}
</script>

<style lang="scss" scoped>
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