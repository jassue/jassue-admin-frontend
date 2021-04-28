<template>
  <div>
    <el-dialog
      custom-class="c-dialog"
      width="600px"
      top="70px"
      v-if="visible"
      :title="title"
      :visible.sync="visible"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :before-close="handleCancel">
      <el-form label-width="12%" ref="form" :model="form" :rules="formRules">
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
          <template v-if="item.prop === 'role_ids'">
            <el-select style="width: 100%" v-model="form[item.prop]" multiple placeholder="" @change="$refs.form.clearValidate(item.prop)">
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </template>
          <template v-else-if="item.prop === 'staff'">
            <staff-picker :staff.sync="form[item.prop]" @save="$refs.form.clearValidate(item.prop)"></staff-picker>
          </template>
          <template v-else-if="item.prop === 'status'">
            <el-radio-group v-model="form[item.prop]" @change="$refs.form.clearValidate(item.prop)">
              <el-radio :label="0">启用</el-radio>
              <el-radio :label="1">禁用</el-radio>
            </el-radio-group>
          </template>
          <el-input v-else v-model="form[item.prop]" :disabled="item.disable" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import StaffPicker from '@/components/StaffPicker'
import AdminResource from '@/api/admin'

const adminResource = new AdminResource()
export default {
  components: {
    StaffPicker
  },
  props: {
    roleList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      title: '',
      visible: false,
      form: {},
      formRules: {
        staff: [
          { required: true, trigger: 'blur', message: '请至少选择一名员工' }
        ],
        role_ids: [
          { required: true, trigger: 'blur', message: '请至少选择一个角色' }
        ],
        status: [
          { required: true, trigger: 'blur', message: '请选择状态' }
        ]
      },
      submitLoading: false
    }
  },
  computed: {
    formList() {
      let list = [
        { prop: 'role_ids', label: '角色' },
        { prop: 'password', label: '密码' },
        { prop: 'status', label: '状态' }
      ]
      if (!this.form.id) {
        list.unshift({
          prop: 'staff', label: '人员'
        })
      } else {
        list.unshift({
          prop: 'name', label: '员工', disable: true
        })
      }
      return list
    },
  },
  methods: {
    validatePass(rule, value, callback) {
      if (!this.form.id && (value === '' || value === undefined)) {
        callback(new Error('请输入密码'))
      } else {
        callback()
      }
    },
    add() {
      this.title = '新增管理员'
      this.form = {
        status: 0
      }
      this.formRules.password = [
        { required: true, trigger: 'blur', message: '请输入密码'},
        { validator: this.validatePass, trigger: 'blur', message: '请输入密码' },
        { min: 6, trigger: 'blur', message: '密码长度至少为6' }
      ]
      this.visible = true
    },
    edit(detail) {
      this.title = '编辑管理员'
      this.form = Object.assign({}, detail)
      this.formRules.password = [
        { validator: this.validatePass, trigger: 'blur', message: '请输入密码' },
        { min: 6, trigger: 'blur', message: '密码长度至少为6' }
      ]
      this.visible = true
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            if (this.form.id) {
              await adminResource.update(this.form)
              this.$emit('on-success', 'edit')
            } else {
              this.form.staff_ids = this.form.staff.map(item => item.id)
              await adminResource.create(this.form)
              this.$emit('on-success', 'add')
            }
            this.$message.success(this.$t('table.operation_success'))
            this.handleCancel()
          } finally {
            this.submitLoading = false
          }
        }
      })
    },
    handleCancel() {
      this.visible = false
    }
  }
}
</script>
