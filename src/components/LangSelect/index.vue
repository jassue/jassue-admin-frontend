<template>
  <el-dropdown trigger="click" @command="handleSetLanguage">
    <div class="el-dropdown-link">
      <svg-icon icon-class="earth" />
    </div>
    <el-dropdown-menu slot="dropdown">
      <el-dropdown-item :disabled="language === 'en'" command="en">English</el-dropdown-item>
      <el-dropdown-item :disabled="language === 'zh'" command="zh">中文</el-dropdown-item>
    </el-dropdown-menu>
  </el-dropdown>
</template>

<script>
export default {
  name: 'LangSelect',
  computed: {
    language() {
      return this.$store.getters.language
    }
  },
  methods: {
    handleSetLanguage(language) {
      this.$i18n.locale = language
      this.$store.dispatch('app/setLanguage', language)
      window.location.reload()
      // this.$message({
      //   message: this.$i18n.t('lang.set_lang_success'),
      //   type: 'success'
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
