<template>
  <div v-loading="logging" class="job-scheduler" element-loading-text="正在登录 xxl-job…">
    <iframe
      v-if="xxlJobUrl && ready"
      :src="xxlJobUrl"
      class="job-frame"
      frameborder="0"
    />
    <el-empty v-if="!xxlJobUrl" description="未配置 xxl-job 地址（VUE_APP_XXLJOB_URL）" />
  </div>
</template>

<script>
export default {
  name: 'JobScheduler',
  data() {
    return {
      ready: false,
      logging: false
    };
  },
  computed: {
    xxlJobUrl() {
      return process.env.VUE_APP_XXLJOB_URL || '';
    }
  },
  async mounted() {
    const userName = process.env.VUE_APP_XXLJOB_USER;
    const password = process.env.VUE_APP_XXLJOB_PASSWORD;
    debugger
    if (this.xxlJobUrl && userName && password) {
      this.logging = true;
      try {
        await fetch(`${this.xxlJobUrl}/login`, {
          method: 'POST',
          body: new URLSearchParams({ userName, password, ifRemember: 'on' }),
          credentials: 'same-origin'
        });
      } catch (e) {
        // 登录失败不阻塞，iframe 会回落到 xxl-job 登录页
      } finally {
        this.logging = false;
      }
    }
    this.ready = true;
  }
};
</script>

<style scoped>
.job-scheduler {
  width: 100%;
  height: 100%;
}
.job-frame {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
