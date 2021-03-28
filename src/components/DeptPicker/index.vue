<template>
  <div>
    <div class="dept-picker-container" @click="showDialog">
      <slot>
        <ul class="panel-container" :class="{'empty-list': depts.length === 0}">
          <div class="empty-text" v-if="depts.length === 0"><i class="el-icon-plus" />{{$t('widget.please_checked_dept')}}</div>
          <template v-else>
            <li v-for="(item, index) in depts" :key="index" class="select-item">
              <svg-icon icon-class="tree" />{{item.name}}
            </li>
          </template>
        </ul>
      </slot>
    </div>
    <el-dialog custom-class="c-dialog" :title="$t('widget.dept_list')" :visible.sync="dialog" :destroy-on-close="true" width="648px" :append-to-body="isAppendToBody" top="20px" :before-close="dialogClose">
      <ul class="panel-container">
        <li v-for="(item, index) in checkedDepts" :key="index" class="select-item">
          <svg-icon icon-class="tree" />{{item.name}}<i class="el-icon-close item-del" @click="itemDelete(index)"></i>
        </li>
      </ul>
      <div class="dept-container">
        <div class="header">
          <div class="tabs">
            <div class="tab active">{{$t('widget.dept_title')}}</div>
          </div>
          <div class="search-container">
            <el-input class="search" :placeholder="$t('table.search')" prefix-icon="el-icon-search" v-model="filterText" />
          </div>
        </div>
        <div class="dept-tree">
          <el-tree
            v-loading="treeLoading"
            show-checkbox
            check-strictly
            ref="deptPickerTree"
            :data="deptList"
            :props="deptProps"
            node-key="id"
            :expand-on-click-node="false"
            :default-expanded-keys="defaultExpandedKeys"
            empty-text=""
            @node-click="deptClick"
            :filter-node-method="filterNode"
            @check="deptCheck">
            <span class="custom-tree-node" slot-scope="{node}">
              <span><svg-icon icon-class="tree" class="tree-icon" />{{node.label}}</span>
            </span>
          </el-tree>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogClose">{{$t('table.cancel')}}</el-button>
        <el-button type="primary" @click="save">{{$t('table.confirm')}}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import WidgetResource from '@/api/widget'
const widgetResource = new WidgetResource()
export default {
  props: {
    depts: {
      type: Array,
      default: () => []
    },
    isAppendToBody: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      dialog: false,
      treeLoading: true,
      deptList: [],
      deptProps: { children: 'children', 'label': 'name' },
      defaultExpandedKeys: [],
      filterText: '',
      checkedDepts: []
    }
  },
  watch: {
    filterText(val) {
      this.$nextTick(() => {
        this.$refs.deptPickerTree.filter(val)
      })
    }
  },
  methods: {
    async showDialog() {
      this.dialog = true
      this.filterText = ''
      this.checkedDepts = JSON.parse(JSON.stringify(this.depts))
      this.getDeptList()
      this.$nextTick(() => {
        this.$refs.deptPickerTree.setCheckedKeys(this.checkedDepts.map(item => item.id))
      })
    },
    async getDeptList() {
      const data = await widgetResource.listDept({is_tree: 1})
      this.treeLoading = false
      this.defaultExpandedKeys = data.map(item => item.id)
      this.deptList = data
    },
    deptClick(data, node) {
      this.$refs.deptPickerTree.setChecked(data, !node.checked)
      if (node.checked) {
        this.checkedDepts.push(data)
      } else {
        const index = this.checkedDepts.findIndex(item => item.id === data.id)
        this.checkedDepts.splice(index, 1)
      }
    },
    filterNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1;
    },
    deptCheck(data, checkedInfo) {
      if (checkedInfo.checkedKeys.indexOf(data.id) > -1) {
        this.checkedDepts.push(data)
      } else {
        const index = this.checkedDepts.findIndex(item => item.id === data.id)
        this.checkedDepts.splice(index, 1)
      }
    },
    itemDelete(index) {
      this.$refs.deptPickerTree.setChecked(this.checkedDepts[index].id, false)
      this.checkedDepts.splice(index, 1)
    },
    save() {
      this.$emit('update:depts', this.checkedDepts)
      this.$emit('save', this.checkedDepts)
      this.dialog = false
    },
    dialogClose() {
      this.$refs.deptPickerTree.setCheckedKeys(this.depts.map(item => item.id), true)
      this.dialog = false
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/mixin.scss';

.panel-container {
  margin: 0;
  padding: 2px;
  display: flex;
  width: 100%;
  border: 1px dashed #d9d9d9;
  cursor: pointer;
  min-height: 72px;
  align-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  overflow: auto;
  &.empty-list {
    align-content: center;
    align-items: center;
    justify-content: center;
  }
  .empty-text {
    color: #409EFF;
  }
  .select-item {
    display: flex;
    margin: 3px;
    padding: 5px 10px;
    background: #f3f6fc;
    border-radius: 1px;
    height: 30px;
    line-height: 20px;
    .svg-icon {
      height: 20px;
      margin-right: 5px;
      color: #409EFF;
    }
    .item-del {
      line-height: 20px;
      margin-left: 5px;
      &:hover {
        background-color: #fff;
      }
    }
  }
}
.dept-container {
  @include cTab(60px);
  margin-top: 10px;
  min-height: 378px;
  border: 1px solid #d9d9d9;
  .header {
    position: relative;
    height: 40px;
    border-bottom: 1px solid #d9d9d9;
    padding-left: 20px;
    .search-container {
      position: absolute;
      width: 114px;
      right: 0;
      top: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      align-content: center;
      height: 100%;
      margin-right: 10px;
      .search /deep/ {
        .el-input__inner {
          height: 26px;
          line-height: 26px;
          border-radius: 13px;
          background-color: #f4f4f4;
          border: none;
        }
        .el-input__icon {
          line-height: 26px;
        }
      }
    }
  }
  .dept-tree {
    margin-top: 3px;
    @include cElTree(#409eff, #ebf5ff, transparent, 0);
    .el-tree /deep/ {
      .el-tree-node.is-current > .el-tree-node__content {
        background-color: transparent;
        &:hover {
          background-color: #ebf5ff;
        }
      }
      .el-checkbox {
        position: absolute;
        right: 0;
      }
      .el-tree-node > .el-tree-node__content {
        margin-bottom: 0;
        padding-bottom: 3px;
        padding-top: 3px;
      }
    }
  }
}
</style>