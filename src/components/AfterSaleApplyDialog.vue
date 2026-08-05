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
    <el-input
      v-model="reason"
      type="textarea"
      :rows="4"
      maxlength="500"
      show-word-limit
      placeholder="请填写申请原因（必填），如：商品质量问题、与描述不符等"
    />
    <div class="form-tip">
      <i class="el-icon-info"></i>提交后由商家审核，同意后退款将原路退回
    </div>
    <span slot="footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" :loading="submitting" :disabled="!reason.trim()" @click="handleSubmit">
        提交申请
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { applyAfterSale } from '../api/aftersale';

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
      reason: '',
      submitting: false
    };
  },
  watch: {
    visible(val) {
      if (val) this.reason = '';
    }
  },
  methods: {
    handleClose() {
      this.$emit('update:visible', false);
    },
    handleSubmit() {
      if (!this.reason.trim()) return;
      this.submitting = true;
      applyAfterSale({ oId: Number(this.oId), type: 1, reason: this.reason.trim() })
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
  color: #667eea;
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
  border-radius: 14px;
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
