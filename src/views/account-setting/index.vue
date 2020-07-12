<template>
  <div class="app-container" style="min-height:500px">
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
        <el-input v-model="form[item.prop]" :disabled="item.prop === 'username'" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleUpdate('form')">{{ $t('submit') }}</el-button>
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
      form: {},
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
    formList() {
      return [
        { prop: 'username', label: this.$t('login.username') },
        { prop: 'name', label: this.$t('nick_name') },
        { prop: 'old_password', label: this.$t('old_password') },
        { prop: 'password', label: this.$t('new_password'), tips: '若不修改保留为空' },
        { prop: 'confirm_password', label: this.$t('confirm_password') }
      ]
    },
    ...mapGetters([
      'userInfo'
    ])
  },
  created() {
    this.form.username = this.userInfo.username
    this.form.name = this.userInfo.name
  },
  methods: {
    handleUpdate(form) {
      this.$refs[form].validate(async(valid) => {
        if (valid) {
          const data = await updateInfo(this.form)
          this.$store.dispatch('user/setInfo', data)
          if (this.form.password) {
            await this.$store.dispatch('user/logout')
            this.$message.warning(this.$t('pwd_change_success'))
            this.$router.push(`/login?redirect=${this.$route.fullPath}`)
          } else {
            this.$message.success(this.$t('update_success'))
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

<style lang="scss" scoped>
.form {
  padding: 0 20px;
  width: 40%;
  min-width: 500px;
}
</style>
