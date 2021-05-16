<template>
  <div class="table-operator">
    <el-form ref="form" :inline="true" :model="searchForm">
      <el-form-item
        v-for="(item, index) in searchFormList"
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
        <template v-if="item.type === 'date-range'">
          <el-date-picker
            v-model="searchForm[item.prop]"
            type="daterange"
            range-separator="-"
            value-format="yyyy-MM-dd"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
          </el-date-picker>
        </template>
        <el-input v-else v-model="searchForm[item.prop]" placeholder="请输入" clearable />
      </el-form-item>
      <el-button type="primary" icon="el-icon-search" @click="search">搜索</el-button>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'SearchForm',
  props: {
    searchForm: {
      type: Object
    },
    searchFormList: {
      type: Array
    }
  },
  methods: {
    search() {
      this.$emit('search', this.searchForm)
    }
  }
}
</script>
