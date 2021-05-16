<template>
  <div class="common-container">
    <el-tabs v-loading="loading" class="c-tabs" tab-position="left" @tab-click="tabClick">
      <el-tab-pane v-for="(tab, index) in tabs" :key="index" :label="tab.label">
        <div class="tab-content">
          <div class="tab-title">{{ tab.label }}</div>
          <component v-if="!loading" :is="tab.component" :detail="detail" @on-update="update"></component>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import SettingResource from '@/api/setting'

const settingResource = new SettingResource()
export default {
  name: 'SystemSetting',
  data() {
    return {
      loading: true,
      tabs: [
        { name: 'STORAGE', label: '上传设置', component: () => import('./modules/Storage') }
      ],
      detail: {},
    }
  },
  created() {
    this.getDetail(this.tabs[0].name)
  },
  methods: {
    tabClick(tab) {
      this.getDetail(this.tabs[tab.index].name)
    },
    resetLeftTabHeight() {
      this.$nextTick(() => {
        let tabHeight = this.$el.getElementsByClassName('el-tabs__content')[0].clientHeight
        this.$el.getElementsByClassName('el-tabs__header')[0].style.minHeight = 40 * this.tabs.length + 'px'
        this.$el.getElementsByClassName('el-tabs__header')[0].style.height = tabHeight + 'px'
      })
    },
    async getDetail(key) {
      this.loading = true
      this.detail = await settingResource.detail({ key: key })
      this.loading = false
      setTimeout(this.resetLeftTabHeight, 50)
    },
    async update(detail) {
      await settingResource.update(detail)
      this.$message.success(this.$t('table.operation_success'))
    }
  }
}
</script>
