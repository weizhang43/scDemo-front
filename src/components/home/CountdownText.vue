<template>
  <span :class="['countdown-text', { expired: remain <= 0 }]">
    <i :class="remain <= 0 ? 'el-icon-warning' : 'el-icon-alarm-clock'" />{{ text }}
  </span>
</template>

<script>
export default {
  name: 'CountdownText',
  props: {
    // 到期时间：字符串（yyyy-MM-dd HH:mm:ss）或时间戳
    expireTime: { type: [String, Number], required: true },
    expiredText: { type: String, default: '已超时' }
  },
  data() {
    return { now: Date.now(), timer: null };
  },
  computed: {
    remain() {
      if (!this.expireTime) return 0;
      const ts = typeof this.expireTime === 'number'
        ? this.expireTime
        : new Date(String(this.expireTime).replace(/-/g, '/')).getTime();
      return ts - this.now;
    },
    text() {
      const ms = this.remain;
      if (ms <= 0) return this.expiredText;
      const total = Math.floor(ms / 1000);
      const d = Math.floor(total / 86400);
      const h = Math.floor((total % 86400) / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      const p = v => (v < 10 ? '0' + v : v);
      return d > 0 ? `${d}天 ${p(h)}:${p(m)}:${p(s)}` : `${p(h)}:${p(m)}:${p(s)}`;
    }
  },
  created() {
    this.timer = setInterval(() => { this.now = Date.now(); }, 1000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
};
</script>

<style scoped>
.countdown-text {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-family: var(--font-mono);
  color: #e6a23c;
  font-weight: 700;
  letter-spacing: 0.5px;
}
.countdown-text.expired { color: #f56c6c; }
</style>
