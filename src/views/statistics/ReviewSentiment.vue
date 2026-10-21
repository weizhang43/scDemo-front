<template>
  <div class="review-sentiment list-page">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">评论情感分析</span>
          <span class="header-meta">AI 自动分析商品评价情感倾向</span>
        </div>
        <div class="header-actions">
          <el-button size="small" icon="el-icon-refresh" @click="loadData">刷新分析</el-button>
        </div>
      </div>

      <el-row :gutter="16" class="metric-row">
        <el-col :xs="12" :sm="6">
          <div class="metric-card metric-card--total">
            <div class="metric-label">分析评论</div>
            <div class="metric-value">{{ data.totalRaw || 0 }}<small>（采样 {{ data.total || 0 }}）</small></div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="metric-card metric-card--positive">
            <div class="metric-label">好评</div>
            <div class="metric-value">{{ data.positive || 0 }}</div>
            <div class="metric-rate">{{ positiveRate }}%</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="metric-card metric-card--neutral">
            <div class="metric-label">中性</div>
            <div class="metric-value">{{ data.neutral || 0 }}</div>
            <div class="metric-rate">{{ neutralRate }}%</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6">
          <div class="metric-card metric-card--negative">
            <div class="metric-label">差评</div>
            <div class="metric-value">{{ data.negative || 0 }}</div>
            <div class="metric-rate">{{ negativeRate }}%</div>
          </div>
        </el-col>
      </el-row>

      <div ref="chart" class="chart" />

      <el-alert v-if="data.summary" type="info" :closable="false" class="summary-alert">
        <template slot="title"><i class="el-icon-magic-stick" /> AI 总结</template>
        <div>{{ data.summary }}</div>
      </el-alert>

      <div class="samples-title">评论样本</div>
      <el-table :data="samples" border stripe empty-text="暂无评论样本" class="samples-table">
        <el-table-column prop="pName" label="商品" min-width="160" align="left" show-overflow-tooltip />
        <el-table-column label="评分" width="80" align="center">
          <template slot-scope="scope">
            <span class="stars">{{ '★'.repeat(scope.row.rating) }}{{ '☆'.repeat(5 - scope.row.rating) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="情感" width="100" align="center">
          <template slot-scope="scope">
            <el-tag :type="labelTagType(scope.row.label)" size="small" effect="light">{{ labelText(scope.row.label) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="content" label="内容" min-width="280" align="left" show-overflow-tooltip />
      </el-table>
    </el-card>
  </div>
</template>

<script>
import request from '../../utils/request';
import * as echarts from 'echarts';

export function getReviewSentiment() {
  return request({ url: '/order/ai/review-sentiment', method: 'get' });
}

const LABEL_TEXT = { positive: '好评', negative: '差评', neutral: '中性' };

export default {
  name: 'ReviewSentiment',
  data() {
    return {
      loading: false,
      data: {},
      chart: null
    };
  },
  computed: {
    samples() { return this.data.samples || []; },
    positiveRate() {
      const total = Number(this.data.total) || 0;
      if (!total) return 0;
      return Math.round(((this.data.positive || 0) * 100) / total);
    },
    negativeRate() {
      const total = Number(this.data.total) || 0;
      if (!total) return 0;
      return Math.round(((this.data.negative || 0) * 100) / total);
    },
    neutralRate() {
      const total = Number(this.data.total) || 0;
      if (!total) return 0;
      return Math.round(((this.data.neutral || 0) * 100) / total);
    }
  },
  mounted() {
    this.loadData();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.chart) this.chart.dispose();
  },
  methods: {
    labelText(label) { return LABEL_TEXT[label] || '中性'; },
    labelTagType(label) {
      if (label === 'positive') return 'success';
      if (label === 'negative') return 'danger';
      return 'info';
    },
    handleResize() { if (this.chart) this.chart.resize(); },
    loadData() {
      this.loading = true;
      getReviewSentiment()
        .then(res => {
          this.data = (res && res.daoResult) || {};
          this.$nextTick(this.renderChart);
        })
        .catch(() => {})
        .finally(() => { this.loading = false; });
    },
    renderChart() {
      if (!this.$refs.chart) return;
      if (!this.chart) this.chart = echarts.init(this.$refs.chart);
      const positive = this.data.positive || 0;
      const negative = this.data.negative || 0;
      const neutral = this.data.neutral || 0;
      this.chart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
        legend: { bottom: 0, icon: 'circle' },
        color: ['#67c23a', '#909399', '#f56c6c'],
        series: [{
          type: 'pie',
          radius: ['38%', '62%'],
          center: ['50%', '42%'],
          avoidLabelOverlap: true,
          label: { formatter: '{b}\n{d}%' },
          data: [
            { value: positive, name: '好评' },
            { value: neutral, name: '中性' },
            { value: negative, name: '差评' }
          ]
        }]
      });
    }
  }
};
</script>

<style scoped>
.metric-row { margin-bottom: 16px; }
.metric-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 14px;
}
.metric-card--total { background: linear-gradient(120deg, #1e3c72, #2a5298); color: #fff; }
.metric-card--positive { border-color: #e1f3d8; background: #f0f9eb; }
.metric-card--neutral { border-color: #f4f4f5; background: #f9fafc; }
.metric-card--negative { border-color: #fde2e2; background: #fef0f0; }
.metric-label { font-size: 12px; color: #8c97ad; }
.metric-card--total .metric-label { color: rgba(255,255,255,0.8); }
.metric-value { font-size: 26px; font-weight: 700; margin-top: 4px; color: #1f2733; font-variant-numeric: tabular-nums; }
.metric-card--total .metric-value { color: #fff; }
.metric-card--total .metric-value small { font-size: 12px; opacity: 0.8; font-weight: 500; margin-left: 4px; }
.metric-rate { font-size: 12px; color: #8c97ad; margin-top: 2px; }
.chart { width: 100%; height: 280px; margin-bottom: 16px; }
.summary-alert { margin-bottom: 16px; }
.samples-title { font-size: 14px; font-weight: 600; color: #1e3c72; margin: 14px 0 10px; }
.samples-table .stars { color: #f7ba2a; letter-spacing: 1px; }
</style>
