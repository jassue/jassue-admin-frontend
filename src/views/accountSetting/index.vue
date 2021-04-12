<template>
  <div class="common-container">
    <el-tabs class="c-tabs" tab-position="left" @tab-click="resetLeftTabHeight">
      <el-tab-pane v-for="(tab, index) in tabs" :key="index" :label="tab.label">
        <div class="tab-content">
          <div class="tab-title">{{ tab.label }}</div>
          <component :is="tab.component"></component>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: 'AccountSetting',
  data() {
    return {
      tabs: [
        { label: '基本设置', component: () => import('./modules/Base') },
        { label: '安全设置', component: () => import('./modules/Safety') }
      ]
    }
  },
  created() {
    this.resetLeftTabHeight()
  },
  methods: {
    resetLeftTabHeight() {
      this.$nextTick(() => {
        let tabHeight = this.$el.getElementsByClassName('el-tabs__content')[0].clientHeight
        this.$el.getElementsByClassName('el-tabs__header')[0].style.minHeight = 40 * this.tabs.length + 'px'
        this.$el.getElementsByClassName('el-tabs__header')[0].style.height = tabHeight + 'px'
      })
    }
  }
}
</script>
