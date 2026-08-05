<template>
  <div class="stats-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">商品类型销量统计</span>
          <span class="header-meta">累计销量 {{ total }} 件（已下单/已完成订单）</span>
        </div>
      </div>
      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600 }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column prop="typeName" label="商品分类" min-width="160" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" effect="plain">{{ scope.row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="salesCount" label="销量" min-width="120" align="center" />
        <el-table-column label="占比" min-width="120" align="center">
          <template slot-scope="scope">{{ percentOf(scope.row.salesCount) }}</template>
        </el-table-column>
      </el-table>
      <div ref="chart" class="stats-chart" />
    </el-card>
  </div>
</template>

<script>
import { getTypeSales } from '../../api/statistics';
import echarts from './echarts';

export default {
  name: 'TypeSalesStats',
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
      getTypeSales().then(res => {
        this.tableData = (res.dataList || []).map(r => ({
          typeName: r.categoryName || '未分类',
          salesCount: r.salesCount || 0
        }));
        this.renderChart();
      }).finally(() => {
        this.loading = false;
      });
    },
    percentOf(cnt) {
      if (!this.total) return '0%';
      return (cnt * 100 / this.total).toFixed(1) + '%';
    },
    renderChart() {
      if (!this.chart) return;
      this.chart.setOption({
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 40, right: 20, top: 40, bottom: 30 },
        xAxis: {
          type: 'category',
          data: this.tableData.map(r => r.typeName),
          axisLabel: { interval: 0 }
        },
        yAxis: { type: 'value', name: '销量(件)', minInterval: 1 },
        series: [{
          name: '销量',
          type: 'bar',
          barMaxWidth: 48,
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ])
          },
          label: { show: true, position: 'top' },
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
</style>
