<template>
  <div>
    <el-row class="base-view">
      <el-form class="form" ref="form" label-position="top" :model="form" :rules="formRules">
        <el-col class="left" :span="10">
          <el-form-item
            v-for="(item, index) in formList"
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
            <template v-if="item.prop === 'gender'">
              <el-radio-group v-model="form[item.prop]" @change="$refs.form.clearValidate(item.prop)">
                <el-radio :label="1">男</el-radio>
                <el-radio :label="2">女</el-radio>
              </el-radio-group>
            </template>
            <el-input v-else v-model="form[item.prop]" :disabled="item.disabled" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleUpdate">{{ $t('submit') }}</el-button>
          </el-form-item>
        </el-col>
        <el-col class="right" :span="14">
          <el-form-item label="头像">
            <div class="avatar-container">
              <avatar-cropper ref="avatarCropper" :avatar-url.sync="form.avatar_url" empty-text="无" :font-size="60" @on-success="uploadSuccess"></avatar-cropper>
            </div>
            <div class="change-btn-container">
              <el-button @click="changeAvatar">更换头像</el-button>
            </div>
          </el-form-item>
        </el-col>
      </el-form>
    </el-row>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AvatarCropper from '@/components/AvatarCropper'
import StaffResource from '@/api/staff'

const staffResource = new StaffResource()
export default {
  name: 'Base',
  components: { AvatarCropper },
  data() {
    let checkGender = (rule, value, callback) => {
      if (!value) {
        return callback(new Error(this.$t('contact.please_checked_gender')))
      } else {
        callback()
      }
    }
    return {
      form: {},
      formList: [
        { prop: 'name', label: '姓名' },
        { prop: 'mobile', label: '手机号' },
        { prop: 'email', label: '邮箱' },
        { prop: 'gender', label: '性别' },
        { prop: 'position', label: '职位', disabled: true },
        { prop: 'job_number', label: '工号', disabled: true }
      ],
      formRules: {
        name: [
          { required: true, trigger: 'blur', message: '请输入姓名' }
        ],
        mobile: [
          { required: true, trigger: 'blur', message: '请输入手机号' }
        ],
        gender: [
          { validator: checkGender, trigger: 'blur' }
        ]
      }
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  created() {
    this.form = Object.assign({}, this.userInfo)
  },
  methods: {
    changeAvatar() {
      this.$refs.avatarCropper.choseImg()
    },
    uploadSuccess(result) {
      this.form.avatar_id = result.id
    },
    handleUpdate() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.$store.dispatch('user/setInfo', await staffResource.updatePersonalInfo(this.form))
          this.$notify.success({
            title: '成功',
            message: '修改成功',
            duration: 2500
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.base-view {
  padding-top: 12px;
  .right {
    padding-left: 104px;
    .avatar-container {
      width: 144px;
      height: 144px;
      margin-bottom: 10px;
    }
    .change-btn-container {
      width: 144px;
      text-align: center;
    }
  }
}
</style>