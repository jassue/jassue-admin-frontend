<template>
  <div>
    <el-row style="padding-top: 12px;">
      <el-col :span="16">
       <el-form class="form" ref="form" label-width="160px" label-position="right" :model="form">
         <el-form-item prop="default" required label="默认上传方式">
            <el-radio-group v-model="form.default">
              <el-radio v-for="(driver, index) in drivers" :key="index" :label="driver.label">{{ driver.name }}</el-radio>
            </el-radio-group>
         </el-form-item>
          <el-form-item
            v-for="(item, index) in driverConfig[form.default]"
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
            <template v-if="item.prop === 'is_ssl'">
              <el-radio-group v-model="form.driver[form.default][item.prop]">
                <el-radio :label="true">是</el-radio>
                <el-radio :label="false">否</el-radio>
              </el-radio-group>
            </template>
            <el-input v-else v-model="form.driver[form.default][item.prop]" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :loading="submitLoading" @click="handleUpdate">{{ $t('submit') }}</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'Storage',
  props: {
    detail: {
      type: Object
    }
  },
  data() {
    return {
      form: {},
      drivers: [
        { label: 'public', name: '本地' },
        { label: 'qiniu', name: '七牛云' },
        { label: 'oss', name: '阿里云' },
      ],
      driverConfig: {
        public: [],
        qiniu: [
          { prop: 'bucket', label: '存储空间名称 Bucket' },
          { prop: 'access_key', label: 'ACCESS KEY' },
          { prop: 'secret_key', label: 'SECRET KEY' },
          { prop: 'domain', label: '域名 Domain' },
          { prop: 'is_ssl', label: '开启 HTTPS' }
        ],
        oss: [
          { prop: 'bucket', label: '存储空间名称 Bucket' },
          { prop: 'endpoint', label: '地域域名 Endpoint' },
          { prop: 'access_key_id', label: 'ACCESS KEY ID' },
          { prop: 'access_key_secret', label: 'ACCESS KEY SECRET' },
          { prop: 'is_ssl', label: '开启 HTTPS' }
        ]
      },
      submitLoading: false
    }
  },
  created() {
    this.form = Object.assign({}, this.detail)
  },
  methods: {
    handleUpdate() {
      this.$refs.form.validate(async(valid) => {
        if (valid) {
          this.submitLoading = true
          try {
            this.$emit('on-update', {
              key: 'STORAGE',
              data: this.form
            })
          } finally {
            this.submitLoading = false
          }
        }
      })
    }
  }
}
</script>
