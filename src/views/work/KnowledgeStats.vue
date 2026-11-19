<template>
  <div class="knowledge-stats" :class="{ 'knowledge-stats-mobile': mobile }">
    <div class="stats-header">
      <div class="stats-title">
        <i class="el-icon-data-analysis" />
        刷题统计
      </div>
      <el-button size="small" icon="el-icon-refresh" :loading="loading" @click="fetchAll">刷新</el-button>
    </div>

    <div v-loading="loading" class="stats-body">
      <!-- 时间维度 -->
      <el-card class="stats-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-date" /> 近七天时间维度</span>
          <div class="header-controls">
            <el-radio-group v-model="dailyTab" size="mini" @change="renderDailyChart">
              <el-radio-button label="count">刷题数量</el-radio-button>
              <el-radio-button label="favorite">收藏数量</el-radio-button>
              <el-radio-button label="note">笔记数量</el-radio-button>
              <el-radio-button label="mastered">掌握数量</el-radio-button>
              <el-radio-button label="duration">刷题时间</el-radio-button>
            </el-radio-group>
            <el-radio-group v-model="dailyChartType" size="mini" @change="renderDailyChart">
              <el-radio-button label="bar"><i class="el-icon-data-analysis" /> 柱状</el-radio-button>
              <el-radio-button label="pie"><i class="el-icon-pie-chart" /> 饼图</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div ref="dailyChart" class="chart chart-daily" />
      </el-card>

      <!-- 标签维度 -->
      <el-card class="stats-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-collection-tag" /> 标签维度</span>
          <div class="header-controls">
            <el-radio-group v-model="tagTab" size="mini" @change="renderTagChart">
              <el-radio-button label="count">题目数量</el-radio-button>
              <el-radio-button label="duration">耗时</el-radio-button>
              <el-radio-button label="favorite">收藏</el-radio-button>
              <el-radio-button label="note">笔记</el-radio-button>
              <el-radio-button label="mastered">掌握</el-radio-button>
            </el-radio-group>
            <el-radio-group v-model="tagChartType" size="mini" @change="renderTagChart">
              <el-radio-button label="bar"><i class="el-icon-data-analysis" /> 柱状</el-radio-button>
              <el-radio-button label="pie"><i class="el-icon-pie-chart" /> 饼图</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div ref="tagChart" class="chart chart-tag" />
      </el-card>

      <!-- 试题维度 -->
      <el-card class="stats-card" shadow="hover">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-trophy" /> 试题维度 TOP 10</span>
          <div class="header-controls">
            <el-radio-group v-model="topTab" size="mini" @change="renderTopChart">
              <el-radio-button label="note">笔记次数</el-radio-button>
              <el-radio-button label="duration">耗时</el-radio-button>
              <el-radio-button label="view">查看次数</el-radio-button>
            </el-radio-group>
            <el-radio-group v-model="topChartType" size="mini" @change="renderTopChart">
              <el-radio-button label="bubble"><i class="el-icon-s-grid" /> 气泡图</el-radio-button>
              <el-radio-button label="rose"><i class="el-icon-pie-chart" /> 玫瑰图</el-radio-button>
            </el-radio-group>
          </div>
        </div>
        <div ref="topChart" class="chart chart-top" />
      </el-card>
    </div>
  </div>
</template>

<script>
import { getKnowledgeDailyStats, getKnowledgeTagDetailStats, getKnowledgeQuestionTopStats } from '../../api/knowledge';
import echarts, { CHART_COLORS } from '../statistics/echarts';

const TAG_LABELS = {
  1: 'Java基础', 2: 'Java集合', 3: '多线程JUC', 4: 'JVM调优',
  5: 'Spring框架', 6: 'MyBatis', 7: '数据库缓存', 8: '微服务',
  9: '消息队列', 10: 'ES搜索', 11: '前端Vue', 12: '项目实战'
};

const DAILY_METRICS = {
  count: { label: '刷题数量', color: '#667eea', unit: '题' },
  favorite: { label: '收藏数量', color: '#f56c6c', unit: '题' },
  note: { label: '添加笔记数量', color: '#e6a23c', unit: '条' },
  mastered: { label: '掌握题数量', color: '#67c23a', unit: '题' },
  duration: { label: '刷题时间', color: '#764ba2', unit: '秒' }
};

const TAG_METRICS = {
  count: { label: '题目数量', unit: '题' },
  duration: { label: '耗时', unit: '秒' },
  favorite: { label: '收藏数', unit: '题' },
  note: { label: '笔记数', unit: '条' },
  mastered: { label: '掌握数', unit: '题' }
};

const TOP_METRICS = {
  note: { label: '添加笔记次数 TOP 10', unit: '次', key: 'noteTop' },
  duration: { label: '耗时 TOP 10', unit: '秒', key: 'durationTop' },
  view: { label: '查看次数 TOP 10', unit: '次', key: 'viewTop' }
};

export default {
  name: 'KnowledgeStats',
  props: {
    mobile: { type: Boolean, default: false }
  },
  data() {
    return {
      loading: false,
      dailyTab: 'count',
      tagTab: 'count',
      topTab: 'note',
      dailyChartType: 'bar',
      tagChartType: 'bar',
      topChartType: 'bubble',
      dailyData: [],
      tagData: [],
      topData: { noteTop: [], durationTop: [], viewTop: [] },
      dailyChart: null,
      tagChart: null,
      topChart: null
    };
  },
  mounted() {
    this.initCharts();
    this.fetchAll();
    window.addEventListener('resize', this.handleResize);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
    ['dailyChart', 'tagChart', 'topChart'].forEach(k => {
      if (this[k]) {
        this[k].dispose();
        this[k] = null;
      }
    });
  },
  methods: {
    initCharts() {
      this.dailyChart = echarts.init(this.$refs.dailyChart);
      this.tagChart = echarts.init(this.$refs.tagChart);
      this.topChart = echarts.init(this.$refs.topChart);
    },
    fetchAll() {
      this.loading = true;
      Promise.all([
        getKnowledgeDailyStats().then(res => { this.dailyData = res.dataList || []; }).catch(() => {}),
        getKnowledgeTagDetailStats().then(res => { this.tagData = res.dataList || []; }).catch(() => {}),
        getKnowledgeQuestionTopStats().then(res => {
          const d = res.daoResult || {};
          this.topData = {
            noteTop: d.noteTop || [],
            durationTop: d.durationTop || [],
            viewTop: d.viewTop || []
          };
        }).catch(() => {})
      ]).finally(() => {
        this.loading = false;
        this.$nextTick(() => {
          this.renderDailyChart();
          this.renderTagChart();
          this.renderTopChart();
        });
      });
    },
    last7Days() {
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        days.push(`${mm}-${dd}`);
      }
      return days;
    },
    dailyMap() {
      const map = {};
      this.dailyData.forEach(r => {
        const key = (r.date || '').slice(5, 10);
        map[key] = r;
      });
      return map;
    },
    renderDailyChart() {
      if (!this.dailyChart) return;
      const metric = DAILY_METRICS[this.dailyTab];
      const days = this.last7Days();
      const map = this.dailyMap();
      const values = days.map(d => {
        const row = map[d];
        if (!row) return 0;
        return row[this.dailyTab] || 0;
      });
      const tooltipText = (name, value) => `${name}<br/>${metric.label}：${value} ${metric.unit}`;
      if (this.dailyChartType === 'pie') {
        this.dailyChart.setOption({
          color: CHART_COLORS,
          tooltip: {
            trigger: 'item',
            formatter: p => tooltipText(p.name, p.value) + `（${p.percent}%）`
          },
          legend: { bottom: 0, type: 'scroll' },
          series: [{
            name: metric.label,
            type: 'pie',
            radius: ['35%', '65%'],
            center: ['50%', '46%'],
            avoidLabelOverlap: true,
            itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
            label: { formatter: '{b}\n{c} ' + metric.unit },
            data: days.map((d, i) => ({ name: d, value: values[i] }))
          }]
        }, true);
        return;
      }
      this.dailyChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: params => tooltipText(params[0].name, params[0].value)
        },
        grid: { left: 50, right: 30, top: 30, bottom: 30 },
        xAxis: { type: 'category', data: days },
        yAxis: { type: 'value', name: metric.unit, minInterval: 1 },
        series: [{
          name: metric.label,
          type: 'bar',
          data: values,
          barMaxWidth: 36,
          label: { show: true, position: 'top' },
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: metric.color },
              { offset: 1, color: `${metric.color}66` }
            ])
          }
        }]
      }, true);
    },
    tagName(t) {
      return TAG_LABELS[t] || `标签${t}`;
    },
    renderTagChart() {
      if (!this.tagChart) return;
      const metric = TAG_METRICS[this.tagTab];
      const rows = [...this.tagData].sort((a, b) => (b[this.tagTab] || 0) - (a[this.tagTab] || 0));

      if (!rows.length) {
        this.tagChart.setOption({
          title: {
            text: '暂无数据',
            left: 'center',
            top: 'middle',
            textStyle: { fontSize: 14, color: '#909399', fontWeight: 'normal' }
          },
          series: []
        }, true);
        return;
      }

      const names = rows.map(r => this.tagName(r.tag));
      const values = rows.map(r => r[this.tagTab] || 0);
      const tooltipText = (name, value) => `${name}<br/>${metric.label}：${value} ${metric.unit}`;
      if (this.tagChartType === 'pie') {
        this.tagChart.setOption({
          color: CHART_COLORS,
          tooltip: {
            trigger: 'item',
            formatter: p => tooltipText(p.name, p.value) + `（${p.percent}%）`
          },
          legend: { bottom: 0, type: 'scroll' },
          series: [{
            name: metric.label,
            type: 'pie',
            radius: ['30%', '62%'],
            center: ['50%', '46%'],
            avoidLabelOverlap: true,
            itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
            label: { formatter: '{b}\n{c}' + metric.unit, fontSize: 11 },
            data: names.map((n, i) => ({ name: n, value: values[i] }))
          }]
        }, true);
        return;
      }
      this.tagChart.setOption({
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          formatter: params => tooltipText(params[0].name, params[0].value)
        },
        grid: { left: 60, right: 30, top: 30, bottom: 60 },
        xAxis: {
          type: 'category',
          data: names,
          axisLabel: { rotate: this.mobile ? 40 : 25, interval: 0 }
        },
        yAxis: { type: 'value', name: metric.unit, minInterval: 1 },
        series: [{
          name: metric.label,
          type: 'bar',
          data: values,
          barMaxWidth: 32,
          label: { show: true, position: 'top', fontSize: 10 },
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#667eea' },
              { offset: 1, color: '#764ba2' }
            ])
          }
        }]
      }, true);
    },
    renderTopChart() {
      if (!this.topChart) return;
      const metric = TOP_METRICS[this.topTab];
      const rows = (this.topData[metric.key] || []).slice(0, 10);

      // 空数据处理：清空图表并显示提示
      if (!rows.length) {
        this.topChart.setOption({
          title: {
            text: '暂无数据',
            left: 'center',
            top: 'middle',
            textStyle: { fontSize: 14, color: '#909399', fontWeight: 'normal' }
          },
          series: []
        }, true);
        return;
      }

      const names = rows.map((r, i) => {
        const q = (r.question || '').replace(/<[^>]*>/g, '').trim();
        if (!q) return `第 ${i + 1} 名（题 #${r.id}）`;
        return q.length > 18 ? q.slice(0, 18) + '…' : q;
      });
      const fullNames = rows.map((r, i) => {
        const q = (r.question || '').replace(/<[^>]*>/g, '').trim();
        return q || `第 ${i + 1} 名（题 #${r.id}）`;
      });
      const values = rows.map(r => Number(r.value) || 0);
      const maxVal = Math.max(...values, 1);
      const minVal = Math.min(...values, 0);

      if (this.topChartType === 'rose') {
        this.topChart.setOption({
          color: CHART_COLORS,
          tooltip: {
            trigger: 'item',
            formatter: p => {
              const full = fullNames[p.dataIndex] || p.name;
              return `${full}<br/>${metric.label}：${p.value} ${metric.unit}`;
            }
          },
          legend: { bottom: 0, type: 'scroll' },
          series: [{
            name: metric.label,
            type: 'pie',
            radius: ['15%', '70%'],
            center: ['50%', '46%'],
            roseType: 'radius',
            avoidLabelOverlap: true,
            itemStyle: {
              borderRadius: 6,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: { fontSize: 11, formatter: '{b}\n{c}' + metric.unit },
            labelLine: { length: 8, length2: 6 },
            data: names.map((n, i) => ({ name: n, value: values[i] }))
          }]
        }, true);
        return;
      }

      // 气泡图：x=排名（1-10），y=数值，气泡大小=数值占比，颜色按数值梯度
      const bubbleData = values.map((v, i) => ({
        name: names[i],
        value: [i + 1, v, v], // [x排名, y数值, 气泡大小依据]
        fullName: fullNames[i],
        itemStyle: {
          color: new echarts.graphic.RadialGradient(0.4, 0.4, 0.6, [
            { offset: 0, color: CHART_COLORS[i % CHART_COLORS.length] + 'cc' },
            { offset: 1, color: CHART_COLORS[i % CHART_COLORS.length] + '66' }
          ]),
          borderColor: '#fff',
          borderWidth: 2,
          shadowBlur: 12,
          shadowColor: CHART_COLORS[i % CHART_COLORS.length] + '44'
        }
      }));
      const sizeRange = this.mobile ? [18, 60] : [24, 80];
      this.topChart.setOption({
        tooltip: {
          trigger: 'item',
          formatter: p => {
            return `TOP ${p.value[0]}<br/>${p.data.fullName}<br/>${metric.label}：${p.value[1]} ${metric.unit}`;
          }
        },
        grid: { left: 60, right: 40, top: 30, bottom: 50 },
        xAxis: {
          type: 'value',
          name: '排名',
          min: 0,
          max: 11,
          interval: 1,
          axisLabel: { fontSize: 11, color: '#909399' },
          splitLine: { show: false }
        },
        yAxis: {
          type: 'value',
          name: metric.unit,
          minInterval: 1,
          axisLabel: { fontSize: 11, color: '#909399' },
          splitLine: { lineStyle: { type: 'dashed', color: '#ebeef5' } }
        },
        series: [{
          name: metric.label,
          type: 'scatter',
          data: bubbleData,
          symbolSize: val => {
            // 线性映射到 sizeRange
            if (maxVal === minVal) return (sizeRange[0] + sizeRange[1]) / 2;
            return sizeRange[0] + (val[2] - minVal) / (maxVal - minVal) * (sizeRange[1] - sizeRange[0]);
          },
          label: {
            show: true,
            position: 'top',
            formatter: p => p.value[1],
            fontSize: 11,
            fontWeight: 'bold',
            color: '#4a5568'
          },
          emphasis: {
            scale: 1.2,
            label: { fontSize: 13, fontWeight: 'bold' }
          }
        }]
      }, true);
    },
    handleResize() {
      ['dailyChart', 'tagChart', 'topChart'].forEach(k => {
        if (this[k]) this[k].resize();
      });
    }
  }
};
</script>

<style scoped>
.knowledge-stats {
  padding: 4px;
}
.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #e4e7ed;
}
.stats-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 600;
  color: #303133;
}
.stats-title i {
  font-size: 18px;
  color: #667eea;
}
.stats-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.stats-card {
  border-radius: 10px;
  border: 1px solid #ebeef5;
}
.stats-card >>> .el-card__header {
  padding: 12px 16px;
  background: linear-gradient(180deg, #fafbfd 0%, #f6f8fb 100%);
}
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.card-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
}
.card-title i {
  color: #667eea;
  font-size: 16px;
}
.header-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.chart {
  width: 100%;
}
.chart-daily { height: 280px; }
.chart-tag { height: 320px; }
.chart-top { height: 400px; }

@media (max-width: 768px) {
  .knowledge-stats-mobile .chart-daily { height: 240px; }
  .knowledge-stats-mobile .chart-tag { height: 280px; }
  .knowledge-stats-mobile .chart-top { height: 380px; }
  .knowledge-stats-mobile .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
