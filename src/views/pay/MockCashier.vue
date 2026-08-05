<template>
  <div class="mock-cashier">
    <div class="cashier-banner">
      <i class="el-icon-bank-card banner-icon"></i>
      <div class="banner-text">
        <div class="banner-title">模拟支付收银台</div>
        <div class="banner-sub">MOCK PAY GATEWAY · 仅供演示，不产生真实扣款</div>
      </div>
    </div>

    <el-card v-loading="loading" class="cashier-card">
      <div v-if="txn">
        <div class="amount-block">
          <div class="amount-label">支付金额</div>
          <div class="amount-value">¥ {{ formatAmount(txn.amount) }}</div>
          <el-tag :type="statusInfo.type" size="small" effect="light">{{ statusInfo.label }}</el-tag>
        </div>

        <el-descriptions :column="1" border class="txn-desc">
          <el-descriptions-item label="商品摘要">{{ txn.subject || '-' }}</el-descriptions-item>
          <el-descriptions-item label="商户单号">
            <span class="mono">{{ txn.payNo }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="网关交易号">
            <span class="mono">{{ txn.transactionId }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="isPending" class="cashier-actions">
          <el-button
            type="primary"
            icon="el-icon-circle-check"
            :loading="submitting"
            @click="handleSimulate('SUCCESS')"
          >模拟支付成功</el-button>
          <el-button
            type="danger"
            plain
            icon="el-icon-circle-close"
            :loading="submitting"
            @click="handleSimulate('FAIL')"
          >模拟支付失败</el-button>
          <el-button type="text" @click="goBack">返回订单</el-button>
        </div>

        <div v-else class="cashier-done">
          <i :class="statusInfo.icon" :style="{ color: statusInfo.color }" class="done-icon"></i>
          <div class="done-text">{{ statusInfo.doneText }}</div>
          <el-button type="primary" @click="goBack">返回订单</el-button>
        </div>
      </div>

      <el-empty v-else-if="!loading" description="交易单不存在或已过期">
        <el-button type="primary" @click="goBack">返回订单</el-button>
      </el-empty>
    </el-card>
  </div>
</template>

<script>
import { getCashierTxn, simulatePay } from '../../api/pay';

const STATUS_INFO = {
  0: { label: '待支付', type: 'warning' },
  1: { label: '支付成功', type: 'success', icon: 'el-icon-success', color: '#67c23a', doneText: '支付已完成，支付结果将异步通知商户' },
  2: { label: '支付失败', type: 'danger', icon: 'el-icon-error', color: '#f56c6c', doneText: '支付失败，可回到订单重新发起支付' },
  3: { label: '已关闭', type: 'info', icon: 'el-icon-remove', color: '#909399', doneText: '交易已关闭（订单可能已取消）' }
};

export default {
  name: 'MockCashier',
  data() {
    return {
      txn: null,
      loading: false,
      submitting: false
    };
  },
  computed: {
    isPending() {
      return !!this.txn && Number(this.txn.status) === 0;
    },
    statusInfo() {
      return STATUS_INFO[Number(this.txn && this.txn.status)] || STATUS_INFO[0];
    }
  },
  created() {
    this.fetchTxn();
  },
  methods: {
    fetchTxn() {
      this.loading = true;
      getCashierTxn(this.$route.params.transactionId)
        .then(res => {
          this.txn = res.daoResult || null;
        })
        .catch(() => {
          this.txn = null;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleSimulate(result) {
      this.submitting = true;
      simulatePay(this.$route.params.transactionId, result)
        .then(res => {
          this.txn = res.daoResult || this.txn;
          this.$message.success(result === 'SUCCESS' ? '已模拟支付成功，正在通知商户…' : '已模拟支付失败');
          this.goBack();
        })
        .catch(() => {
          this.fetchTxn();
        })
        .finally(() => {
          this.submitting = false;
        });
    },
    /** 回跳订单支付页并带上 payNo，由 OrderPay 轮询支付结果 */
    goBack() {
      const { oid, payNo } = this.$route.query;
      if (oid) {
        this.$router.replace({ path: `/pay/${oid}`, query: payNo ? { payNo } : {} });
      } else {
        this.$router.replace('/my-orders');
      }
    },
    formatAmount(amount) {
      const num = Number(amount);
      return isNaN(num) ? '0.00' : num.toFixed(2);
    }
  }
};
</script>

<style scoped>
.mock-cashier {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.cashier-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: 560px;
  margin: 0 auto 16px;
  padding: 20px 24px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  box-shadow: 0 6px 24px rgba(102, 126, 234, 0.35);
}
.banner-icon {
  font-size: 34px;
}
.banner-title {
  font-size: 18px;
  font-weight: 700;
}
.banner-sub {
  margin-top: 4px;
  font-size: 12px;
  opacity: 0.85;
  letter-spacing: 0.5px;
}
.cashier-card {
  max-width: 560px;
  margin: 0 auto;
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
}
.amount-block {
  text-align: center;
  padding: 10px 0 20px;
}
.amount-label {
  font-size: 13px;
  color: #8a93a4;
}
.amount-value {
  margin: 6px 0 10px;
  font-size: 32px;
  font-weight: 700;
  color: var(--color-price);
  font-family: var(--font-mono);
}
.txn-desc >>> .el-descriptions__label {
  width: 110px;
  background: #fafbfd;
  color: #4a5568;
}
.mono {
  color: #3b4a6b;
}
.cashier-actions {
  margin-top: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.cashier-done {
  margin-top: 22px;
  text-align: center;
  padding: 16px 0;
}
.done-icon {
  font-size: 46px;
}
.done-text {
  margin: 12px 0 18px;
  color: #4a5568;
  font-size: 14px;
}
</style>
