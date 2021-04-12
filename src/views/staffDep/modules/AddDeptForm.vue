<template>
  <div>
    <el-dialog
      width="40%"
      :title="title"
      :visible.sync="visible"
      :close-on-click-modal="false"
      :destroy-on-close="true"
      :before-close="handleCancel">
      <el-form ref="form" label-width="15%" label-position="right" :model="form" :rules="formRules">
        <el-form-item :label="$t('contact.name')" prop="name">
          <el-input v-model="form.name" />
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
import DepartmentResource from '@/api/department'

const departmentResource = new DepartmentResource()
export default {
  data() {
    return {
      title: '',
      visible: false,
      form: {},
      formRules: {
        name: [
          { required: true, trigger: 'blur', message: this.$t('contact.please_input_name') }
        ]
      },
      submitLoading: false
    }
  },
  methods: {
    add(parentId) {
      this.form = {
        parent_id: parentId
      }
      this.title = this.$t('contact.add_sub_dept')
      this.visible = true
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            this.$emit('on-success', await departmentResource.create(this.form))
            this.visible = false
          } finally {
            this.submitLoading = false
          }
        }
      })
    },
    handleCancel () {
      this.visible = false
    }
  }
}
</script>