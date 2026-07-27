<template>
  <div class="home">
    <!-- 顶部欢迎 + 概览 -->
    <div class="hero">
      <div class="hero-left">
        <div class="hero-hi">欢迎回来，{{ username }} 👋</div>
        <div class="hero-sub">这里是系统运营概览，请关注下方预警信息</div>
      </div>
      <div class="hero-stats">
        <div class="stat">
          <i class="el-icon-bell stat-ico" />
          <div class="stat-num">{{ display.notice }}</div>
          <div class="stat-label">系统通知</div>
        </div>
        <div class="stat warn-e" :class="{ 'has-warn': expiring.length }">
          <i class="el-icon-warning-outline stat-ico" />
          <div class="stat-num">{{ display.expiring }}</div>
          <div class="stat-label">即将过期</div>
        </div>
        <div class="stat warn-s" :class="{ 'has-warn': lowStock.length }">
          <i class="el-icon-goods stat-ico" />
          <div class="stat-num">{{ display.stock }}</div>
          <div class="stat-label">库存不足</div>
        </div>
        <div class="stat warn-o" :class="{ 'has-warn': timeoutOrders.length }">
          <i class="el-icon-time stat-ico" />
          <div class="stat-num">{{ display.order }}</div>
          <div class="stat-label">超时订单</div>
        </div>
      </div>
    </div>

    <!-- 1. 系统通知轮播 -->
    <el-card class="notice-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title"><i class="el-icon-bell accent-blue" /> 系统通知</span>
        <span class="header-meta">共 {{ notices.length }} 条</span>
      </div>
      <el-carousel
        v-if="notices.length"
        height="260px"
        :interval="4000"
        :autoplay="true"
        :pause-on-hover="true"
        :loop="true"
        arrow="hover"
        indicator-position="inside"
        type="card"
      >
        <el-carousel-item v-for="n in notices" :key="n.noticeId" @click.native="openNotice(n)">
          <div class="carousel-slide" :style="slideStyle(n)">
            <div class="carousel-mask">
              <div class="carousel-title">{{ n.title }}</div>
              <div class="carousel-time"><i class="el-icon-time" /> {{ n.createTime }}</div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
      <el-empty v-else description="暂无通知" :image-size="90" />
    </el-card>

    <div class="warning-row">
      <!-- 2. 商品过期预警 -->
      <el-card class="warn-card theme-e" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-warning-outline" /> 商品过期预警</span>
          <span class="count-badge" :class="{ zero: !expiring.length }">{{ expiring.length }}</span>
        </div>
        <div class="card-sub">三个月内到期商品</div>
        <el-table v-loading="loadingExpiring" :data="expiring" height="278" size="mini"
                  :row-class-name="expireRowClass" class="warn-table">
          <template slot="empty"><div class="empty-box"><i class="el-icon-circle-check" /> 暂无即将过期商品</div></template>
          <el-table-column prop="pName" label="商品" min-width="90" show-overflow-tooltip />
          <el-table-column label="到期日" width="110" align="center">
            <template slot-scope="s">{{ expireDate(s.row) }}</template>
          </el-table-column>
          <el-table-column label="剩余" width="80" align="center">
            <template slot-scope="s">
              <el-tag size="mini" effect="dark" :type="daysLeft(s.row) <= 30 ? 'danger' : 'warning'">{{ daysLeft(s.row) }}天</el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 3. 商品库存预警 -->
      <el-card class="warn-card theme-s" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-goods" /> 商品库存预警</span>
          <span class="count-badge" :class="{ zero: !lowStock.length }">{{ lowStock.length }}</span>
        </div>
        <div class="card-sub">库存低于 100 的商品</div>
        <el-table v-loading="loadingStock" :data="lowStock" height="278" size="mini"
                  :row-class-name="stockRowClass" class="warn-table">
          <template slot="empty"><div class="empty-box"><i class="el-icon-circle-check" /> 库存充足</div></template>
          <el-table-column prop="pName" label="商品" min-width="100" show-overflow-tooltip />
          <el-table-column label="库存" min-width="120" align="center">
            <template slot-scope="s">
              <div class="stock-cell">
                <div class="stock-bar"><span :style="{ width: stockPct(s.row.stock) + '%' }" :class="s.row.stock <= 20 ? 'danger' : 'warn'"></span></div>
                <span class="stock-num" :class="s.row.stock <= 20 ? 'danger' : 'warn'">{{ s.row.stock }}</span>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 4. 订单超时预警 -->
      <el-card class="warn-card theme-o" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-time" /> 订单超时预警</span>
          <span class="count-badge" :class="{ zero: !timeoutOrders.length }">{{ timeoutOrders.length }}</span>
        </div>
        <div class="card-sub">待处理的超时订单</div>
        <el-table v-loading="loadingOrders" :data="timeoutOrders" height="278" size="mini"
                  :row-class-name="orderRowClass" class="warn-table">
          <template slot="empty"><div class="empty-box"><i class="el-icon-circle-check" /> 暂无超时订单</div></template>
          <el-table-column prop="orderNo" label="订单号" min-width="120" show-overflow-tooltip />
          <el-table-column label="金额" width="80" align="center">
            <template slot-scope="s">￥{{ s.row.orderAmount }}</template>
          </el-table-column>
          <el-table-column label="倒计时" width="104" align="center">
            <template slot-scope="s">
              <span :class="['countdown', { expired: remain(s.row) <= 0 }]">
                <i :class="remain(s.row) <= 0 ? 'el-icon-warning' : 'el-icon-alarm-clock'" />{{ countdownText(s.row) }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 通知详情 -->
    <el-dialog :title="current.title" :visible.sync="detailVisible" width="680px" top="8vh" custom-class="notice-dialog">
      <div class="notice-detail" v-html="current.content"></div>
    </el-dialog>
  </div>
</template>

<script>
import { getPublishedNotices } from '../../api/notice';
import { getExpiringProducts, getLowStockProducts, getTimeoutOrders } from '../../api/home';

export default {
  name: 'Home',
  data() {
    return {
      notices: [],
      expiring: [],
      lowStock: [],
      timeoutOrders: [],
      loadingExpiring: false,
      loadingStock: false,
      loadingOrders: false,
      detailVisible: false,
      current: { title: '', content: '' },
      now: Date.now(),
      timer: null,
      display: { notice: 0, expiring: 0, stock: 0, order: 0 }
    };
  },
  computed: {
    username() {
      const user = this.$store.state.userInfo || {};
      return user.realName || user.uName || '用户';
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
      getPublishedNotices().then(res => { this.notices = res.dataList || []; this.countTo('notice', this.notices.length); }).catch(() => {});
      this.loadingExpiring = true;
      getExpiringProducts().then(res => { this.expiring = res.dataList || []; this.countTo('expiring', this.expiring.length); })
        .catch(() => {}).finally(() => { this.loadingExpiring = false; });
      this.loadingStock = true;
      getLowStockProducts().then(res => { this.lowStock = res.dataList || []; this.countTo('stock', this.lowStock.length); })
        .catch(() => {}).finally(() => { this.loadingStock = false; });
      this.loadingOrders = true;
      getTimeoutOrders().then(res => { this.timeoutOrders = res.dataList || []; this.countTo('order', this.timeoutOrders.length); })
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
    slideStyle(n) {
      if (n.coverImage) {
        return { backgroundImage: `url(${n.coverImage})` };
      }
      return { background: 'linear-gradient(135deg,#1e3c72,#2a5298 55%,#667eea)' };
    },
    openNotice(n) {
      this.current = n;
      this.detailVisible = true;
    },
    // 到期日 = 生产日期 + 保质期天数
    expireTs(row) {
      if (!row.productionDate) return null;
      const base = new Date(String(row.productionDate).replace(/-/g, '/')).getTime();
      return base + (Number(row.shelfLife) || 0) * 86400000;
    },
    expireDate(row) {
      const ts = this.expireTs(row);
      if (!ts) return '-';
      const d = new Date(ts);
      const p = v => (v < 10 ? '0' + v : v);
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    },
    daysLeft(row) {
      const ts = this.expireTs(row);
      if (!ts) return 0;
      return Math.max(0, Math.ceil((ts - this.now) / 86400000));
    },
    expireRowClass({ row }) {
      return this.daysLeft(row) <= 30 ? 'row-danger' : '';
    },
    stockRowClass({ row }) {
      return row.stock <= 20 ? 'row-danger' : '';
    },
    orderRowClass({ row }) {
      return this.remain(row) <= 0 ? 'row-danger' : '';
    },
    stockPct(stock) {
      return Math.max(6, Math.min(100, (Number(stock) || 0)));
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
.home { max-width: 1280px; margin: 0 auto; }

/* 顶部欢迎条 */
.hero {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px 28px;
  margin-bottom: 20px;
  border-radius: 16px;
  color: #fff;
  overflow: hidden;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 55%, #667eea 100%);
  box-shadow: 0 10px 30px rgba(30, 60, 114, 0.28);
}
.hero::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -40px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.18), transparent 70%);
  pointer-events: none;
}
.hero-left { position: relative; z-index: 1; }
.hero-hi { font-size: 23px; font-weight: 700; letter-spacing: 0.5px; }
.hero-sub { margin-top: 6px; font-size: 13px; opacity: 0.85; }
.hero-stats { position: relative; z-index: 1; display: flex; gap: 14px; }
.stat {
  position: relative;
  min-width: 84px;
  padding: 12px 16px;
  text-align: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.stat:hover { transform: translateY(-3px); background: rgba(255, 255, 255, 0.24); }
.stat-ico { font-size: 15px; opacity: 0.7; }
.stat-num { font-size: 26px; font-weight: 700; line-height: 1.15; }
.stat-label { font-size: 12px; opacity: 0.85; margin-top: 2px; }
.stat.warn-e .stat-num { color: #ffd6a5; }
.stat.warn-s .stat-num { color: #ffe08a; }
.stat.warn-o .stat-num { color: #ff9aa2; }
.stat.has-warn::after {
  content: '';
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #ff6b6b;
  box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.6);
  animation: pulse 1.8s infinite;
}
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.6); }
  70% { box-shadow: 0 0 0 8px rgba(255, 107, 107, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 107, 0); }
}

/* 卡片通用 */
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 15px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 6px; }
.header-meta { font-size: 12px; color: #909399; }
.accent-blue { color: #2a5298; }

.notice-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.notice-card >>> .el-card__body { padding: 18px 20px 26px; }

/* 轮播 */
.carousel-slide {
  height: 100%;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}
.carousel-mask {
  width: 100%;
  padding: 18px 22px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  color: #fff;
}
.carousel-title { font-size: 19px; font-weight: 600; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); }
.carousel-time { font-size: 12px; opacity: 0.85; margin-top: 6px; }

/* 预警卡片 */
.warning-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.warn-card {
  position: relative;
  border-radius: 14px;
  border: none;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.warn-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12); }
.warn-card >>> .el-card__header { border-bottom: none; padding: 14px 18px 6px; }
.warn-card >>> .el-card__body { padding: 0 18px 16px; }

/* 顶部主题条 + 标题图标底色 */
.warn-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
}
.theme-e::before { background: linear-gradient(90deg, #f5b76b, #e6a23c); }
.theme-s::before { background: linear-gradient(90deg, #79bbff, #409eff); }
.theme-o::before { background: linear-gradient(90deg, #ff9a9e, #f56c6c); }
.theme-e .card-title i { color: #e6a23c; }
.theme-s .card-title i { color: #409eff; }
.theme-o .card-title i { color: #f56c6c; }

.card-sub { font-size: 12px; color: #a0a4ac; margin: 0 0 10px 24px; }

/* 数量徽标 */
.count-badge {
  min-width: 24px;
  height: 22px;
  padding: 0 8px;
  line-height: 22px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  border-radius: 11px;
}
.theme-e .count-badge { background: #e6a23c; }
.theme-s .count-badge { background: #409eff; }
.theme-o .count-badge { background: #f56c6c; }
.count-badge.zero { background: #c8ccd4; }

/* 表格 */
.warn-table >>> th.el-table__cell { background: #fafbfc; color: #606266; font-weight: 600; }
.warn-table >>> .el-table__row { transition: background-color 0.15s ease; }
.warn-table >>> .row-danger td.el-table__cell { background: #fff5f5 !important; }
.warn-table >>> .el-table__row:hover > td.el-table__cell { background: #f2f6fc !important; }

.empty-box { color: #b3b8c2; font-size: 13px; padding: 18px 0; }
.empty-box i { color: #67c23a; margin-right: 4px; }

/* 库存进度条 */
.stock-cell { display: flex; align-items: center; gap: 8px; justify-content: center; }
.stock-bar { flex: 1; max-width: 70px; height: 6px; border-radius: 3px; background: #eef0f3; overflow: hidden; }
.stock-bar span { display: block; height: 100%; border-radius: 3px; transition: width 0.4s ease; }
.stock-bar span.warn { background: linear-gradient(90deg, #f5b76b, #e6a23c); }
.stock-bar span.danger { background: linear-gradient(90deg, #ff9a9e, #f56c6c); }
.stock-num { font-weight: 700; font-size: 13px; min-width: 28px; text-align: left; }
.stock-num.warn { color: #e6a23c; }
.stock-num.danger { color: #f56c6c; }

.countdown {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: 'Courier New', monospace;
  color: #e6a23c;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.countdown.expired { color: #f56c6c; }

.notice-detail { max-height: 62vh; overflow: auto; line-height: 1.75; color: #303133; }
.notice-detail >>> img { max-width: 100%; border-radius: 4px; }

@media (max-width: 992px) {
  .warning-row { grid-template-columns: 1fr; }
  .hero { flex-direction: column; align-items: flex-start; }
}
</style>
