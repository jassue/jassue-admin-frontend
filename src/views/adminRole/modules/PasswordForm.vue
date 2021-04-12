<template>
  <div>
    <el-dialog
      width="40%"
      :title="title"
      :visible.sync="visible"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :before-close="handleCancel">
      <el-form
        label-width="20%"
        ref="form"
        :model="form"
        :rules="formRules">
        <el-form-item label="新密码" prop="password">
          <el-input v-model="form.password" type="password" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="handleCancel">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import AdminResource from '@/api/admin'

const adminResource = new AdminResource()
export default {
  data() {
    return {
      title: '',
      visible: false,
      form: {},
      formRules: {
        password: [
          { required: true, trigger: 'blur', message: '请输入密码' },
          { min: 6, trigger: 'blur', message: '密码长度最少为6个字符' }
        ]
      },
      submitLoading: false
    }
  },
  methods: {
    show(ids) {
      this.title = '重置密码'
      this.form = {
        ids: ids
      }
      this.visible = true
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            await adminResource.resetPassword(this.form)
            this.$emit('on-success')
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

<style lang="scss" scoped>
.p-tree.el-tree /deep/ {
  .el-tree-node {
    white-space: unset;
  }
  .el-tree-node__expand-icon {
    display: none;
  }
}
</style>
