<template>
  <el-select
    :value="value"
    :placeholder="coupons.length ? '选择优惠券' : '暂无可用优惠券'"
    :disabled="disabled || !coupons.length"
    clearable
    size="small"
    class="coupon-select"
    @input="handleInput"
  >
    <el-option
      v-for="c in coupons"
      :key="c.id"
      :label="labelOf(c)"
      :value="c.id"
    >
      <span>{{ c.name }}</span>
      <span class="option-amount">-¥{{ Number(c.couponAmount || 0).toFixed(2) }}</span>
    </el-option>
  </el-select>
</template>

<script>
import { usableCoupons } from '../api/coupon';

/**
 * 结算选券下拉。按 orderAmount 拉取可用券（couponAmount 为服务端算好的抵扣额），
 * 金额变化自动重拉并清空已选，change 事件回传 { couponId, couponAmount } 或 null。
 */
export default {
  name: 'CouponSelect',
  props: {
    orderAmount: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false }
  },
  data() {
    return {
      value: null,
      coupons: []
    };
  },
  watch: {
    orderAmount: {
      immediate: true,
      handler() {
        this.reload();
      }
    }
  },
  methods: {
    reload() {
      if (this.value !== null) {
        this.value = null;
        this.$emit('change', null);
      }
      if (!(this.orderAmount > 0)) {
        this.coupons = [];
        return;
      }
      usableCoupons(this.orderAmount.toFixed(2))
        .then(res => { this.coupons = res.dataList || []; })
        .catch(() => { this.coupons = []; });
    },
    handleInput(val) {
      this.value = val || null;
      if (!this.value) {
        this.$emit('change', null);
        return;
      }
      const c = this.coupons.find(x => x.id === this.value);
      this.$emit('change', c ? { couponId: c.id, couponAmount: Number(c.couponAmount || 0) } : null);
    },
    labelOf(c) {
      return `${c.name}（-¥${Number(c.couponAmount || 0).toFixed(2)}）`;
    }
  }
};
</script>

<style scoped>
.coupon-select { min-width: 220px; }
.option-amount { float: right; color: var(--color-price); font-weight: 600; }
</style>
