<template>
  <div class="job-scheduler">
    <iframe
      v-if="xxlJobUrl"
      :src="xxlJobUrl"
      class="job-frame"
      frameborder="0"
    />
    <el-empty v-else description="未配置 xxl-job 地址（VUE_APP_XXLJOB_URL）" />
  </div>
</template>

<script>
export default {
  name: 'JobScheduler',
  computed: {
    xxlJobUrl() {
      return process.env.VUE_APP_XXLJOB_URL || '';
    }
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
