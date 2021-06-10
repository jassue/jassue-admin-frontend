<template>
  <div>
    <el-row style="padding-top: 12px;">
      <el-col class="left" :span="10">
       <el-form class="form" ref="form" label-position="top" :model="form" :rules="formRules">
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
            <el-input v-model="form[item.prop]" show-password />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submitLoading" @click="handleUpdate">{{ $t('submit') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { setPassword } from '@/api/auth'

export default {
  name: 'Safety',
  data() {
    let checkConfirmPwd = (rule, value, callback) => {
      if (value !== this.form.new_password) {
        return callback(new Error('确认密码与新密码不一致'))
      } else {
        callback()
      }
    }
    return {
      form: {},
      formList: [
        { prop: 'old_password', label: '旧密码' },
        { prop: 'new_password', label: '新密码' },
        { prop: 'confirm_password', label: '确认密码' }
      ],
      formRules: {
        old_password: [
          { required: true, trigger: 'blur', message: '请输入旧密码' }
        ],
        new_password: [
          { required: true, trigger: 'blur', message: '请输入新密码' },
          { min: 6, trigger: 'blur', message: '密码长度至少为6' }
        ],
        confirm_password: [
          { required: true, trigger: 'blur', message: '请输入确认密码' },
          { validator: checkConfirmPwd, trigger: 'blur' }
        ]
      },
      submitLoading: false
    }
  },
  methods: {
    handleUpdate() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            await setPassword(this.form)
            await this.$store.dispatch('user/logout')
            this.$message.warning(this.$t('pwd_change_success'))
            this.$router.push(`/login?redirect=${this.$route.fullPath}`)
          } finally {
            this.submitLoading = false
          }
        }
      })
    }
  }
}
</script>
