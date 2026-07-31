<template>
  <div class="order-pay">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">订单支付</span>
          <span v-if="order" class="header-meta">订单 {{ order.orderNo || '#' + order.oid }}</span>
        </div>
        <div class="header-actions">
          <el-button v-if="order" type="text" icon="el-icon-document" @click="goDetail">订单详情</el-button>
          <el-button type="text" icon="el-icon-back" @click="goOrders">返回订单列表</el-button>
        </div>
      </div>

      <div v-if="order" class="detail-body">
        <div class="detail-hero">
          <div class="hero-icon">
            <i class="el-icon-wallet"></i>
          </div>
          <div class="hero-info">
            <div class="hero-amount">应付金额 ¥ {{ formatAmount(order.orderAmount) }}</div>
            <div class="hero-sub">
              <el-tag :type="statusTagType(order.orderStatus)" size="small" effect="light">
                {{ statusText(order.orderStatus) }}
              </el-tag>
              <span v-if="isPending && expireTime" class="countdown" :class="{ expired: remainMs <= 0 }">
                <i :class="remainMs <= 0 ? 'el-icon-warning' : 'el-icon-alarm-clock'"></i>
                {{ remainMs <= 0 ? '支付已超时' : '剩余支付时间 ' + countdownText }}
              </span>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border class="detail-desc">
          <el-descriptions-item label="订单编号">
            <span class="desc-no">{{ order.orderNo || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="订单ID">
            <span class="desc-id">#{{ order.oid }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="下单人">
            <i class="el-icon-user-solid desc-icon"></i>{{ order.addPerson || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusTagType(order.orderStatus)" size="small" effect="light">
              {{ statusText(order.orderStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间" :span="2">
            <i class="el-icon-time desc-icon"></i>{{ formatTime(order.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            <i class="el-icon-location-outline desc-icon"></i>{{ order.orderAddress || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单金额" :span="2">
            <i class="el-icon-wallet desc-icon"></i>
            <span class="desc-amount">¥{{ formatAmount(order.orderAmount) }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="isPending" class="pay-block">
          <div class="block-title">选择支付方式</div>
          <el-radio-group v-model="payMethod" class="pay-methods">
            <el-radio v-for="m in payMethods" :key="m.value" :label="m.value" class="pay-method">
              <i :class="m.icon" :style="{ color: m.color }"></i>{{ m.label }}
            </el-radio>
          </el-radio-group>
          <div class="pay-actions">
            <el-button
              type="primary"
              icon="el-icon-wallet"
              :loading="paying"
              :disabled="!canPay"
              @click="handlePay"
            >确认支付 ¥ {{ formatAmount(order.orderAmount) }}</el-button>
            <el-button type="text" class="btn-danger" @click="handleCancel">取消订单</el-button>
            <span class="form-tip">支付方式仅作演示，实际扣款未接入</span>
          </div>
        </div>

        <div v-else class="pay-result">
          <i class="result-icon" :class="resultInfo.icon" :style="{ color: resultInfo.color }"></i>
          <div class="result-text">{{ resultInfo.text }}</div>
          <el-button type="primary" @click="resultInfo.action">{{ resultInfo.actionText }}</el-button>
        </div>
      </div>

      <el-empty v-else-if="!loading" description="未找到订单信息" />
    </el-card>
  </div>
</template>

<script>
import { getOrderById, updateOrderStatus } from '../../api/order';
import { getMyTimeoutOrders } from '../../api/home';

const STATUS_MAP = {
  '-1': { label: '已取消', type: 'info' },
  '0': { label: '待支付', type: 'warning' },
  '1': { label: '待签收', type: 'primary' },
  '2': { label: '已完成', type: 'success' }
};

const PAY_METHODS = [
  { value: 'alipay', label: '支付宝', icon: 'el-icon-wallet', color: '#1677ff' },
  { value: 'wechat', label: '微信支付', icon: 'el-icon-chat-dot-round', color: '#07c160' },
  { value: 'bank', label: '银行卡', icon: 'el-icon-bank-card', color: '#764ba2' }
];

export default {
  name: 'OrderPay',
  data() {
    return {
      order: null,
      payMethods: PAY_METHODS,
      payMethod: 'alipay',
      expireTime: null,
      now: Date.now(),
      timer: null,
      loading: false,
      paying: false
    };
  },
  computed: {
    isPending() {
      return !!this.order && Number(this.order.orderStatus) === 0;
    },
    canPay() {
      return this.isPending && !this.paying;
    },
    /** 后端 @JsonFormat 出来的是 '2026-07-31 10:00:00'，部分浏览器直接 new Date() 会得到 Invalid Date */
    remainMs() {
      if (!this.expireTime) return 0;
      const ts = new Date(String(this.expireTime).replace(/-/g, '/')).getTime();
      if (isNaN(ts)) return 0;
      return ts - this.now;
    },
    countdownText() {
      const total = Math.floor(Math.max(this.remainMs, 0) / 1000);
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      const p = v => (v < 10 ? '0' + v : v);
      return `${p(h)}:${p(m)}:${p(s)}`;
    },
    resultInfo() {
      const status = Number(this.order && this.order.orderStatus);
      if (status === 1) {
        return {
          icon: 'el-icon-success',
          color: '#67c23a',
          text: '该订单已支付，等待发货',
          actionText: '查看我的订单',
          action: this.goOrders
        };
      }
      if (status === 2) {
        return {
          icon: 'el-icon-success',
          color: '#67c23a',
          text: '该订单已完成',
          actionText: '查看我的订单',
          action: this.goOrders
        };
      }
      return {
        icon: 'el-icon-circle-close',
        color: '#909399',
        text: '该订单已取消（待支付订单超时会被自动取消）',
        actionText: '重新选购',
        action: this.goGallery
      };
    }
  },
  created() {
    this.fetchOrder();
    this.fetchExpire();
    this.timer = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    fetchOrder() {
      const id = this.$route.params.id;
      if (!id) return;
      this.loading = true;
      // GET /order/{id} 返回裸 Order，没有 ResponseDto 包装；归属校验不通过时是 null
      getOrderById(id)
        .then(res => {
          this.order = res || null;
        })
        .catch(() => {
          this.order = null;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    /** 到期时间取服务端算好的 expireTime —— order-timeout-minute 是 Nacos 配置，前端猜不出来 */
    fetchExpire() {
      const id = String(this.$route.params.id);
      getMyTimeoutOrders()
        .then(res => {
          const row = (res.dataList || []).find(r => String(r.oid) === id);
          this.expireTime = row ? row.expireTime : null;
        })
        // 倒计时是辅助信息，取不到就不渲染，不能挡住支付主流程
        .catch(() => {
          this.expireTime = null;
        });
    },
    handlePay() {
      if (!this.canPay) return;
      this.paying = true;
      updateOrderStatus(this.order.oid, 1)
        .then(() => {
          this.$message.success('支付成功');
          this.$router.push('/my-orders');
        })
        // 失败多半是订单已被超时自动取消，回源刷新让页面自己说明白
        .catch(() => {
          this.fetchOrder();
          this.fetchExpire();
        })
        .finally(() => {
          this.paying = false;
        });
    },
    handleCancel() {
      this.$confirm('确认取消该订单吗？取消后库存将自动返还。', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => updateOrderStatus(this.order.oid, -1))
        .then(() => {
          this.$message.success('订单已取消');
          this.fetchOrder();
          this.expireTime = null;
        })
        .catch(() => {});
    },
    goDetail() {
      this.$router.push(`/order/${this.order.oid}`);
    },
    goOrders() {
      this.$router.push('/my-orders');
    },
    goGallery() {
      this.$router.push('/gallery');
    },
    statusText(status) {
      return (STATUS_MAP[status] || {}).label || '未知';
    },
    statusTagType(status) {
      return (STATUS_MAP[status] || {}).type || 'info';
    },
    formatAmount(amount) {
      if (amount === null || amount === undefined || amount === '') return '0.00';
      const num = Number(amount);
      if (isNaN(num)) return '0.00';
      return num.toFixed(2);
    },
    formatTime(time) {
      if (!time) return '-';
      const d = new Date(String(time).replace(/-/g, '/'));
      if (isNaN(d.getTime())) return String(time);
      const pad = n => (n < 10 ? '0' + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
  }
};
</script>

<style scoped>
.order-pay {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1f2733;
  position: relative;
  padding-left: 12px;
  line-height: 1;
}
.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.header-meta {
  font-size: 13px;
  color: #8a93a4;
  font-weight: 500;
  background: #f3f5fa;
  padding: 3px 10px;
  border-radius: 10px;
  line-height: 1.4;
  font-family: 'Menlo', 'Consolas', monospace;
}
.detail-body {
  padding: 4px 0;
  animation: fadeInUp 0.35s ease both;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.detail-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f0f4ff 0%, #f7f0ff 100%);
  border-radius: 12px;
  border: 1px solid #e6e9f5;
}
.hero-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}
.hero-icon i {
  font-size: 28px;
  color: #fff;
}
.hero-info {
  flex: 1;
  min-width: 0;
}
.hero-amount {
  font-size: 22px;
  font-weight: 700;
  color: #e67700;
  margin-bottom: 8px;
  font-variant-numeric: tabular-nums;
  font-family: 'Menlo', 'Consolas', monospace;
}
.hero-sub {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.countdown {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #d97706;
  background: #fff7e6;
  padding: 3px 10px;
  border-radius: 10px;
  font-variant-numeric: tabular-nums;
}
.countdown.expired {
  color: #f56c6c;
  background: #fef0f0;
}
.detail-desc >>> .el-descriptions__label {
  width: 120px;
  background: #fafbfd;
  color: #4a5568;
  font-weight: 500;
}
.detail-desc >>> .el-descriptions__content {
  color: #1f2733;
}
.desc-id {
  font-family: 'Menlo', 'Consolas', monospace;
  color: #4c5163;
}
.desc-no {
  font-family: 'Menlo', 'Consolas', monospace;
  color: #3b4a6b;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.desc-icon {
  color: #9aa3b2;
  margin-right: 6px;
}
.desc-amount {
  color: #e67700;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: 'Menlo', 'Consolas', monospace;
  letter-spacing: 0.3px;
}
.pay-block {
  margin-top: 22px;
  padding: 18px 20px;
  background: linear-gradient(180deg, #fafbff 0%, #f3f5fb 100%);
  border: 1px solid #e8ecf5;
  border-radius: 12px;
}
.block-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2733;
  margin-bottom: 16px;
}
.pay-methods {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.pay-method {
  margin-right: 0 !important;
  padding: 10px 16px;
  background: #fff;
  border: 1px solid #e8ecf5;
  border-radius: 10px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.pay-method i {
  margin-right: 6px;
  font-size: 16px;
  vertical-align: -1px;
}
.pay-method.is-checked {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}
.pay-actions {
  margin-top: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.form-tip {
  font-size: 12px;
  color: #8a93a4;
}
.btn-danger {
  color: #f56c6c !important;
}
.btn-danger:hover {
  color: #d9363e !important;
}
.pay-result {
  margin-top: 22px;
  padding: 32px 20px;
  text-align: center;
  background: linear-gradient(180deg, #fafbff 0%, #f3f5fb 100%);
  border: 1px solid #e8ecf5;
  border-radius: 12px;
}
.result-icon {
  font-size: 48px;
}
.result-text {
  margin: 12px 0 20px;
  font-size: 15px;
  color: #4a5568;
}
@media (max-width: 768px) {
  .order-pay {
    padding: 12px;
  }
  .detail-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 14px;
  }
  .pay-methods {
    flex-direction: column;
  }
}
</style>

<style>
.order-pay .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.order-pay .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.order-pay .el-card__body {
  padding: 20px 24px;
}
.order-pay .el-descriptions--border .el-descriptions__body {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #eef0f4;
  border-collapse: separate;
}
</style>
