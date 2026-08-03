<template>
  <div class="stats-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">商品类型统计</span>
          <span class="header-meta">共 {{ total }} 件商品</span>
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
        <el-table-column prop="typeName" label="商品类型" min-width="160" align="center">
          <template slot-scope="scope">
            <el-tag size="mini" effect="plain">{{ scope.row.typeName }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="cnt" label="商品数量" min-width="120" align="center" />
        <el-table-column label="占比" min-width="120" align="center">
          <template slot-scope="scope">{{ percentOf(scope.row.cnt) }}</template>
        </el-table-column>
      </el-table>
      <div ref="chart" class="stats-chart" />
    </el-card>
  </div>
</template>

<script>
import { getProductTypeCount } from '../../api/statistics';
import { PRODUCT_TYPE_OPTIONS } from '../../constants/productType';
import echarts, { CHART_COLORS } from './echarts';

export default {
  name: 'ProductTypeStats',
  data() {
    return {
      loading: false,
      tableData: []
    };
  },
  computed: {
    total() {
      return this.tableData.reduce((sum, r) => sum + r.cnt, 0);
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
      getProductTypeCount().then(res => {
        const countByType = {};
        (res.dataList || []).forEach(row => {
          countByType[row.pType] = row.cnt || 0;
        });
        this.tableData = PRODUCT_TYPE_OPTIONS.map(o => ({
          typeName: o.label,
          cnt: countByType[o.value] || 0
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
        color: CHART_COLORS,
        tooltip: { trigger: 'item', formatter: '{b}: {c} 件 ({d}%)' },
        legend: { bottom: 0 },
        series: [{
          name: '商品类型',
          type: 'pie',
          radius: ['40%', '65%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          label: { formatter: '{b}: {c}' },
          data: this.tableData
            .filter(r => r.cnt > 0)
            .map(r => ({ name: r.typeName, value: r.cnt }))
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
</style>
