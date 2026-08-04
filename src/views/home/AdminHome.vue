<template>
  <div class="admin-home">
    <!-- 顶部欢迎 + 概览 -->
    <div class="hero">
      <div class="hero-left">
        <div class="hero-hi">欢迎回来，{{ username }} 👋</div>
        <div class="hero-sub">这里是系统管理概览，掌握用户、订单与运行动态</div>
      </div>
      <div class="hero-stats">
        <div class="stat" @click="go('/system/users')">
          <i class="el-icon-user stat-ico" />
          <div class="stat-num">{{ display.user }}</div>
          <div class="stat-label">用户总数</div>
        </div>
        <div class="stat" @click="go('/orders')">
          <i class="el-icon-s-order stat-ico" />
          <div class="stat-num">{{ display.order }}</div>
          <div class="stat-label">订单总数</div>
        </div>
        <div class="stat" @click="go('/notices')">
          <i class="el-icon-bell stat-ico" />
          <div class="stat-num">{{ display.notice }}</div>
          <div class="stat-label">发布通知</div>
        </div>
        <div class="stat" @click="go('/logs')">
          <i class="el-icon-document stat-ico" />
          <div class="stat-num">{{ display.log }}</div>
          <div class="stat-label">操作日志</div>
        </div>
      </div>
    </div>

    <div class="mid-row">
      <!-- 订单状态分布 -->
      <el-card class="panel-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-data-line accent-blue" /> 订单状态分布</span>
          <span class="header-meta">共 {{ orderTotal }} 单</span>
        </div>
        <div class="status-list">
          <div v-for="s in orderStatusList" :key="s.key" class="status-item">
            <span class="status-label">
              <el-tag size="mini" :type="s.type" effect="plain">{{ s.label }}</el-tag>
            </span>
            <div class="status-bar">
              <span :class="['status-bar-fill', 'bar-' + s.type]" :style="{ width: statusPct(s.count) + '%' }" />
            </div>
            <span class="status-count">{{ s.count }}</span>
          </div>
        </div>
      </el-card>

      <!-- 系统通知 -->
      <el-card class="panel-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-bell accent-blue" /> 系统通知</span>
          <el-button type="text" size="mini" @click="go('/notices')">管理通知 <i class="el-icon-arrow-right" /></el-button>
        </div>
        <el-carousel
          v-if="notices.length"
          height="180px"
          :interval="4000"
          arrow="hover"
          indicator-position="inside"
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
        <el-empty v-else description="暂无通知" :image-size="70" />
      </el-card>

      <!-- 快捷入口 -->
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
    </div>

    <!-- 最近操作日志 -->
    <el-card class="log-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title"><i class="el-icon-document accent-blue" /> 最近操作日志</span>
        <el-button type="text" size="mini" @click="go('/logs')">查看全部 <i class="el-icon-arrow-right" /></el-button>
      </div>
      <el-table v-loading="loadingLogs" :data="recentLogs" size="mini" class="log-table">
        <template slot="empty"><div class="empty-box"><i class="el-icon-circle-check" /> 暂无操作日志</div></template>
        <el-table-column prop="uName" label="操作人" width="120" align="center" />
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

    <!-- 通知详情 -->
    <el-dialog :title="current.title" :visible.sync="detailVisible" width="680px" top="8vh">
      <div class="notice-detail" v-html="current.content"></div>
    </el-dialog>
  </div>
</template>

<script>
import { getPublishedNotices, getNoticePage } from '../../api/notice';
import { getOperationLogPage } from '../../api/log';
import { getUserList } from '../../api/user';
import { orderStatusCount } from '../../api/order';

const ORDER_STATUS = [
  { key: '0', label: '待支付', type: 'warning' },
  { key: '1', label: '待签收', type: 'primary' },
  { key: '2', label: '已完成', type: 'success' },
  { key: '-1', label: '已取消', type: 'info' }
];

export default {
  name: 'AdminHome',
  data() {
    return {
      notices: [],
      statusCounts: {},
      recentLogs: [],
      loadingLogs: false,
      detailVisible: false,
      current: { title: '', content: '' },
      display: { user: 0, order: 0, notice: 0, log: 0 },
      quickLinks: [
        { path: '/system/users', label: '用户列表', icon: 'el-icon-user', color: '#409eff' },
        { path: '/system/roles', label: '角色列表', icon: 'el-icon-s-check', color: '#67c23a' },
        { path: '/system/modules', label: '权限列表', icon: 'el-icon-set-up', color: '#e6a23c' },
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
    orderStatusList() {
      return ORDER_STATUS.map(s => ({ ...s, count: Number(this.statusCounts[s.key]) || 0 }));
    },
    orderTotal() {
      return this.orderStatusList.reduce((sum, s) => sum + s.count, 0);
    }
  },
  created() {
    this.fetchAll();
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
      getUserList({ pageNo: 1, pageSize: 1 })
        .then(res => this.countTo('user', (res.daoResult || {}).total || 0)).catch(() => {});
      orderStatusCount({})
        .then(res => {
          this.statusCounts = res.daoResult || {};
          this.countTo('order', this.orderTotal);
        }).catch(() => {});
      getNoticePage({ pageNum: 1, pageSize: 1, status: 1 })
        .then(res => this.countTo('notice', (res.daoResult || {}).total || 0)).catch(() => {});
      getPublishedNotices()
        .then(res => { this.notices = res.dataList || []; }).catch(() => {});
      this.loadingLogs = true;
      getOperationLogPage({ pageNum: 1, pageSize: 10 })
        .then(res => {
          const page = res.daoResult || {};
          this.recentLogs = page.records || [];
          this.countTo('log', page.total || 0);
        })
        .catch(() => {})
        .finally(() => { this.loadingLogs = false; });
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
    statusPct(count) {
      if (!this.orderTotal) return 0;
      return Math.max(2, Math.round((count / this.orderTotal) * 100));
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
  min-width: 92px;
  padding: 12px 16px;
  text-align: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.stat:hover { transform: translateY(-3px); background: rgba(255, 255, 255, 0.24); }
.stat-ico { font-size: 15px; opacity: 0.7; }
.stat-num { font-size: 26px; font-weight: 700; line-height: 1.15; }
.stat-label { font-size: 12px; opacity: 0.85; margin-top: 2px; }

/* 卡片通用 */
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: 15px; font-weight: 600; color: #2d3748; display: flex; align-items: center; gap: 6px; }
.header-meta { font-size: 12px; color: #909399; }
.accent-blue { color: #2a5298; }

.mid-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  margin-bottom: 20px;
}
.panel-card {
  border-radius: 14px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.panel-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12); }
.panel-card >>> .el-card__body { min-height: 200px; }

/* 订单状态分布 */
.status-list { display: flex; flex-direction: column; gap: 16px; padding-top: 6px; }
.status-item { display: flex; align-items: center; gap: 10px; }
.status-label { width: 68px; flex-shrink: 0; }
.status-bar { flex: 1; height: 8px; border-radius: 4px; background: #eef0f3; overflow: hidden; }
.status-bar-fill { display: block; height: 100%; border-radius: 4px; transition: width 0.5s ease; }
.bar-warning { background: linear-gradient(90deg, #f5b76b, #e6a23c); }
.bar-primary { background: linear-gradient(90deg, #79bbff, #409eff); }
.bar-success { background: linear-gradient(90deg, #95d475, #67c23a); }
.bar-info { background: linear-gradient(90deg, #c8ccd4, #909399); }
.status-count { min-width: 36px; text-align: right; font-weight: 700; font-size: 13px; color: #4a5568; }

/* 通知轮播 */
.carousel-slide {
  height: 100%;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}
.carousel-mask {
  width: 100%;
  padding: 12px 16px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  color: #fff;
}
.carousel-title { font-size: 15px; font-weight: 600; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); }
.carousel-time { font-size: 12px; opacity: 0.85; margin-top: 4px; }

/* 快捷入口 */
.quick-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-top: 4px; }
.quick-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 14px 6px;
  border-radius: 10px;
  background: #f7f8fc;
  border: 1px solid #eef0f5;
  font-size: 13px;
  color: #4a5568;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
}
.quick-item:hover {
  background: #fff;
  transform: translateY(-2px);
  box-shadow: 0 6px 14px rgba(30, 60, 114, 0.12);
}
.quick-ico { font-size: 22px; }

/* 日志卡片 */
.log-card {
  border-radius: 14px;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
}
.log-table >>> th.el-table__cell { background: #fafbfc; color: #606266; font-weight: 600; }
.log-table >>> .el-table__row:hover > td.el-table__cell { background: #f2f6fc !important; }
.empty-box { color: #b3b8c2; font-size: 13px; padding: 18px 0; }
.empty-box i { color: #67c23a; margin-right: 4px; }

.notice-detail { max-height: 62vh; overflow: auto; line-height: 1.75; color: #303133; }
.notice-detail >>> img { max-width: 100%; border-radius: 4px; }

@media (max-width: 992px) {
  .mid-row { grid-template-columns: 1fr; }
  .hero { flex-direction: column; align-items: flex-start; }
}
</style>
