<template>
  <div class="sidebar-logo-container" :class="{'collapse':collapse}">
    <router-link class="sidebar-logo-link" to="/">
      <img class="sidebar-logo" src="@/assets/logo.png">
      <h1 v-if="!collapse" class="sidebar-title">{{ title }}</h1>
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'SidebarLogo',
  props: {
    collapse: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      title: 'Laravel Vue Admin'
    }
  }
}
</script>

<style lang="scss" scoped>
@import '~@/styles/variables.scss';

.sidebar-logo-container {
  position: relative;
  width: 100%;
  max-width: $sideBarWidth;
  height: 64px;
  line-height: 64px;
  background: $menuBg;
  overflow: hidden;
  text-align: center;

  & .sidebar-logo-link {
    height: 100%;
    width: 100%;
    overflow: hidden;
    & .sidebar-logo {
      width: 32px;
      height: 32px;
      vertical-align: middle;
    }
    & .sidebar-title {
      display: inline-block;
      margin: 0;
      color: #fff;
      font-weight: 600;
      line-height: 64px;
      font-size: 14px;
      overflow: hidden;
      height: 64px;
      font-family: Avenir, Helvetica Neue, Arial, Helvetica, sans-serif;
      vertical-align: middle;
      text-indent: 12px;
    }
  }
}
</style>
