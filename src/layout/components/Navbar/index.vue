<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />
    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />
    <div class="right-menu">
      <template v-if="device !== 'mobile'">
        <screenfull id="screenfull" class="right-menu-item hover-effect" />
        <lang-select v-if="multiLanguage" class="right-menu-item hover-effect" />
      </template>
      <el-dropdown class="right-menu-item hover-effect userinfo-container">
        <div class="el-dropdown-link">
          <!-- <img src="@/assets/logo.png" class="user-avatar"> -->
          <div class="user-avatar" style="display:inline-block;">
            <avatar-cropper :avatar-url="userInfo.avatar_url" :font-size="12" :empty-text="userInfo.name.substring(0,1)" :show-change="false"></avatar-cropper>
          </div>
          <span v-if="device !== 'mobile'">{{ userInfo.name }}</span>
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/account/settings">
            <el-dropdown-item>
              {{ $t('user_setting') }}
            </el-dropdown-item>
          </router-link>
          <div @click="logout">
            <el-dropdown-item divided>
              {{ $t('logout') }}
            </el-dropdown-item>
          </div>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Hamburger from '@/components/Hamburger'
import Breadcrumb from '@/components/Breadcrumb'
import Screenfull from '@/components/Screenfull'
import LangSelect from '@/components/LangSelect'
import AvatarCropper from '@/components/AvatarCropper'

export default {
  name: 'Navbar',
  components: { Hamburger, Breadcrumb, Screenfull, LangSelect, AvatarCropper },
  computed: {
    ...mapGetters([
      'sidebar',
      'userInfo',
      'device',
      'multiLanguage'
    ])
  },
  methods: {
    toggleSideBar() {
      this.$store.dispatch('app/toggleSidebar')
    },
    async logout() {
      await this.$store.dispatch('user/logout')
      this.$router.push(`/login?redirect=${this.$route.fullPath}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .userinfo-container {
        .el-dropdown-link {
        padding: 0 5px;
        font-size: 14px;

        .user-avatar {
          width: 30px;
          height: 30px;
          vertical-align: middle;
          margin-right: 5px;
        }
      }
    }
  }
}
</style>
