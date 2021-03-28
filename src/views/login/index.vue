<template>
  <div class="login-container">
    <el-form ref="loginForm" :model="loginForm" :rules="loginRules" class="login-form" label-position="left">
      <h2 class="title">
        {{ $t('login.title') }}
      </h2>
      <lang-select v-if="multiLanguage" class="set-language" />
      <el-form-item prop="mobile">
        <span class="svg-container">
          <svg-icon icon-class="user" />
        </span>
        <el-input v-model="loginForm.mobile" size="medium" name="mobile" type="text" auto-complete="on" :placeholder="$t('login.username')" />
      </el-form-item>
      <el-form-item prop="password">
        <span class="svg-container">
          <svg-icon icon-class="password" />
        </span>
        <el-input v-model="loginForm.password" size="medium" name="password" :type="pwdType" auto-complete="on" :placeholder="$t('login.password')" />
        <span class="show-pwd" @click="showPwd">
          <svg-icon :icon-class="showPwdIcon" />
        </span>
      </el-form-item>
      <el-form-item>
        <el-button size="big" type="primary" @click="handleLogin">{{ $t('login.login') }}</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import langSelect from '@/components/LangSelect/'
import { mapGetters } from 'vuex'
export default {
  name: 'Login',
  components: {
    langSelect
  },
  data() {
    return {
      loginForm: {
        mobile: '18888888888',
        password: '123456'
      },
      loginRules: {
        mobile: [
          { required: true, trigger: 'blur', message: this.$i18n.t('login.rule_username_req') },
          { len: 11, trigger: 'blur', message: this.$i18n.t('login.rule_username_len') }
        ],
        password: [
          { required: true, trigger: 'blur', message: this.$i18n.t('login.rule_pass_req') },
          { min: 6, trigger: 'blur', message: this.$i18n.t('login.rule_pass_len') }
        ]
      },
      pwdType: 'password',
      showPwdIcon: 'eye',
      redirect: '',
      otherQuery: {}
    }
  },
  computed: {
    ...mapGetters([
      'addRoutes',
      'multiLanguage'
    ])
  },
  watch: {
    $route: {
      handler: function(route) {
        const query = route.query
        if (query) {
          this.redirect = query.redirect
          this.otherQuery = this.getOtherQuery(query)
        }
      },
      immediate: true
    }
  },
  methods: {
    showPwd() {
      if (this.pwdType === 'password') {
        this.pwdType = ''
        this.showPwdIcon = 'eye-open'
      } else {
        this.pwdType = 'password'
        this.showPwdIcon = 'eye'
      }
    },
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          await this.$store.dispatch('user/login', this.loginForm)
          this.$router.push({ path: this.redirect || '/', query: this.otherQuery })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== 'redirect') {
          acc[cur] = query[cur]
        }
        return acc
      }, {})
    }
  }
}
</script>

<style lang="scss">
    .login-container {
        .el-form-item {
            background-color: #fff;
            border: 1px solid #d9d9d9;
            border-radius: 5px;
            .el-button {
                width: 100%;
            }
        }
        .el-input {
            display: inline-block;
            width: 85%;
            height: 48px;
            input {
                background: transparent;
                border: 0px;
                -webkit-appearance: none;
                border-radius: 0px;
                padding: 12px 5px 12px 15px;
                height: 48px;
                &:-webkit-autofill {
                    -webkit-box-shadow: 0 0 0px 1000px #fff inset !important;
                    -webkit-text-fill-color: #606266 !important;
                }
            }
        }
    }
</style>

<style lang="scss" scoped>
    $bg:#f0f2f5;
    $dark_gray:#889aa4;
    $light_gray:#eee;
    .login-container {
        position: fixed;
        width: 100%;
        height: 100%;
        background-image: url('../../assets/images/login_bg.svg');
        background-size: 100%;
        background-repeat: no-repeat;
        background-position: center 110px;
        background-color: $bg;
        .login-form {
            position: absolute;
            left: 0;
            right: 0;
            width: 520px;
            max-width: 100%;
            padding: 35px 35px 15px 35px;
            margin: 120px auto;
            .title {
                text-align: center;
                margin: 0px auto 40px auto;
            }
            .svg-container {
                padding: 6px 5px 6px 15px;
                color: $dark_gray;
                width: 30px;
                vertical-align: middle;
                display: inline-block;
            }
            .show-pwd {
                position: absolute;
                right: 10px;
                top: 7px;
                font-size: 16px;
                color: $dark_gray;
                cursor: pointer;
                user-select: none;
            }
        }
        .set-language {
            position: absolute;
            top: 40px;
            right: 35px;
            font-size: 1.2em;
        }
    }
</style>
