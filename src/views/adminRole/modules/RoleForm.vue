<template>
  <div>
    <el-dialog
      top="30px"
      width="60%"
      :title="title"
      :visible.sync="visible"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :before-close="handleCancel">
      <el-form
        ref="form"
        label-width="10%"
        label-position="right"
        :model="form"
        :rules="formRules">
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" />
        </el-form-item>
        <el-form-item label="权限" prop="permission_ids">
          <el-tree
            class="p-tree"
            ref="permissionTree"
            :data="permissionList"
            show-checkbox
            node-key="id"
            :expand-on-click-node="false"
            :check-on-click-node="true"
            :default-expand-all="true"
            :default-checked-keys="form.permission_ids"
            :props="{ children: 'children', label: 'name' }"
            @check="pTreeNodeCheck">
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span :class="{'is-children': data.children === undefined}">{{ node.label }}</span>
            </span>
          </el-tree>
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
import RoleResource from '@/api/role'

const roleResource = new RoleResource()
export default {
  props: {
    permissionList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      title: '',
      visible: false,
      form: {
        name: '',
        permission_ids: []
      },
      formRules: {
        name: [
          { required: true, trigger: 'blur', message: '请输入角色名称' }
        ],
        permission_ids: [
          { required: true, trigger: 'blur', message: '请至少选择一个权限' }
        ],
      },
      submitLoading: false
    }
  },
  methods: {
    add() {
      this.title = '新增角色'
      this.visible = true
      this.treeStyleAdjustment()
    },
    edit(detail) {
      this.title = '编辑角色'
      this.form = Object.assign({}, detail)
      this.visible = true
      this.treeStyleAdjustment()
    },
    treeStyleAdjustment() {
      this.$nextTick(() => {
        this.$refs.permissionTree.$el.querySelectorAll('.custom-tree-node .is-children').forEach(node => {
          node.parentNode.parentNode.parentNode.style = 'display: inline-block;margin-right: 10px;'
        })
      })
    },
    pTreeNodeCheck() {
      this.form.permission_ids = this.$refs.permissionTree.getCheckedKeys()
      if (this.form.permission_ids.length > 0) {
        this.$refs.form.clearValidate('permission_ids')
      }
    },
    handleSubmit() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            if (this.form.id) {
              await roleResource.update(this.form)
              this.$emit('on-success', 'edit', this.form)
            } else {
              this.$emit('on-success', 'add', await roleResource.create(this.form))
            }
            this.handleCancel()
          } finally {
            this.submitLoading = false
          }
        }
      })
    },
    handleCancel() {
      this.form = { name: '', permission_ids: [] }
      this.$refs.permissionTree.setCheckedKeys([])
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
