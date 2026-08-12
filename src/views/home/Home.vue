<template>
  <div class="home">
    <!-- 顶部欢迎 + 今日核心指标 -->
    <div class="hero">
      <div class="hero-left">
        <div class="hero-hi">欢迎回来，{{ username }} 👋</div>
        <div class="hero-sub">今日经营概况一览，销售额按商品原价口径统计</div>
      </div>
      <div class="hero-stats">
        <MetricCard icon="el-icon-money" label="今日销售额" :value="overview.todayGmv" prefix="¥" />
        <MetricCard icon="el-icon-s-order" label="今日订单" :value="overview.todayOrderCount" />
        <MetricCard icon="el-icon-box" label="待发货" :value="overview.pendingShipCount" to="/orders"
                    :warn="overview.pendingShipCount > 0" />
        <MetricCard icon="el-icon-service" label="待处理售后" :value="overview.pendingAfterSaleCount" to="/aftersale"
                    :warn="overview.pendingAfterSaleCount > 0" />
      </div>
    </div>

    <!-- 销售趋势 + 待办事项 -->
    <div class="trend-row">
      <el-card class="panel-card trend-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-data-line accent" /> 近 7 天销售趋势</span>
          <el-button type="text" size="mini" @click="go('/stats/monthly-sales')">月度报表 <i class="el-icon-arrow-right" /></el-button>
        </div>
        <div ref="trendChart" class="trend-chart" v-loading="loadingTrend"></div>
      </el-card>

      <el-card class="panel-card todo-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-s-claim accent" /> 待办事项</span>
        </div>
        <div class="todo-list">
          <div class="todo-item" @click="go('/orders')">
            <i class="el-icon-box todo-ico ship" />
            <div class="todo-main">
              <div class="todo-title">待发货订单</div>
              <div class="todo-sub">买家已付款，尽快安排发货</div>
            </div>
            <span class="todo-count" :class="{ zero: !overview.pendingShipCount }">{{ overview.pendingShipCount }}</span>
          </div>
          <div class="todo-item" @click="go('/aftersale')">
            <i class="el-icon-service todo-ico aftersale" />
            <div class="todo-main">
              <div class="todo-title">待审核售后</div>
              <div class="todo-sub">
                <template v-if="pendingAfterSales.length">
                  最新：¥{{ pendingAfterSales[0].refundAmount }}（{{ pendingAfterSales[0].orderNo || '-' }}）
                </template>
                <template v-else>买家发起的退款申请</template>
              </div>
            </div>
            <span class="todo-count" :class="{ zero: !overview.pendingAfterSaleCount }">{{ overview.pendingAfterSaleCount }}</span>
          </div>
          <div class="todo-item" @click="go('/orders')">
            <i class="el-icon-time todo-ico unpaid" />
            <div class="todo-main">
              <div class="todo-title">待付款订单</div>
              <div class="todo-sub">超时未支付将自动取消</div>
            </div>
            <span class="todo-count" :class="{ zero: !overview.unpaidCount }">{{ overview.unpaidCount }}</span>
          </div>
        </div>
        <div class="notice-mini">
          <div class="notice-mini-title"><i class="el-icon-bell" /> 系统通知</div>
          <NoticeCarousel height="132px" />
        </div>
      </el-card>
    </div>

    <div class="warning-row">
      <!-- 商品过期预警 -->
      <el-card class="warn-card theme-e" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-warning-outline" /> 商品过期预警</span>
          <span class="count-badge" :class="{ zero: !expiring.length }">{{ expiring.length }}</span>
        </div>
        <div class="card-sub">三个月内到期商品</div>
        <el-table v-loading="loadingExpiring" :data="expiring" height="252" size="mini"
                  :row-class-name="expireRowClass" class="warn-table">
          <template slot="empty"><div class="empty-box"><i class="el-icon-circle-check" /> 暂无即将过期商品</div></template>
          <el-table-column type="index" label="序号" width="55" align="center" />
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

      <!-- 商品库存预警 -->
      <el-card class="warn-card theme-s" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-goods" /> 商品库存预警</span>
          <span class="count-badge" :class="{ zero: !lowStock.length }">{{ lowStock.length }}</span>
        </div>
        <div class="card-sub">库存低于 100 的商品，点击去补货</div>
        <el-table v-loading="loadingStock" :data="lowStock" height="252" size="mini"
                  :row-class-name="stockRowClass" class="warn-table"
                  @row-click="() => go('/products')">
          <template slot="empty"><div class="empty-box"><i class="el-icon-circle-check" /> 库存充足</div></template>
          <el-table-column type="index" label="序号" width="55" align="center" />
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

      <!-- 本店热销榜 -->
      <el-card class="warn-card theme-h" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-trophy" /> 本店热销 TOP5</span>
          <el-button type="text" size="mini" class="btn-more" @click="go('/products')">管理商品 <i class="el-icon-arrow-right" /></el-button>
        </div>
        <div class="card-sub">按累计销量排行</div>
        <div v-loading="loadingRank" class="rank-list">
          <div v-for="(item, idx) in salesRank" :key="item.pId" class="rank-item">
            <span class="rank-no" :class="idx < 3 ? 'top top-' + (idx + 1) : ''">{{ idx + 1 }}</span>
            <div class="rank-thumb">
              <el-image v-if="item.imageUrl" :src="item.imageUrl" fit="cover" class="thumb-img">
                <div slot="error" class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
              </el-image>
              <div v-else class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
            </div>
            <div class="rank-main">
              <div class="rank-name" :title="item.pName">{{ item.pName || '-' }}</div>
              <div class="rank-price" v-if="item.price != null">¥ {{ item.effectivePrice != null ? item.effectivePrice : item.price }}</div>
            </div>
            <span class="rank-metric"><i class="el-icon-shopping-cart-full" />{{ item.salesCount }}</span>
          </div>
          <div v-if="!loadingRank && !salesRank.length" class="empty-box"><i class="el-icon-info" /> 暂无销量数据</div>
        </div>
      </el-card>
    </div>

    <!-- 待付款超时预警明细 -->
    <el-card class="panel-card order-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title"><i class="el-icon-alarm-clock accent" /> 订单超时预警</span>
        <span class="count-badge warn-badge" :class="{ zero: !timeoutOrders.length }">{{ timeoutOrders.length }}</span>
      </div>
      <div class="card-sub">待付款订单，超时后自动取消并回补库存</div>
      <el-table v-loading="loadingOrders" :data="timeoutOrders" size="mini"
                :row-class-name="orderRowClass" class="warn-table">
        <template slot="empty"><div class="empty-box"><i class="el-icon-circle-check" /> 暂无超时订单</div></template>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="orderNo" label="订单号" min-width="180" show-overflow-tooltip />
        <el-table-column label="金额" width="110" align="center">
          <template slot-scope="s">￥{{ s.row.orderAmount }}</template>
        </el-table-column>
        <el-table-column label="下单时间" min-width="160" align="center">
          <template slot-scope="s">{{ s.row.createTime || '-' }}</template>
        </el-table-column>
        <el-table-column label="倒计时" width="140" align="center">
          <template slot-scope="s">
            <CountdownText :expire-time="s.row.expireTime" />
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import MetricCard from '../../components/home/MetricCard.vue';
import NoticeCarousel from '../../components/home/NoticeCarousel.vue';
import CountdownText from '../../components/home/CountdownText.vue';
import echarts, { CHART_COLORS } from '../statistics/echarts';
import { getExpiringProducts, getLowStockProducts, getTimeoutOrders, getSalesRank, getDashboardOverview, getDailySales } from '../../api/home';
import { queryAfterSale } from '../../api/aftersale';

export default {
  name: 'Home',
  components: { MetricCard, NoticeCarousel, CountdownText },
  data() {
    return {
      overview: { todayGmv: 0, todayOrderCount: 0, pendingShipCount: 0, pendingAfterSaleCount: 0, unpaidCount: 0 },
      dailySales: [],
      pendingAfterSales: [],
      expiring: [],
      lowStock: [],
      timeoutOrders: [],
      salesRank: [],
      loadingTrend: false,
      loadingExpiring: false,
      loadingStock: false,
      loadingOrders: false,
      loadingRank: false,
      now: Date.now(),
      chart: null
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
  },
  mounted() {
    window.addEventListener('resize', this.resizeChart);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeChart);
    if (this.chart) { this.chart.dispose(); this.chart = null; }
  },
  methods: {
    fetchAll() {
      getDashboardOverview().then(res => {
        this.overview = res.daoResult || this.overview;
      }).catch(() => {});
      this.loadingTrend = true;
      getDailySales(7).then(res => {
        this.dailySales = res.dataList || [];
        this.$nextTick(this.renderTrend);
      }).catch(() => {}).finally(() => { this.loadingTrend = false; });
      queryAfterSale({ status: 0, pageNo: 1, pageSize: 3 }).then(res => {
        this.pendingAfterSales = (res.daoResult || {}).records || [];
      }).catch(() => {});
      this.loadingExpiring = true;
      getExpiringProducts().then(res => { this.expiring = res.dataList || []; })
        .catch(() => {}).finally(() => { this.loadingExpiring = false; });
      this.loadingStock = true;
      getLowStockProducts().then(res => { this.lowStock = res.dataList || []; })
        .catch(() => {}).finally(() => { this.loadingStock = false; });
      this.loadingOrders = true;
      getTimeoutOrders().then(res => { this.timeoutOrders = res.dataList || []; })
        .catch(() => {}).finally(() => { this.loadingOrders = false; });
      this.loadingRank = true;
      getSalesRank(5).then(res => { this.salesRank = res.dataList || []; })
        .catch(() => {}).finally(() => { this.loadingRank = false; });
    },
    renderTrend() {
      const el = this.$refs.trendChart;
      if (!el) return;
      if (!this.chart) this.chart = echarts.init(el);
      const dates = this.dailySales.map(d => (d.date || '').slice(5));
      this.chart.setOption({
        color: CHART_COLORS,
        tooltip: { trigger: 'axis' },
        legend: { data: ['销售额', '订单量'], top: 0 },
        grid: { left: 10, right: 10, top: 36, bottom: 4, containLabel: true },
        xAxis: { type: 'category', data: dates, axisTick: { alignWithLabel: true } },
        yAxis: [
          { type: 'value', name: '销售额(元)', splitLine: { lineStyle: { type: 'dashed' } } },
          { type: 'value', name: '订单量', minInterval: 1, splitLine: { show: false } }
        ],
        series: [
          {
            name: '销售额', type: 'line', smooth: true, symbolSize: 7,
            data: this.dailySales.map(d => d.gmv),
            areaStyle: { opacity: 0.12 }
          },
          {
            name: '订单量', type: 'bar', yAxisIndex: 1, barWidth: 18,
            itemStyle: { borderRadius: [4, 4, 0, 0], opacity: 0.85 },
            data: this.dailySales.map(d => d.orderCount)
          }
        ]
      });
    },
    resizeChart() {
      if (this.chart) this.chart.resize();
    },
    go(path) {
      this.$router.push(path).catch(() => {});
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
      if (!row.expireTime) return '';
      const ts = new Date(String(row.expireTime).replace(/-/g, '/')).getTime();
      return ts - Date.now() <= 0 ? 'row-danger' : '';
    },
    stockPct(stock) {
      return Math.max(6, Math.min(100, (Number(stock) || 0)));
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
  margin-bottom: 18px;
  border-radius: 16px;
  color: #fff;
  overflow: hidden;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 55%, var(--color-primary) 100%);
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
.hero-stats { position: relative; z-index: 1; display: flex; gap: 14px; flex-wrap: wrap; }

/* 通用卡片 */
.accent { color: var(--color-primary); }
.panel-card {
  border-radius: 14px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.card-title i { margin-right: 6px; }
.card-sub { font-size: 12px; color: #a0a4ac; margin: 0 0 10px 2px; }

/* 趋势 + 待办 */
.trend-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  margin-bottom: 18px;
}
.trend-chart { height: 316px; }
.todo-list { display: flex; flex-direction: column; gap: 10px; }
.todo-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #f7f8fc;
  border: 1px solid #eef0f5;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.todo-item:hover { transform: translateY(-2px); box-shadow: 0 6px 14px rgba(30, 60, 114, 0.12); background: #fff; }
.todo-ico { font-size: 20px; }
.todo-ico.ship { color: var(--color-primary); }
.todo-ico.aftersale { color: #e6a23c; }
.todo-ico.unpaid { color: #f56c6c; }
.todo-main { flex: 1; min-width: 0; }
.todo-title { font-size: 13px; font-weight: 600; color: #2d3748; }
.todo-sub { font-size: 12px; color: #8a93a4; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.todo-count {
  min-width: 26px;
  padding: 2px 9px;
  border-radius: 11px;
  text-align: center;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: var(--gradient-brand);
  font-family: var(--font-mono);
}
.todo-count.zero { background: #cbd2de; }
.notice-mini { margin-top: 14px; }
.notice-mini-title { font-size: 13px; font-weight: 600; color: #2d3748; margin-bottom: 8px; }
.notice-mini-title i { color: var(--color-primary); margin-right: 4px; }

/* 预警卡片 */
.warning-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 18px;
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
.warn-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 4px;
}
.theme-e::before { background: linear-gradient(90deg, #f5b76b, #e6a23c); }
.theme-s::before { background: linear-gradient(90deg, #79bbff, #409eff); }
.theme-h::before { background: linear-gradient(90deg, var(--color-primary), var(--color-primary-dark)); }
.theme-e .card-title i { color: #e6a23c; }
.theme-s .card-title i { color: #409eff; }
.theme-h .card-title i { color: var(--color-primary); }
.warn-card .card-sub { margin-left: 24px; }

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
  font-family: var(--font-mono);
}
.theme-e .count-badge { background: #e6a23c; }
.theme-s .count-badge { background: #409eff; }
.warn-badge { background: #f56c6c; }
.count-badge.zero { background: #c8ccd4; }
.btn-more { padding: 0; color: var(--color-primary); font-weight: 600; }

/* 表格 */
.warn-table >>> th.el-table__cell { background: #fafbfc; color: #606266; font-weight: 600; }
.warn-table >>> .row-danger td.el-table__cell { background: #fff5f5 !important; }
.warn-table >>> .el-table__row:hover > td.el-table__cell { background: #f2f6fc !important; }
.empty-box { color: #b3b8c2; font-size: 13px; padding: 18px 0; text-align: center; }
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

/* 热销榜 */
.rank-list { min-height: 252px; }
.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 7px 6px;
  border-radius: 10px;
}
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
.rank-thumb { flex-shrink: 0; width: 38px; height: 38px; border-radius: 8px; overflow: hidden; background: #f3f5fa; }
.thumb-img { width: 100%; height: 100%; display: block; }
.thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c3cad8;
  font-size: 17px;
}
.rank-main { flex: 1; min-width: 0; }
.rank-name { font-size: 13px; font-weight: 500; color: #2d3748; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.rank-price { margin-top: 2px; font-size: 12px; color: #f56c6c; font-weight: 600; }
.rank-metric { flex-shrink: 0; font-size: 13px; font-weight: 700; color: var(--color-primary); font-family: var(--font-mono); }
.rank-metric i { margin-right: 4px; }

.order-card { margin-bottom: 18px; }
.order-card >>> .el-card__header { border-bottom: none; padding: 14px 18px 6px; }
.order-card >>> .el-card__body { padding: 0 18px 16px; }

@media (max-width: 992px) {
  .trend-row, .warning-row { grid-template-columns: 1fr; }
  .hero { flex-direction: column; align-items: flex-start; }
}
</style>
