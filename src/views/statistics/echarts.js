// 统计页共用的 echarts 按需注册：只打包用到的图表与组件
import * as echarts from 'echarts/core';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent, GridComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  PieChart, BarChart, LineChart,
  TooltipComponent, LegendComponent, GridComponent,
  CanvasRenderer
]);

// 沿用站内紫色渐变主题的系列配色
export const CHART_COLORS = [
  '#667eea', '#764ba2', '#8e9efc', '#a78bda',
  '#5a6fd6', '#c3aed6', '#9d7bd8'
];

export default echarts;
