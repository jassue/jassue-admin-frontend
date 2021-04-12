<template>
  <div>
    <div class="dept-picker-container" @click="showDialog">
      <slot>
        <ul class="panel-container" :class="{'empty-list': staff.length === 0}">
          <div class="empty-text" v-if="staff.length === 0"><i class="el-icon-plus" />请选择人员</div>
          <template v-else>
            <li v-for="(item, index) in staff" :key="index" class="select-item">
              <svg-icon icon-class="tree" />{{item.name}}
            </li>
          </template>
        </ul>
      </slot>
    </div>
    <el-dialog
      custom-class="c-dialog"
      title="成员列表"
      width="648px"
      top="20px"
      :visible.sync="dialog"
      :destroy-on-close="true"
      :append-to-body="isAppendToBody"
      :before-close="dialogClose">
      <ul class="panel-container">
        <li v-for="(item, index) in checkedStaff" :key="index" class="select-item">
          <svg-icon icon-class="user" />{{item.name}}<i class="el-icon-close item-del" @click="itemDelete(index)"></i>
        </li>
      </ul>
      <div class="dept-container">
        <div class="header">
          <div class="tabs">
            <div class="tab active">成员</div>
          </div>
          <div class="search-container">
            <el-input class="search" :placeholder="$t('table.search')" prefix-icon="el-icon-search" v-model="query.keyword" @input="getStaffList" />
          </div>
        </div>
        <el-row>
          <el-col :span="12">
            <div class="dept-tree">
              <el-tree
                v-loading="treeLoading"
                ref="deptPickerTree"
                :highlight-current="true"
                :data="deptList"
                :props="deptProps"
                node-key="id"
                :expand-on-click-node="false"
                :default-expanded-keys="defaultExpandedKeys"
                empty-text=""
                @node-click="deptClick">
                <span class="custom-tree-node" slot-scope="{node, data}">
                  <span><svg-icon v-if="data.id > 0" icon-class="tree" class="tree-icon" />{{node.label}}</span>
                </span>
              </el-tree>
            </div>
          </el-col>
          <el-col :span="12">
            <div class="staff-container" v-loading="listLoading">
              <div class="checked-all">
                <span>已选 {{ pageCheckedNum }}/{{ staffList.length }} </span>
                <div v-if="staffList.length > 0" style="float: right">
                  <el-checkbox :indeterminate="false" v-model="checkAll" @change="handleCheckAllChange"></el-checkbox>
                </div>
              </div>
              <div class="staff">
                <el-checkbox-group v-model="checkedStaffIds" @change="handleCheckedStaffChange">
                  <el-checkbox v-for="(staff, index) in staffList" :label="staff.id" :key="index" @change="value => { checked(value, staff.id) }">
                    <svg-icon class="user-icon" icon-class="user" />{{ staff.name }}
                  </el-checkbox>
                </el-checkbox-group>
                <pagination v-show="total > 0" :total="total" :page.sync="query.page" :limit.sync="query.size" layout="prev, next" @pagination="getStaffList" />
              </div>
            </div>
          </el-col>
        </el-row>
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
import Pagination from '@/components/Pagination'
const widgetResource = new WidgetResource()
export default {
  name: 'StaffPicker',
  components: { Pagination },
  props: {
    staff: {
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
      listLoading: true,
      deptList: [],
      deptProps: { children: 'children', 'label': 'name' },
      defaultExpandedKeys: [],
      staffList: [],
      query: {
        department_id: '',
        keyword: '',
        page: 1,
        size: 10
      },
      total: 0,
      pageCheckedNum: 0,
      checkedStaffIds: [],
      checkedStaff: [],
      checkAll: false
    }
  },
  methods: {
    async showDialog() {
      this.dialog = true
      this.pageCheckedNum = 0
      this.filterText = ''
      this.checkedStaff = JSON.parse(JSON.stringify(this.staff))
      this.checkedStaffIds = this.checkedStaff.map(item => item.id)
      this.getDeptList()
    },
    async getDeptList() {
      const data = await widgetResource.listDept({is_tree: 1})
      this.defaultExpandedKeys = data.map(item => item.id)
      data.unshift({ id: '', name: '全部成员' })
      this.deptList = data
      this.treeLoading = false
      this.$nextTick(() => {
        this.$refs.deptPickerTree.$el.firstChild.click()
      })
    },
    async getStaffList() {
      this.listLoading = true
      const { data, total } = await widgetResource.listStaff(this.query)
      this.staffList = data
      this.total = total
      this.listLoading = false
      this.handleCheckedStaffChange()
    },
    async deptClick(data) {
      this.query.department_id = data.id
      this.query.page = 1
      this.getStaffList()
    },
    handleCheckAllChange(val) {
      let needOpIds = this.staffList.map(item => item.id).filter(id => {
          return val ? !this.checkedStaffIds.includes(id) : this.checkedStaffIds.includes(id)
        })
      if (val) {
        this.checkedStaffIds = this.checkedStaffIds.concat(needOpIds)
        this.checkedStaff = this.checkedStaff.concat(this.staffList.filter(item => needOpIds.includes(item.id)))
      } else {
        this.checkedStaffIds = this.checkedStaffIds.filter(id => !needOpIds.includes(id))
        this.checkedStaff = this.checkedStaff.filter(item => !needOpIds.includes(item.id))
      }
      this.handleCheckedStaffChange()
    },
    handleCheckedStaffChange() {
      let hasNotExists = true
      let num = 0
      this.staffList.forEach(item => {
        let exists = this.checkedStaffIds.includes(item.id)
        if (!exists) {
          hasNotExists = false
        } else {
          num++
        }
      })
      this.checkAll = hasNotExists
      this.pageCheckedNum = num
    },
    checked(value, id) {
      if (value) {
        let index = this.staffList.findIndex(item => item.id === id)
        this.checkedStaff.push(this.staffList[index])
      } else {
        let index = this.checkedStaff.findIndex(item => item.id === id)
        this.checkedStaff.splice(index, 1)
      }
    },
    itemDelete(index) {
      let id = this.checkedStaff[index].id
      this.checkedStaff.splice(index, 1)
      this.checkedStaffIds.splice(this.checkedStaffIds.findIndex(item => item === id), 1)
      this.handleCheckedStaffChange()
    },
    save() {
      this.$emit('update:staff', this.checkedStaff)
      this.$emit('save', this.checkedStaff)
      this.listLoading = true
      this.treeLoading = true
      this.dialog = false
    },
    dialogClose() {
      this.listLoading = true
      this.treeLoading = true
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
    height: 348px;
    border-right: 1px solid #d9d9d9;
    @include cElTree(#409eff, #f0f7ff, transparent, 0);
    .el-tree /deep/ {
      .el-tree-node.is-current > .el-tree-node__content {
        &:hover {
          background-color: #f0f7ff;
        }
      }
      .el-checkbox {
        position: absolute;
        right: 0;
      }
      .el-tree-node > .el-tree-node__content {
        margin-bottom: 3px;
        padding-bottom: 3px;
        padding-top: 3px;
      }
    }
  }
  .staff-container {
    height: 348px;
    .checked-all {
      padding: 0 10px;
      line-height: 26px;
      border-bottom: 1px solid #d9d9d9;
    }
    .staff {
      .el-checkbox {
        display: block;
        font-weight: unset;
        line-height: 28px;
        padding: 0 10px;
        margin-right: 0px;
        position: relative;
        &:hover {
          background-color: #f0f7ff;
        }
        /deep/ .el-checkbox__input {
          position: absolute;
          top: 0;
          right: 10px;
          line-height: 28px;
          &.is-checked + .el-checkbox__label {
            color: #606266;
          }
        }
        .user-icon {
          color: #409eff;
          font-size: 12px;
          margin-right: 5px;
        }
      }
      .pagination-container /deep/ {
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 0;
        text-align: right;
        line-height: 20px;
        .el-pagination {
          padding: 6px 0 0;
        }
        .btn-prev,.btn-next {
          background-color: transparent !important;
        }
      }
    }
  }
}
</style>
