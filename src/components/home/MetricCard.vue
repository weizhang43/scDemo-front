<template>
  <div class="metric-card" :class="{ clickable: !!to, warn: warn }" @click="onClick">
    <i :class="[icon, 'metric-ico']" />
    <div class="metric-num">
      <span v-if="prefix" class="metric-prefix">{{ prefix }}</span>{{ displayValue }}<span v-if="suffix" class="metric-suffix">{{ suffix }}</span>
    </div>
    <div class="metric-label">{{ label }}<i v-if="to" class="el-icon-arrow-right metric-go" /></div>
  </div>
</template>

<script>
export default {
  name: 'MetricCard',
  props: {
    icon: { type: String, default: 'el-icon-data-line' },
    label: { type: String, required: true },
    value: { type: [Number, String], default: 0 },
    prefix: { type: String, default: '' },
    suffix: { type: String, default: '' },
    to: { type: String, default: '' },
    warn: { type: Boolean, default: false }
  },
  data() {
    return { display: 0 };
  },
  computed: {
    displayValue() {
      // 金额等非整数直接展示，整数走滚动动画
      const n = Number(this.value);
      if (!isFinite(n)) return this.value;
      if (!Number.isInteger(n)) return n.toFixed(2);
      return this.display;
    }
  },
  watch: {
    value: {
      immediate: true,
      handler(val) {
        const n = Number(val);
        if (isFinite(n) && Number.isInteger(n)) this.countTo(n);
      }
    }
  },
  methods: {
    countTo(target) {
      const start = performance.now();
      const duration = 700;
      const step = t => {
        const p = Math.min(1, (t - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        this.display = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    },
    onClick() {
      if (this.to) this.$router.push(this.to).catch(() => {});
    }
  }
};
</script>

<style scoped>
.metric-card {
  position: relative;
  min-width: 108px;
  padding: 12px 16px;
  text-align: center;
  border-radius: 12px;
  color: #fff;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(6px);
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.metric-card:hover { transform: translateY(-3px); background: rgba(255, 255, 255, 0.24); }
.metric-card.clickable { cursor: pointer; }
.metric-card.warn { background: rgba(245, 108, 108, 0.32); border-color: rgba(245, 108, 108, 0.5); }
.metric-ico { font-size: 15px; opacity: 0.75; }
.metric-num {
  font-size: 24px;
  font-weight: 700;
  line-height: 1.2;
  font-family: var(--font-mono);
  white-space: nowrap;
}
.metric-prefix, .metric-suffix { font-size: 14px; font-weight: 600; margin: 0 1px; }
.metric-label { font-size: 12px; opacity: 0.85; margin-top: 2px; }
.metric-go { font-size: 11px; margin-left: 2px; opacity: 0.7; }
</style>
