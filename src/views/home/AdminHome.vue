<template>
  <div class="admin-home">
    <!-- 顶部欢迎 + 今日核心指标 -->
    <div class="hero">
      <div class="hero-left">
        <div class="hero-hi">欢迎回来，{{ username }} 👋</div>
        <div class="hero-sub">平台运营驾驶舱 · 实时掌握交易、用户与系统动态</div>
        <div class="hero-chips">
          <span class="chip" @click="go('/system/users')"><i class="el-icon-user" /> 累计用户 {{ userOverview.totalUsers || 0 }}</span>
          <span class="chip chip-static"><i class="el-icon-s-order" /> 订单总数 {{ orderTotal }}</span>
        </div>
      </div>
      <div class="hero-stats">
        <MetricCard icon="el-icon-money" label="今日成交额" :value="overview.todayGmv" prefix="¥" />
        <MetricCard icon="el-icon-s-order" label="今日订单" :value="overview.todayOrderCount" />
        <MetricCard icon="el-icon-user" label="今日新增用户" :value="userOverview.todayNewUsers" to="/system/users" />
        <MetricCard
          icon="el-icon-service"
          label="待处理售后"
          :value="overview.pendingAfterSaleCount"
          :warn="Number(overview.pendingAfterSaleCount) > 0"
        />
      </div>
    </div>

    <!-- 平台趋势 + 订单状态分布 -->
    <div class="trend-row">
      <el-card class="panel-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-data-line accent-blue" /> 平台成交趋势（近 7 天）</span>
          <span class="header-meta">实付口径，含已支付/已发货/已完成</span>
        </div>
        <div ref="trendChart" class="chart-box" v-loading="loadingTrend" />
      </el-card>

      <el-card class="panel-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-pie-chart accent-blue" /> 订单状态分布</span>
          <span class="header-meta">共 {{ orderTotal }} 单</span>
        </div>
        <div ref="statusChart" class="chart-box" />
      </el-card>
    </div>

    <!-- 用户构成 + 快捷入口 + 系统通知 -->
    <div class="mid-row">
      <el-card class="panel-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-user accent-blue" /> 用户构成</span>
          <span class="header-meta">共 {{ userOverview.totalUsers || 0 }} 人</span>
        </div>
        <div ref="userChart" class="chart-box-sm" />
      </el-card>

      <el-card class="panel-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-menu accent-blue" /> 快捷入口</span>
        </div>
        <div class="quick-grid">
          <div v-for="q in quickLinks" :key="q.path" class="quick-item" @click="go(q.path)">
            <i :class="[q.icon, 'quick-ico']" :style="{ color: q.color }" />
            <span>{{ q.label }}</span>
          </div>
        </div>
      </el-card>

      <el-card class="panel-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-bell accent-blue" /> 系统通知</span>
          <el-button type="text" size="mini" @click="go('/notices')">管理通知 <i class="el-icon-arrow-right" /></el-button>
        </div>
        <NoticeCarousel height="180px" />
      </el-card>
    </div>

    <!-- 最近操作日志 -->
    <el-card class="log-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title"><i class="el-icon-document accent-blue" /> 最近操作日志</span>
        <el-button type="text" size="mini" @click="go('/logs')">查看全部 <i class="el-icon-arrow-right" /></el-button>
      </div>
      <el-table v-loading="loadingLogs" :data="recentLogs" size="mini" class="log-table">
        <template slot="empty"><div class="empty-box"><i class="el-icon-circle-check" /> 暂无操作日志</div></template>
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column label="操作人" width="120" align="center">
          <template slot-scope="s">{{ s.row.realName || s.row.uName || '-' }}</template>
        </el-table-column>
        <el-table-column prop="module" label="模块" width="120" align="center" />
        <el-table-column prop="opType" label="操作类型" width="110" align="center" />
        <el-table-column prop="description" label="操作描述" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="结果" width="90" align="center">
          <template slot-scope="s">
            <el-tag size="mini" :type="s.row.status === 1 ? 'success' : 'danger'" effect="light">
              {{ s.row.status === 1 ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="操作时间" width="170" align="center">
          <template slot-scope="s">{{ formatTime(s.row.createTime) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
import { getOperationLogPage } from '../../api/log';
import { orderStatusCount } from '../../api/order';
import { getDashboardOverview, getDailySales, getUserOverview } from '../../api/home';
import MetricCard from '../../components/home/MetricCard.vue';
import NoticeCarousel from '../../components/home/NoticeCarousel.vue';
import echarts, { CHART_COLORS } from '../statistics/echarts';

const ORDER_STATUS = [
  { key: '0', label: '待付款' },
  { key: '1', label: '待发货' },
  { key: '3', label: '已发货' },
  { key: '2', label: '已完成' },
  { key: '-1', label: '已取消' }
];

export default {
  name: 'AdminHome',
  components: { MetricCard, NoticeCarousel },
  data() {
    return {
      overview: {},
      userOverview: {},
      statusCounts: {},
      recentLogs: [],
      loadingLogs: false,
      loadingTrend: false,
      quickLinks: [
        { path: '/system/users', label: '用户列表', icon: 'el-icon-user', color: '#409eff' },
        { path: '/system/roles', label: '角色列表', icon: 'el-icon-s-check', color: '#67c23a' },
        { path: '/system/modules', label: '权限列表', icon: 'el-icon-set-up', color: '#e6a23c' },
        { path: '/categories', label: '分类管理', icon: 'el-icon-menu', color: '#667eea' },
        { path: '/coupon-templates', label: '优惠券', icon: 'el-icon-s-ticket', color: '#764ba2' },
        { path: '/jobs', label: '定时任务', icon: 'el-icon-time', color: '#f56c6c' },
        { path: '/notices', label: '通知管理', icon: 'el-icon-bell', color: '#9c6ade' },
        { path: '/logs', label: '日志管理', icon: 'el-icon-document', color: '#2a5298' }
      ]
    };
  },
  computed: {
    username() {
      const user = this.$store.state.userInfo || {};
      return user.realName || user.uName || '管理员';
    },
    orderTotal() {
      return ORDER_STATUS.reduce((sum, s) => sum + (Number(this.statusCounts[s.key]) || 0), 0);
    }
  },
  created() {
    this.fetchAll();
  },
  mounted() {
    window.addEventListener('resize', this.onResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
    ['trendChartIns', 'statusChartIns', 'userChartIns'].forEach(k => {
      if (this[k]) { this[k].dispose(); this[k] = null; }
    });
  },
  methods: {
    formatTime(t) {
      if (!t) return '-';
      if (typeof t === 'string') return t.replace('T', ' ').substring(0, 19);
      const d = new Date(t);
      const pad = n => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },
    fetchAll() {
      getDashboardOverview()
        .then(res => { this.overview = res.daoResult || {}; })
        .catch(() => {});
      getUserOverview()
        .then(res => {
          this.userOverview = res.daoResult || {};
          this.renderUserChart();
        })
        .catch(() => {});
      orderStatusCount({})
        .then(res => {
          this.statusCounts = res.daoResult || {};
          this.renderStatusChart();
        })
        .catch(() => {});
      this.loadingTrend = true;
      getDailySales(7)
        .then(res => this.renderTrendChart(res.dataList || []))
        .catch(() => {})
        .finally(() => { this.loadingTrend = false; });
      this.loadingLogs = true;
      getOperationLogPage({ pageNum: 1, pageSize: 8 })
        .then(res => { this.recentLogs = (res.daoResult || {}).records || []; })
        .catch(() => {})
        .finally(() => { this.loadingLogs = false; });
    },
    renderTrendChart(list) {
      const el = this.$refs.trendChart;
      if (!el) return;
      if (!this.trendChartIns) this.trendChartIns = echarts.init(el);
      this.trendChartIns.setOption({
        color: CHART_COLORS,
        tooltip: { trigger: 'axis' },
        legend: { data: ['成交额', '订单量'], top: 0 },
        grid: { left: 10, right: 10, top: 32, bottom: 0, containLabel: true },
        xAxis: { type: 'category', data: list.map(d => (d.date || '').slice(5)), axisTick: { alignWithLabel: true } },
        yAxis: [
          { type: 'value', name: '成交额', axisLabel: { formatter: '¥{value}' }, splitLine: { lineStyle: { type: 'dashed' } } },
          { type: 'value', name: '订单量', minInterval: 1, splitLine: { show: false } }
        ],
        series: [
          {
            name: '成交额',
            type: 'line',
            smooth: true,
            symbolSize: 6,
            areaStyle: { opacity: 0.12 },
            data: list.map(d => Number(d.gmv) || 0)
          },
          {
            name: '订单量',
            type: 'bar',
            yAxisIndex: 1,
            barWidth: 16,
            itemStyle: { borderRadius: [4, 4, 0, 0] },
            data: list.map(d => Number(d.orderCount) || 0)
          }
        ]
      });
    },
    renderStatusChart() {
      const el = this.$refs.statusChart;
      if (!el) return;
      if (!this.statusChartIns) this.statusChartIns = echarts.init(el);
      const data = ORDER_STATUS.map(s => ({ name: s.label, value: Number(this.statusCounts[s.key]) || 0 }));
      this.statusChartIns.setOption({
        color: CHART_COLORS,
        tooltip: { trigger: 'item', formatter: '{b}：{c} 单（{d}%）' },
        legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8 },
        series: [{
          type: 'pie',
          radius: ['48%', '70%'],
          center: ['50%', '44%'],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontWeight: 700, formatter: '{b}\n{c} 单' } },
          data
        }]
      });
    },
    renderUserChart() {
      const el = this.$refs.userChart;
      if (!el) return;
      if (!this.userChartIns) this.userChartIns = echarts.init(el);
      const u = this.userOverview;
      this.userChartIns.setOption({
        color: CHART_COLORS,
        tooltip: { trigger: 'item', formatter: '{b}：{c} 人（{d}%）' },
        legend: { bottom: 0, icon: 'circle', itemWidth: 8, itemHeight: 8 },
        series: [{
          type: 'pie',
          radius: ['48%', '70%'],
          center: ['50%', '44%'],
          itemStyle: { borderColor: '#fff', borderWidth: 2 },
          label: { show: false },
          emphasis: { label: { show: true, fontWeight: 700, formatter: '{b}\n{c} 人' } },
          data: [
            { name: '顾客', value: Number(u.customerCount) || 0 },
            { name: '商家', value: Number(u.merchantCount) || 0 },
            { name: '管理员', value: Number(u.adminCount) || 0 }
          ]
        }]
      });
    },
    onResize() {
      ['trendChartIns', 'statusChartIns', 'userChartIns'].forEach(k => {
        if (this[k]) this[k].resize();
      });
    },
    go(path) {
      this.$router.push(path).catch(() => {});
    }
  }
};
</script>

<style scoped>
.admin-home { max-width: 1280px; margin: 0 auto; }

/* 顶部欢迎条（与商家首页同风格） */
.hero {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 24px 28px;
  margin-bottom: 20px;
  border-radius: var(--radius-lg);
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
.hero-chips { margin-top: 12px; display: flex; gap: 10px; flex-wrap: wrap; }
.chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 12px;
  font-size: 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.chip:hover { background: rgba(255, 255, 255, 0.26); }
.chip-static { cursor: default; }
.chip-static:hover { background: rgba(255, 255, 255, 0.14); }
.hero-stats { position: relative; z-index: 1; display: flex; gap: 14px; flex-wrap: wrap; }

/* 卡片通用 */
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { display: flex; align-items: center; gap: 6px; font-size: var(--font-card-title); font-weight: 600; }
.accent-blue { color: #2a5298; }
.header-meta { font-size: 12px; color: #909399; }

.trend-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 18px;
  margin-bottom: 20px;
}
.mid-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}
.panel-card {
  border-radius: var(--radius-card);
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.panel-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12); }

.chart-box { height: 280px; }
.chart-box-sm { height: 210px; }

/* 快捷入口 */
.quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; padding-top: 2px; }
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  padding: 12px 4px;
  border-radius: var(--radius-md);
  background: #f7f8fc;
  border: 1px solid #eef0f5;
  font-size: 12px;
  color: #4a5568;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}
.quick-item:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(30, 60, 114, 0.12);
}
.quick-ico { font-size: 20px; }

/* 日志卡片 */
.log-card {
  border-radius: var(--radius-card);
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.log-table >>> th.el-table__cell { background: #fafbfc; color: #606266; font-weight: 600; }
.log-table >>> .el-table__row:hover > td.el-table__cell { background: #f2f6fc !important; }
.empty-box { color: #b3b8c2; font-size: 13px; padding: 18px 0; }
.empty-box i { color: #67c23a; margin-right: 4px; }

@media (max-width: 992px) {
  .trend-row, .mid-row { grid-template-columns: 1fr; }
  .hero { flex-direction: column; align-items: flex-start; }
}
</style>
