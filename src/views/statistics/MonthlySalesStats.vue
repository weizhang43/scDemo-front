<template>
  <div class="stats-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">近三个月每月销量统计</span>
          <span class="header-meta">累计销量 {{ total }} 件（已下单/已完成订单）</span>
        </div>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f5f6fd', color: '#3b3f63', fontWeight: 600 }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="month" label="月份" min-width="160" align="center" />
        <el-table-column prop="salesCount" label="销量" min-width="120" align="center" />
        <el-table-column label="环比" min-width="120" align="center">
          <template slot-scope="scope">
            <span :class="momClass(scope.$index)">{{ momText(scope.$index) }}</span>
          </template>
        </el-table-column>
      </el-table>
      <div ref="chart" class="stats-chart" />
    </el-card>
  </div>
</template>

<script>
import { getMonthlySales } from '../../api/statistics';
import echarts from './echarts';

export default {
  name: 'MonthlySalesStats',
  data() {
    return {
      loading: false,
      tableData: []
    };
  },
  computed: {
    total() {
      return this.tableData.reduce((sum, r) => sum + r.salesCount, 0);
    }
  },
  created() {
    this.fetchData();
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart);
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    if (this.chart) {
      this.chart.dispose();
      this.chart = null;
    }
  },
  methods: {
    fetchData() {
      this.loading = true;
      getMonthlySales().then(res => {
        this.tableData = (res.dataList || []).map(row => ({
          month: row.month,
          salesCount: row.salesCount || 0
        }));
        this.renderChart();
      }).finally(() => {
        this.loading = false;
      });
    },
    momText(index) {
      if (index === 0) return '—';
      const prev = this.tableData[index - 1].salesCount;
      const cur = this.tableData[index].salesCount;
      if (!prev) return cur > 0 ? '+∞' : '—';
      const rate = ((cur - prev) * 100 / prev).toFixed(1);
      return (rate > 0 ? '+' : '') + rate + '%';
    },
    momClass(index) {
      if (index === 0) return '';
      const prev = this.tableData[index - 1].salesCount;
      const cur = this.tableData[index].salesCount;
      if (cur > prev) return 'mom-up';
      if (cur < prev) return 'mom-down';
      return '';
    },
    renderChart() {
      if (!this.chart) return;
      this.chart.setOption({
        tooltip: { trigger: 'axis' },
        grid: { left: 40, right: 30, top: 40, bottom: 30 },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.tableData.map(r => r.month)
        },
        yAxis: { type: 'value', name: '销量(件)', minInterval: 1 },
        series: [{
          name: '月销量',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { width: 3, color: '#667eea' },
          itemStyle: { color: '#764ba2' },
          label: { show: true, position: 'top' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(102, 126, 234, 0.35)' },
              { offset: 1, color: 'rgba(118, 75, 162, 0.05)' }
            ])
          },
          data: this.tableData.map(r => r.salesCount)
        }]
      });
    },
    handleResize() {
      if (this.chart) this.chart.resize();
    }
  }
};
</script>

<style scoped>
.stats-page >>> .el-card {
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.1);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.card-title {
  position: relative;
  padding-left: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}
.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: linear-gradient(180deg, #667eea, #764ba2);
}
.header-meta {
  font-size: 12px;
  color: #667eea;
  background: #eef0ff;
  padding: 2px 10px;
  border-radius: 10px;
}
.stats-chart {
  height: 380px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px dashed #e4e7ed;
}
.mom-up {
  color: #f56c6c;
  font-weight: 600;
}
.mom-down {
  color: #67c23a;
  font-weight: 600;
}
</style>
