<template>
  <div class="app-container" style="min-height:500px">
    <el-row>
      <el-col :span="24" style="color: #303133">{{ $t('user_setting') }}</el-col>
    </el-row>
    <el-divider />
    <el-form ref="form" label-position="right" label-width="15%" :model="form" :rules="formRules">
      <el-form-item :label="$t('login.username')">
        <el-col :span="8"><span>{{ userInfo.username }}</span></el-col>
      </el-form-item>
      <el-form-item :label="$t('nick_name')" prop="name">
        <el-col :span="8"><el-input v-model="form.name" /></el-col>
      </el-form-item>
      <el-form-item :label="$t('old_password')" prop="old_password">
        <el-col :span="8"><el-input v-model="form.old_password" type="password" /></el-col>
      </el-form-item>
      <el-form-item :label="$t('new_password')" prop="password">
        <el-col :span="8"><el-input v-model="form.password" type="password" /></el-col>
        <small class="tips">{{ $t('password_tip') }}</small>
      </el-form-item>
      <el-form-item :label="$t('confirm_password')" prop="confirm_password">
        <el-col :span="8"><el-input v-model="form.confirm_password" type="password" /></el-col>
      </el-form-item>
      <el-form-item>
        <el-col :offset="2"><el-button type="primary" @click="handleUpdate('form')">{{ $t('submit') }}</el-button></el-col>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { updateInfo } from '@/api/auth'

export default {
  name: 'AccountSetting',
  data() {
    var validatePass = (rule, value, callback) => {
      if (value !== this.form.password) {
        callback(this.$t('rule_pass_diff'))
      } else {
        callback()
      }
    }
    var validateOldPass = (rule, value, callback) => {
      if (this.form.password !== '' && this.form.old_password === '') {
        callback(this.$t('rule_old_pass_req'))
      } else {
        callback()
      }
    }
    return {
      form: {
        name: '',
        old_password: '',
        password: '',
        confirm_password: ''
      },
      formRules: {
        name: [
          { required: true, trigger: 'blur', message: this.$t('rule_nick_name_req') },
          { max: 10, trigger: 'blur', message: this.$t('rule_nick_name_len') }
        ],
        old_password: [
          { validator: validateOldPass, trigger: 'blur' },
          { min: 6, trigger: 'blur', message: this.$t('login.rule_pass_len') }
        ],
        password: [
          { min: 6, trigger: 'blur', message: this.$t('login.rule_pass_len') }
        ],
        confirm_password: [
          { validator: validatePass, trigger: 'blur' },
          { min: 6, trigger: 'blur', message: this.$t('login.rule_pass_len') }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  created() {
    this.form.name = this.userInfo.name
  },
  methods: {
    handleUpdate(form) {
      this.$refs[form].validate(async(valid) => {
        if (valid) {
          try {
            const data = await updateInfo(this.form)
            await this.$store.dispatch('user/setInfo', data)
            if (this.form.password !== '') {
              await this.$store.dispatch('user/logout')
              this.$message.warning(this.$t('pwd_change_success'))
              this.$router.push(`/login?redirect=${this.$route.fullPath}`)
            } else {
              this.$message.success(this.$t('update_success'))
            }
          } catch (error) {
            if (error.response.data.error_code === 10001) {
              this.$message.error(this.$t('old_pass_error'))
            } else {
              this.$message.error(error.response.data.message)
            }
          }
        } else {
          console.log('error submit!!')
          return false
        }
      })
    }
  }
}
</script>
