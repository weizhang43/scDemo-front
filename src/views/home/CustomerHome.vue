<template>
  <div class="customer-home">
    <!-- 顶部欢迎 + 概览 -->
    <div class="hero">
      <div class="hero-left">
        <div class="hero-hi">欢迎回来，{{ username }} 👋</div>
        <div class="hero-sub">看看今天卖得最好的、口碑最佳的和刚上架的商品</div>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <i class="el-icon-trophy stat-ico" />
          <div class="stat-num">{{ display.sales }}</div>
          <div class="stat-label">销量榜</div>
        </div>
        <div class="stat">
          <i class="el-icon-star-on stat-ico" />
          <div class="stat-num">{{ display.likes }}</div>
          <div class="stat-label">好评榜</div>
        </div>
        <div class="stat">
          <i class="el-icon-goods stat-ico" />
          <div class="stat-num">{{ display.newest }}</div>
          <div class="stat-label">上新货物</div>
        </div>
        <div class="stat warn-o" :class="{ 'has-warn': myTimeoutOrders.length }">
          <i class="el-icon-time stat-ico" />
          <div class="stat-num">{{ display.order }}</div>
          <div class="stat-label">待支付</div>
        </div>
      </div>
    </div>

    <div class="rank-row">
      <!-- 1. 销量榜 -->
      <el-card class="rank-card theme-sales" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-trophy" /> 销量榜</span>
          <span class="header-right">
            <span class="count-badge" :class="{ zero: !salesRank.length }">{{ salesRank.length }}</span>
            <el-button
              v-if="salesRank.length > PREVIEW_LIMIT"
              type="text"
              size="mini"
              class="btn-more"
              @click="openRank('sales')"
            >更多<i class="el-icon-arrow-right" /></el-button>
          </span>
        </div>
        <div class="card-sub">卖得最好的商品</div>
        <div v-loading="loadingSales" class="rank-list">
          <div
            v-for="(item, idx) in salesTop"
            :key="item.pId"
            class="rank-item"
            @click="goBuy(item.pId)"
          >
            <span class="rank-no" :class="rankClass(idx)">{{ idx + 1 }}</span>
            <div class="rank-thumb">
              <el-image v-if="item.imageUrl" :src="item.imageUrl" fit="cover" class="thumb-img">
                <div slot="error" class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
              </el-image>
              <div v-else class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
            </div>
            <div class="rank-main">
              <div class="rank-name" :title="item.pName">{{ item.pName || '-' }}</div>
              <div class="rank-price" v-if="item.price != null">
                ¥ {{ priceOf(item) }}
                <span v-if="item.discount" class="price-origin">¥ {{ item.price }}</span>
                <span v-if="item.discount" class="discount-flag">{{ discountText(item.discount) }}</span>
              </div>
            </div>
            <span class="rank-metric sales">
              <i class="el-icon-shopping-cart-full" />{{ item.salesCount }}
            </span>
          </div>
          <div v-if="!loadingSales && !salesRank.length" class="empty-box">
            <i class="el-icon-info" /> 暂无销量数据
          </div>
        </div>
      </el-card>

      <!-- 2. 好评榜 -->
      <el-card class="rank-card theme-likes" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-star-on" /> 好评榜</span>
          <span class="header-right">
            <span class="count-badge" :class="{ zero: !likeRank.length }">{{ likeRank.length }}</span>
            <el-button
              v-if="likeRank.length > PREVIEW_LIMIT"
              type="text"
              size="mini"
              class="btn-more"
              @click="openRank('likes')"
            >更多<i class="el-icon-arrow-right" /></el-button>
          </span>
        </div>
        <div class="card-sub">按点赞数排行</div>
        <div v-loading="loadingLikes" class="rank-list">
          <div
            v-for="(item, idx) in likeTop"
            :key="item.pId"
            class="rank-item"
            @click="goBuy(item.pId)"
          >
            <span class="rank-no" :class="rankClass(idx)">{{ idx + 1 }}</span>
            <div class="rank-thumb">
              <el-image v-if="item.imageUrl" :src="item.imageUrl" fit="cover" class="thumb-img">
                <div slot="error" class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
              </el-image>
              <div v-else class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
            </div>
            <div class="rank-main">
              <div class="rank-name" :title="item.pName">{{ item.pName || '-' }}</div>
              <div class="rank-price" v-if="item.price != null">
                ¥ {{ priceOf(item) }}
                <span v-if="item.discount" class="price-origin">¥ {{ item.price }}</span>
                <span v-if="item.discount" class="discount-flag">{{ discountText(item.discount) }}</span>
              </div>
            </div>
            <span class="rank-metric likes">
              <i class="el-icon-star-on" />{{ item.likeCount == null ? 0 : item.likeCount }}
            </span>
          </div>
          <div v-if="!loadingLikes && !likeRank.length" class="empty-box">
            <i class="el-icon-info" /> 暂无好评数据
          </div>
        </div>
      </el-card>
    </div>

    <!-- 3. 上新货物 -->
    <el-card class="newest-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title"><i class="el-icon-goods accent-blue" /> 上新货物</span>
        <span class="header-meta">最新上架 {{ newest.length }} 件</span>
      </div>
      <el-row v-if="newest.length" :gutter="16" class="goods-row">
        <el-col v-for="item in newest" :key="item.pId" :xs="12" :sm="8" :md="3">
          <div
            class="goods-card"
            :class="{ 'goods-card--disabled': isSoldOut(item) }"
            @click="goBuy(item.pId)"
          >
            <div class="goods-image-wrap">
              <el-image v-if="item.imageUrl" :src="item.imageUrl" fit="cover" class="goods-image">
                <div slot="error" class="goods-image-fallback">
                  <i class="el-icon-picture-outline" />
                </div>
              </el-image>
              <div v-else class="goods-image-fallback">
                <i class="el-icon-picture-outline" />
              </div>
              <div v-if="isSoldOut(item)" class="sold-out-mask">已售罄</div>
              <div v-else class="new-badge">NEW</div>
            </div>
            <div class="goods-body">
              <div class="goods-name" :title="item.pName">{{ item.pName }}</div>
              <div class="goods-foot">
                <span class="price-text">
                  ¥ {{ priceOf(item) }}
                  <span v-if="item.discount" class="price-origin">¥ {{ item.price }}</span>
                </span>
                <span class="goods-stock">库存 {{ item.stock == null ? '-' : item.stock }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div v-else-if="loadingNewest" class="newest-loading" v-loading="true"></div>
      <el-empty v-else description="暂无上新商品" :image-size="90" />
    </el-card>

    <!-- 4. 个人即将超期订单 -->
    <el-card class="order-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title"><i class="el-icon-time" /> 我的即将超期订单</span>
        <span class="count-badge" :class="{ zero: !myTimeoutOrders.length }">{{ myTimeoutOrders.length }}</span>
      </div>
      <div class="card-sub">待支付订单，超时后将自动取消</div>
      <el-table
        v-loading="loadingOrders"
        :data="myTimeoutOrders"
        size="mini"
        :row-class-name="orderRowClass"
        class="warn-table"
      >
        <template slot="empty"><div class="empty-box"><i class="el-icon-circle-check" /> 暂无即将超期的订单</div></template>
        <el-table-column prop="orderNo" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column label="金额" width="120" align="center">
          <template slot-scope="s">￥{{ s.row.orderAmount }}</template>
        </el-table-column>
        <el-table-column label="下单时间" min-width="170" align="center">
          <template slot-scope="s">{{ s.row.createTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="剩余支付时间" width="140" align="center">
          <template slot-scope="s">
            <span :class="['countdown', { expired: remain(s.row) <= 0 }]">
              <i :class="remain(s.row) <= 0 ? 'el-icon-warning' : 'el-icon-alarm-clock'" />{{ countdownText(s.row) }}
            </span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 榜单完整榜（前十） -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="rankDialogVisible"
      width="560px"
      custom-class="rank-dialog"
      append-to-body
    >
      <div class="rank-list dialog-list">
        <div
          v-for="(item, idx) in dialogList"
          :key="item.pId"
          class="rank-item"
          @click="goBuy(item.pId)"
        >
          <span class="rank-no" :class="rankClass(idx)">{{ idx + 1 }}</span>
          <div class="rank-thumb">
            <el-image v-if="item.imageUrl" :src="item.imageUrl" fit="cover" class="thumb-img">
              <div slot="error" class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
            </el-image>
            <div v-else class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
          </div>
          <div class="rank-main">
            <div class="rank-name" :title="item.pName">{{ item.pName || '-' }}</div>
            <div class="rank-price" v-if="item.price != null">
              ¥ {{ priceOf(item) }}
              <span v-if="item.discount" class="price-origin">¥ {{ item.price }}</span>
              <span v-if="item.discount" class="discount-flag">{{ discountText(item.discount) }}</span>
            </div>
          </div>
          <span class="rank-metric" :class="dialogType">
            <i :class="dialogType === 'sales' ? 'el-icon-shopping-cart-full' : 'el-icon-star-on'" />{{ metricText(item) }}
          </span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getSalesRank, getLikeRank, getNewestProducts, getMyTimeoutOrders } from '../../api/home';

const RANK_LIMIT = 10;
const NEWEST_LIMIT = 8;
const PREVIEW_LIMIT = 5;

export default {
  name: 'CustomerHome',
  data() {
    return {
      PREVIEW_LIMIT,
      salesRank: [],
      likeRank: [],
      newest: [],
      myTimeoutOrders: [],
      loadingSales: false,
      loadingLikes: false,
      loadingNewest: false,
      loadingOrders: false,
      now: Date.now(),
      timer: null,
      rankDialogVisible: false,
      dialogType: 'sales',
      display: { sales: 0, likes: 0, newest: 0, order: 0 }
    };
  },
  computed: {
    username() {
      const user = this.$store.state.userInfo || {};
      return user.realName || user.uName || '用户';
    },
    salesTop() {
      return this.salesRank.slice(0, PREVIEW_LIMIT);
    },
    likeTop() {
      return this.likeRank.slice(0, PREVIEW_LIMIT);
    },
    dialogList() {
      return this.dialogType === 'sales' ? this.salesRank : this.likeRank;
    },
    dialogTitle() {
      const name = this.dialogType === 'sales' ? '销量榜' : '好评榜';
      return `${name} TOP ${RANK_LIMIT}`;
    }
  },
  created() {
    this.fetchAll();
    this.timer = setInterval(() => { this.now = Date.now(); }, 1000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    fetchAll() {
      this.loadingSales = true;
      getSalesRank(RANK_LIMIT).then(res => { this.salesRank = res.dataList || []; this.countTo('sales', this.salesRank.length); })
        .catch(() => {}).finally(() => { this.loadingSales = false; });
      this.loadingLikes = true;
      getLikeRank(RANK_LIMIT).then(res => { this.likeRank = res.dataList || []; this.countTo('likes', this.likeRank.length); })
        .catch(() => {}).finally(() => { this.loadingLikes = false; });
      this.loadingNewest = true;
      getNewestProducts(NEWEST_LIMIT).then(res => { this.newest = res.dataList || []; this.countTo('newest', this.newest.length); })
        .catch(() => {}).finally(() => { this.loadingNewest = false; });
      this.loadingOrders = true;
      getMyTimeoutOrders().then(res => { this.myTimeoutOrders = res.dataList || []; this.countTo('order', this.myTimeoutOrders.length); })
        .catch(() => {}).finally(() => { this.loadingOrders = false; });
    },
    countTo(key, target) {
      const start = performance.now();
      const duration = 700;
      const step = t => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        this.display[key] = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    rankClass(idx) {
      return idx < 3 ? `top top-${idx + 1}` : '';
    },
    openRank(type) {
      this.dialogType = type;
      this.rankDialogVisible = true;
    },
    metricText(item) {
      if (this.dialogType === 'sales') return item.salesCount == null ? 0 : item.salesCount;
      return item.likeCount == null ? 0 : item.likeCount;
    },
    isSoldOut(item) {
      return item.stock != null && Number(item.stock) <= 0;
    },
    /** 服务端回填的折后价；无折扣时后端也会填成原价 */
    priceOf(item) {
      return item.effectivePrice != null ? item.effectivePrice : item.price;
    },
    discountText(discount) {
      const d = Number(discount) || 0;
      if (!d) return '';
      return `${(d / 10).toFixed(1).replace(/\.0$/, '')} 折`;
    },
    goBuy(pId) {
      if (pId == null) return;
      this.$router.push(`/product-buy/${pId}`).catch(() => {});
    },
    orderRowClass({ row }) {
      return this.remain(row) <= 0 ? 'row-danger' : '';
    },
    remain(row) {
      if (!row.expireTime) return 0;
      const ts = new Date(String(row.expireTime).replace(/-/g, '/')).getTime();
      return ts - this.now;
    },
    countdownText(row) {
      const ms = this.remain(row);
      if (ms <= 0) return '已超时';
      const total = Math.floor(ms / 1000);
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      const p = v => (v < 10 ? '0' + v : v);
      return `${p(h)}:${p(m)}:${p(s)}`;
    }
  }
};
</script>

<style scoped>
.customer-home { max-width: 1280px; margin: 0 auto; }

/* 顶部欢迎条 */
.hero {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
  padding: 22px 26px;
  margin-bottom: 16px;
  border-radius: 14px;
  color: #fff;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 55%, #667eea 100%);
  box-shadow: 0 8px 24px rgba(30, 60, 114, 0.25);
}
.hero-hi { font-size: 21px; font-weight: 700; letter-spacing: 0.3px; }
.hero-sub { margin-top: 6px; font-size: 13px; opacity: 0.82; }
.hero-stats { display: flex; gap: 12px; flex-wrap: wrap; }
.stat {
  min-width: 92px;
  padding: 12px 16px;
  border-radius: 12px;
  text-align: center;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  transition: transform 0.2s ease, background 0.2s ease;
}
.stat:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.2); }
.stat-ico { font-size: 17px; opacity: 0.9; }
.stat-num { font-size: 24px; font-weight: 700; line-height: 1.2; font-family: var(--font-mono); }
.stat-label { font-size: 12px; opacity: 0.85; }
.stat.warn-o.has-warn { background: rgba(245, 108, 108, 0.32); border-color: rgba(245, 108, 108, 0.5); }

/* 卡片通用 */
.header-right { display: flex; align-items: center; gap: 10px; }
.btn-more { padding: 0; color: #667eea; font-weight: 600; }
.btn-more:hover, .btn-more:focus { color: #8497f2; }
.btn-more i { margin-left: 2px; }
.card-title i { margin-right: 6px; }
.card-sub { font-size: 12px; color: #8a93a4; margin-bottom: 10px; }
.count-badge {
  min-width: 24px;
  padding: 2px 9px;
  border-radius: 11px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  text-align: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: var(--font-mono);
}
.count-badge.zero { background: #cbd2de; }
.accent-blue { color: #667eea; }
.empty-box { padding: 26px 0; text-align: center; color: #a0a8b8; font-size: 13px; }
.empty-box i { margin-right: 5px; color: #67c23a; }

/* 榜单 */
.rank-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-bottom: 16px; }
.rank-list { min-height: 290px; }
.dialog-list { min-height: 0; max-height: 62vh; overflow-y: auto; }
.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;
}
.rank-item:hover { background: #f5f7ff; transform: translateX(2px); }
.rank-no {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  line-height: 22px;
  border-radius: 6px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #8a93a4;
  background: #f0f2f7;
  font-family: var(--font-mono);
}
.rank-no.top { color: #fff; }
.rank-no.top-1 { background: linear-gradient(135deg, #f5b04c, #e8912a); }
.rank-no.top-2 { background: linear-gradient(135deg, #b6bfd0, #98a3b8); }
.rank-no.top-3 { background: linear-gradient(135deg, #d29a72, #b87a4f); }
.rank-thumb { flex-shrink: 0; width: 40px; height: 40px; border-radius: 8px; overflow: hidden; background: #f3f5fa; }
.thumb-img { width: 100%; height: 100%; display: block; }
.thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c3cad8;
  font-size: 18px;
}
.rank-main { flex: 1; min-width: 0; }
.rank-name {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rank-price { margin-top: 2px; font-size: 12px; color: #f56c6c; font-weight: 600; }
.price-origin { color: #9aa3b2; font-weight: 500; font-size: 0.85em; text-decoration: line-through; margin-left: 4px; }
.discount-flag {
  margin-left: 4px;
  padding: 0 5px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #f56c6c, #e8552f);
}
.rank-metric {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-mono);
}
.rank-metric i { margin-right: 4px; }
.rank-metric.sales { color: #667eea; }
.rank-metric.likes { color: #e6a23c; }

/* 上新货物 */
.newest-card, .order-card { margin-bottom: 16px; }
.newest-loading { min-height: 180px; }
.goods-row { margin-top: 4px; }
.goods-card {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #eef0f4;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.goods-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(31, 41, 59, 0.1); }
.goods-card--disabled { cursor: not-allowed; opacity: 0.72; }
.goods-card--disabled:hover { transform: none; box-shadow: none; }
.goods-image-wrap { position: relative; height: 116px; background: #f3f5fa; }
.goods-image { width: 100%; height: 100%; display: block; }
.goods-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c3cad8;
  font-size: 30px;
}
.sold-out-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: rgba(31, 41, 59, 0.5);
}
.new-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 1px 7px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #f56c6c, #e8552f);
}
.goods-body { padding: 10px 12px 12px; }
.goods-name {
  font-size: 13px;
  font-weight: 500;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.goods-foot { margin-top: 8px; display: flex; justify-content: space-between; align-items: baseline; }
.price-text { font-size: 15px; font-weight: 700; color: #f56c6c; }
.goods-stock { font-size: 11px; color: #8a93a4; }

/* 订单倒计时 */
.countdown { font-size: 13px; font-weight: 600; color: #e6a23c; font-family: var(--font-mono); }
.countdown i { margin-right: 4px; }
.countdown.expired { color: #f56c6c; }

@media (max-width: 992px) {
  .rank-row { grid-template-columns: 1fr; }
}
</style>

<style>
.customer-home .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
}
.customer-home .el-card__header {
  padding: 15px 20px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.customer-home .el-card__body { padding: 16px 20px 20px; }
.customer-home .warn-table .row-danger td { background: #fef4f4 !important; }
.customer-home .warn-table th { background: #f3f5fa; color: #2d3748; font-weight: 600; }
/* 弹窗 append-to-body，选择器不能挂在 .customer-home 下 */
.rank-dialog { border-radius: 14px; }
.rank-dialog .el-dialog__body { padding: 10px 20px 20px; }
</style>
