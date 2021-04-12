<template>
  <div class="avatar-cropper">
    <div class="avatar-container">
      <el-avatar v-if="!avatarUrl" class="avatar-none" :style="{'font-size': fontSize+'px'}">{{ emptyText }}</el-avatar>
      <el-avatar v-else class="avatar" :src="avatarUrl"></el-avatar>
      <el-upload
        ref="avatarUpload"
        v-if="showChange"
        class="avatar-uploader"
        :show-file-list="false"
        action=""
        accept=".jpeg,.jpg,.png"
        :http-request="goCropper">
        <i class="el-icon-camera-solid" :style="{'font-size': fontSize+5+'px'}"></i>
      </el-upload>
    </div>
    <el-dialog
      v-if="showChange"
      custom-class="c-dialog"
      title="修改头像"
      :visible.sync="dialogVisible"
      width="440px"
      :destroy-on-close="true"
      :close-on-click-modal="false"
      :before-close="handleClose">
      <div class="tip">请选择 10 M以内的 jpg、jpeg 或 png图片</div>
      <div class="cropper-container"> 
        <vue-cropper ref="cropper" :img="cropperImg" :autoCrop="true" :canMove="false" :fixed="true" :centerBox="true" :autoCropWidth="250" :autoCropHeight="250"></vue-cropper>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="uploadImg">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { VueCropper }  from 'vue-cropper' 
import { imageToBase64 } from '@/utils'
import CommonResource from '@/api/common'

const commonResource = new CommonResource()
export default {
  props: {
    avatarUrl: {
      type: String,
      default: ''
    },
    emptyText: {
      type: String,
      default: ''
    },
    fontSize: {
      type: Number,
      default: 25
    },
    showChange: {
      type: Boolean,
      default: true
    }
  },
  components: { VueCropper },
  data() {
    return {
      cropperImg: '',
      dialogVisible: false
    }
  },
  methods: {
    async goCropper({ file }) {
      this.cropperImg = await imageToBase64(file)
      this.dialogVisible = true
    },
    handleClose() {
      this.dialogVisible = false
    },
    uploadImg() {
      this.$refs.cropper.getCropBlob(async (data) => {
        const result = await commonResource.imageUpload(data, 'avatar')
        this.$emit('update:avatarUrl', result.url)
        this.$emit('on-success', result)
      })
      this.dialogVisible = false
    },
    choseImg() {
      if (this.showChange) {
        this.$refs.avatarUpload.$el.firstChild.click()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.avatar-cropper {
  width: 100%;
  height: 100%;
  .avatar-container {
    position: relative;
    width: 100%;
    height: 100%;
    .avatar-none {
      height: 100%;
      width: 100%;
      display: flex;
      background-color: #409eff;
      justify-content: center;
      align-items: center;
    }
    .avatar {
      height: 100%;
      width: 100%;
      background-color: transparent;
    }
    .avatar-uploader {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 100%;
      background-color: rgba(0,0,0,.4);
      border-radius: 50%;
      display: none;
      text-align: center;
      /deep/ .el-upload {
        display: flex;
        justify-content: center;
        align-items: center;
        .el-icon-camera-solid {
          color: #fff;
        }
      }
    }
    &:hover .avatar-uploader {
      display: block;
    }  
  }
  .tip {
    margin-bottom: 10px;
    color: #91a1b7;
  }
  .cropper-container {
    width: 400px;
    height: 300px;
  }
}
</style>