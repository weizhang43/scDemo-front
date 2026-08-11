<template>
  <div class="coupon-center">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">领券中心</span>
        </div>
        <el-radio-group v-model="activeTab" size="small">
          <el-radio-button label="center">可领取</el-radio-button>
          <el-radio-button label="mine">我的券</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 可领取 -->
      <div v-if="activeTab === 'center'" v-loading="loading" class="coupon-grid">
        <div v-for="tpl in templates" :key="tpl.id" class="coupon-item" :class="{ disabled: tpl.claimed || soldOut(tpl) }">
          <div class="coupon-left">
            <div class="coupon-value">
              <template v-if="tpl.type === 1">
                <span class="currency">¥</span>{{ num(tpl.offAmount) }}
              </template>
              <template v-else>{{ rateText(tpl.discountRate) }}<span class="currency">折</span></template>
            </div>
            <div class="coupon-threshold">{{ thresholdText(tpl) }}</div>
          </div>
          <div class="coupon-mid">
            <div class="coupon-name">{{ tpl.name }}</div>
            <div class="coupon-time">{{ tpl.validStart }} ~ {{ tpl.validEnd }}</div>
            <div class="coupon-remain">剩余 {{ tpl.redisRemain == null ? tpl.remainCount : tpl.redisRemain }} 张</div>
          </div>
          <div class="coupon-right">
            <el-button
              v-if="tpl.claimed"
              size="small"
              round
              disabled
            >已领取</el-button>
            <el-button
              v-else-if="soldOut(tpl)"
              size="small"
              round
              disabled
            >已领完</el-button>
            <el-button
              v-else
              type="primary"
              size="small"
              round
              :loading="claimingId === tpl.id"
              @click="handleClaim(tpl)"
            >立即领取</el-button>
          </div>
        </div>
        <el-empty v-if="!loading && templates.length === 0" description="暂无可领取的优惠券" />
      </div>

      <!-- 我的券 -->
      <div v-else v-loading="loading">
        <el-table
          :data="mineList"
          border
          stripe
          style="width:100%;"
          :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600, textAlign: 'center' }"
          :cell-style="{ textAlign: 'center' }"
          empty-text="还没有优惠券，去领券中心看看吧"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="name" label="券名称" min-width="150" show-overflow-tooltip />
          <el-table-column label="优惠规则" min-width="160">
            <template slot-scope="s">{{ ruleText(s.row) }}</template>
          </el-table-column>
          <el-table-column label="有效期" width="300">
            <template slot-scope="s">{{ s.row.validStart }} ~ {{ s.row.validEnd }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template slot-scope="s">
              <el-tag :type="statusOf(s.row).type" size="mini">{{ statusOf(s.row).label }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="claimTime" label="领取时间" width="170" />
        </el-table>
      </div>
    </el-card>
  </div>
</template>

<script>
import { couponCenter, claimCoupon, myCoupons } from '../../api/coupon';

const UC_STATUS = {
  0: { label: '未使用', type: 'success' },
  1: { label: '已锁定', type: 'warning' },
  2: { label: '已使用', type: 'info' }
};

export default {
  name: 'CouponCenter',
  data() {
    return {
      activeTab: 'center',
      loading: false,
      templates: [],
      mineList: [],
      claimingId: null
    };
  },
  watch: {
    activeTab() {
      this.refresh();
    }
  },
  created() {
    this.refresh();
  },
  methods: {
    refresh() {
      if (this.activeTab === 'center') {
        this.fetchCenter();
      } else {
        this.fetchMine();
      }
    },
    fetchCenter() {
      this.loading = true;
      couponCenter()
        .then(res => { this.templates = res.dataList || []; })
        .finally(() => { this.loading = false; });
    },
    fetchMine() {
      this.loading = true;
      myCoupons()
        .then(res => { this.mineList = res.dataList || []; })
        .finally(() => { this.loading = false; });
    },
    soldOut(tpl) {
      const remain = tpl.redisRemain == null ? tpl.remainCount : tpl.redisRemain;
      return !remain || remain <= 0;
    },
    num(v) {
      return Number(v || 0).toFixed(2).replace(/\.00$/, '');
    },
    rateText(rate) {
      return (Number(rate || 0) * 10).toFixed(1).replace(/\.0$/, '');
    },
    thresholdText(tpl) {
      const t = Number(tpl.thresholdAmount || 0);
      return t > 0 ? `满 ${this.num(t)} 元可用` : '无门槛';
    },
    ruleText(row) {
      const prefix = this.thresholdText(row) === '无门槛' ? '无门槛' : `满 ${this.num(row.thresholdAmount)} 元`;
      if (row.type === 1) {
        return `${prefix}减 ${this.num(row.offAmount)} 元`;
      }
      return `${prefix}打 ${this.rateText(row.discountRate)} 折`;
    },
    statusOf(row) {
      return UC_STATUS[row.status] || { label: '未知', type: 'info' };
    },
    handleClaim(tpl) {
      this.claimingId = tpl.id;
      claimCoupon(tpl.id)
        .then(() => {
          this.$message.success('领取成功');
          this.fetchCenter();
        })
        .finally(() => { this.claimingId = null; });
    }
  }
};
</script>

<style scoped>
.coupon-center { width: 100%; }
.coupon-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(420px, 1fr)); gap: 16px; }
.coupon-item {
  display: flex; align-items: center; border-radius: 10px; overflow: hidden;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; padding: 16px; min-height: 92px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}
.coupon-item.disabled { filter: grayscale(0.7); opacity: 0.75; }
.coupon-left { flex: 0 0 110px; text-align: center; border-right: 1px dashed rgba(255,255,255,0.5); padding-right: 12px; }
.coupon-value { font-size: 28px; font-weight: 700; line-height: 1.2; }
.currency { font-size: 14px; margin: 0 2px; }
.coupon-threshold { font-size: 12px; opacity: 0.9; margin-top: 4px; }
.coupon-mid { flex: 1; padding: 0 14px; min-width: 0; }
.coupon-name { font-size: 15px; font-weight: 600; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.coupon-time { font-size: 12px; opacity: 0.85; }
.coupon-remain { font-size: 12px; opacity: 0.85; margin-top: 4px; }
.coupon-right { flex: 0 0 auto; }
</style>
