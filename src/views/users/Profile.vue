<template>
  <div v-loading="loading" class="app-container">
    <el-page-header :title="$t('back')" :content="$t('route.'+$route.name)" @back="goBack" />
    <el-divider />
    <el-form ref="form" label-position="right" label-width="15%" :model="form" :rules="formRules">
      <el-form-item :label="$t('login.username')" prop="username">
        <el-col :span="8"><el-input v-model="form.username" /></el-col>
      </el-form-item>
      <el-form-item :label="$t('nick_name')" prop="name">
        <el-col :span="8"><el-input v-model="form.name" /></el-col>
      </el-form-item>
      <el-form-item :label="$t('login.password')" prop="password">
        <el-col :span="8"><el-input v-model="form.password" type="text" show-password /></el-col>
        <small v-if="!isCreate" class="tips">{{ $t('password_tip') }}</small>
      </el-form-item>
      <el-form-item :label="$t('role')" prop="role_ids">
        <el-col :span="24">
          <el-checkbox-group v-model="form.role_ids">
            <el-checkbox v-for="item in roleList" :key="item.id" :label="item.id">{{ item.name }}</el-checkbox>
          </el-checkbox-group>
        </el-col>
      </el-form-item>
      <el-form-item :label="$t('status')" prop="status">
        <el-col :span="24">
          <el-switch v-model="form.status" active-color="#13ce66" inactive-color="#ff4949" active-value="0" inactive-value="1" />
        </el-col>
      </el-form-item>
      <el-form-item v-if="!isCreate && detail !== null" :label="$t('create_time')">
        <el-col :span="8"><span>{{ detail.created_at }}</span></el-col>
      </el-form-item>
      <el-form-item>
        <el-col :offset="2"><el-button type="primary" @click="handleCreateOrUpdate('form')">{{ $t('submit') }}</el-button></el-col>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import AdminResource from '@/api/admin'
const adminResource = new AdminResource()

export default {
  name: 'UserProfile',
  data() {
    return {
      roleList: [],
      detail: null,
      loading: true,
      form: {
        name: '',
        username: '',
        password: '',
        role_ids: [],
        status: '0'
      },
      formRules: {
        name: [
          { required: true, trigger: 'blur', message: this.$t('rule_nick_name_req') },
          { max: 10, trigger: 'blur', message: this.$t('rule_nick_name_len') }
        ],
        username: [
          { required: true, trigger: 'blur', message: this.$t('rule_nick_name_req') },
          { max: 16, min: 3, trigger: 'blur', message: this.$t('login.rule_username_len') }
        ],
        password: [
          { required: this.checkIsCreate(), min: 6, trigger: 'blur', message: this.$t('login.rule_pass_len') }
        ],
        role_ids: [
          { required: true, trigger: 'blur', message: this.$t('rule_role_req') }
        ],
        status: [
          { required: true, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    isCreate() {
      return this.checkIsCreate()
    }
  },
  created() {
    this.getRoleList()
    if (!this.isCreate) {
      this.getDetail()
    }
  },
  methods: {
    checkIsCreate() {
      return this.$route.name === 'UserCreate'
    },
    goBack() {
      this.$router.go(-1)
    },
    async getRoleList() {
      this.roleList = await adminResource.getRoleListForCreateOrUpdate()
      if (this.isCreate) {
        this.loading = false
      }
    },
    async getDetail() {
      try {
        var info = await adminResource.get(this.$route.params.id)
        this.detail = info
        this.form.name = info.name
        this.form.username = info.username
        this.form.role_ids = info.roles.map(item => item.id)
        this.form.status = String(info.status)
      } catch (error) {
        if (error.response.data.error_code === 40400) {
          this.$message.error(this.$t('not_found'))
        }
      }
      this.loading = false
    },
    handleCreateOrUpdate(form) {
      this.$refs[form].validate(async(valid) => {
        if (valid) {
          try {
            if (this.isCreate) {
              await adminResource.store(this.form)
            } else {
              await adminResource.update(this.$route.params.id, this.form)
            }
            this.$message.success(this.$t('table.operation_success'))
            this.goBack()
          } catch (error) {
            this.$message.error(error.response.data.message)
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

</style>
