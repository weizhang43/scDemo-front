<template>
  <el-dialog
    title="申请售后"
    :visible="visible"
    width="480px"
    :close-on-click-modal="false"
    custom-class="aftersale-dialog"
    @close="handleClose"
  >
    <div class="apply-head">
      <i class="el-icon-document apply-icon"></i>
      <span class="apply-order">订单 {{ orderNo || ('#' + oId) }}</span>
      <el-tag size="mini" effect="light">整单退货退款</el-tag>
    </div>
    <div v-if="refundAmount != null" class="apply-amount">
      预计退款金额：<span class="amount-num">¥{{ Number(refundAmount).toFixed(2) }}</span>
    </div>
    <div class="form-label">售后原因</div>
    <el-select v-model="category" placeholder="请选择售后原因" class="category-select">
      <el-option v-for="c in CATEGORIES" :key="c" :label="c" :value="c" />
    </el-select>
    <div class="form-label">问题描述</div>
    <el-input
      v-model="reason"
      type="textarea"
      :rows="4"
      maxlength="480"
      show-word-limit
      placeholder="请补充问题描述（必填），如商品具体问题、期望处理方式等"
    />
    <div class="form-label">凭证图片（选填，最多 {{ IMAGES_MAX }} 张）</div>
    <el-upload
      :key="resetKey"
      action="/product/image/upload"
      list-type="picture-card"
      :headers="uploadHeaders"
      accept="image/png,image/jpeg,image/gif,image/webp"
      :limit="IMAGES_MAX"
      :before-upload="beforeImageUpload"
      :on-success="handleImageSuccess"
      :on-error="handleImageError"
      :on-remove="handleImageRemove"
      :on-exceed="handleImageExceed"
      class="evidence-upload"
    >
      <i class="el-icon-plus"></i>
    </el-upload>
    <div class="form-tip">
      <i class="el-icon-info"></i>提交后由商家审核，同意后退款将原路退回
    </div>
    <span slot="footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" :loading="submitting" :disabled="!canSubmit" @click="handleSubmit">
        提交申请
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { applyAfterSale } from '../api/aftersale';
import { getToken } from '../utils/auth';

const CATEGORIES = ['质量问题', '与描述不符', '发错/漏发', '不想要了', '其他'];
const IMAGES_MAX = 3;
const IMAGE_SIZE_LIMIT_MB = 5;

export default {
  name: 'AfterSaleApplyDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    oId: {
      type: [Number, String],
      default: null
    },
    orderNo: {
      type: String,
      default: ''
    },
    refundAmount: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      CATEGORIES,
      IMAGES_MAX,
      category: '',
      reason: '',
      images: [],
      resetKey: 0,
      submitting: false
    };
  },
  computed: {
    uploadHeaders() {
      const token = getToken();
      return token ? { Authorization: 'Bearer ' + token } : {};
    },
    canSubmit() {
      return !!this.category && !!this.reason.trim();
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.category = '';
        this.reason = '';
        this.images = [];
        this.resetKey += 1;
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    },
    beforeImageUpload(file) {
      if (file.size > IMAGE_SIZE_LIMIT_MB * 1024 * 1024) {
        this.$message.error(`图片大小不能超过 ${IMAGE_SIZE_LIMIT_MB}MB`);
        return false;
      }
      return true;
    },
    handleImageSuccess(res, file, fileList) {
      if (!(res && res.daoResult)) {
        this.$message.error((res && res.msg) || '图片上传失败');
        const idx = fileList.indexOf(file);
        if (idx > -1) fileList.splice(idx, 1);
        return;
      }
      this.syncImages(fileList);
    },
    handleImageError() {
      this.$message.error('图片上传失败，请重试');
    },
    handleImageRemove(file, fileList) {
      this.syncImages(fileList);
    },
    syncImages(fileList) {
      this.images = fileList
        .map(f => f.response && f.response.daoResult)
        .filter(u => !!u);
    },
    handleImageExceed() {
      this.$message.warning(`最多上传 ${IMAGES_MAX} 张凭证图片`);
    },
    handleSubmit() {
      if (!this.canSubmit) return;
      this.submitting = true;
      // 分类拼入 reason 前缀，后端不加列
      const reason = `【${this.category}】${this.reason.trim()}`;
      applyAfterSale({ oId: Number(this.oId), type: 1, reason, images: this.images })
        .then(() => {
          this.$message.success('售后申请已提交，请等待商家审核');
          this.$emit('submitted');
          this.handleClose();
        })
        .catch(() => {})
        .finally(() => {
          this.submitting = false;
        });
    }
  }
};
</script>

<style scoped>
.apply-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.apply-icon {
  color: var(--color-primary);
}
.apply-order {
  font-size: 14px;
  font-weight: 600;
  color: #1f2733;
  font-family: var(--font-mono);
}
.apply-amount {
  font-size: 13px;
  color: #4a5568;
  margin-bottom: 12px;
}
.amount-num {
  color: var(--color-price);
  font-weight: 700;
  font-family: var(--font-mono);
}
.form-label {
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  margin: 12px 0 8px;
}
.category-select {
  width: 100%;
}
.evidence-upload >>> .el-upload--picture-card {
  width: 72px;
  height: 72px;
  line-height: 76px;
}
.evidence-upload >>> .el-upload-list--picture-card .el-upload-list__item {
  width: 72px;
  height: 72px;
}
.form-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 12px;
  color: #8a93a4;
}
.form-tip i {
  color: #b3bac6;
}
</style>

<style>
.aftersale-dialog {
  border-radius: var(--radius-card);
  overflow: hidden;
}
.aftersale-dialog .el-dialog__header {
  padding: 18px 22px;
  border-bottom: 1px solid #eef0f4;
}
.aftersale-dialog .el-dialog__title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2733;
}
.aftersale-dialog .el-dialog__body {
  padding: 18px 22px;
}
</style>
