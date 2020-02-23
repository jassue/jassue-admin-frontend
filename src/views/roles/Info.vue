<template>
  <div v-loading="loading" class="app-container">
    <el-page-header :title="$t('back')" :content="$t('route.'+$route.name)" @back="goBack" />
    <el-divider />
    <el-form ref="form" label-position="right" label-width="15%" :model="form" :rules="formRules">
      <el-form-item :label="$t('name')" prop="name">
        <el-col :span="8"><el-input v-model="form.name" /></el-col>
      </el-form-item>
      <el-form-item :label="$t('permission_title')">
        <el-col :span="24">
          <el-tree
            ref="tree"
            :data="permissionList"
            show-checkbox
            node-key="id"
            :props="defaultProps"
            @check="check"
          />
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
import RoleResource from '@/api/role'
const roleResource = new RoleResource()

export default {
  name: 'RoleInfo',
  data() {
    return {
      permissionList: [],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      detail: null,
      loading: true,
      form: {
        name: '',
        permission_ids: []
      },
      formRules: {
        name: [
          { required: true, trigger: 'blur', message: this.$t('rule_name_req') },
          { max: 20, trigger: 'blur', message: this.$t('rule_name_len') }
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
    this.getPermissionList()
    if (!this.isCreate) {
      this.getDetail()
    }
  },
  methods: {
    checkIsCreate() {
      return this.$route.name === 'RoleCreate'
    },
    goBack() {
      this.$router.go(-1)
    },
    async getDetail() {
      try {
        var info = await roleResource.get(this.$route.params.id)
        this.detail = info
        this.form.name = info.name
        this.form.permission_ids = info.permissions
        this.$refs['tree'].setCheckedKeys(this.form.permission_ids)
      } catch (error) {
        if (error.response.data.error_code === 40400) {
          this.$message.error(this.$t('not_found'))
        }
      }
      this.loading = false
    },
    async getPermissionList() {
      const data = await roleResource.getPermissionTree()
      this.permissionList = data.map(item => this.buildTreeNode(item))
      if (this.isCreate) {
        this.form.permission_ids = [1]
        this.$refs['tree'].setCheckedKeys(this.form.permission_ids)
        this.loading = false
      }
    },
    buildTreeNode(item) {
      item.name = this.$t('permission.' + item.name)
      if (item.children !== undefined && item.children.length > 0) {
        item.children.map(child => this.buildTreeNode(child))
      }
      return item
    },
    check(obj, checkObj) {
      this.form.permission_ids = checkObj.checkedKeys
    },
    handleCreateOrUpdate(form) {
      this.$refs[form].validate(async(valid) => {
        if (valid) {
          try {
            if (this.form.permission_ids.length === 0) {
              this.$message.error(this.$t('rule_permission_req'))
              return false
            }
            if (this.isCreate) {
              await roleResource.store(this.form)
            } else {
              await roleResource.update(this.$route.params.id, this.form)
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
