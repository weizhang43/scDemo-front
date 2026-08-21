<template>
  <div class="work-page">
    <div class="page-header">
      <div class="header-inner">
        <div class="header-title">
          <i class="el-icon-alarm-clock" />
          定时任务
        </div>
        <router-link to="/portal" class="back-link">
          <i class="el-icon-back" />
          返回首页
        </router-link>
      </div>
    </div>
    <div class="page-body">
      <el-card>
        <JobScheduler />
      </el-card>
    </div>
  </div>
</template>

<script>
import JobScheduler from '../system/JobScheduler.vue';

export default {
  name: 'JobSchedulerPage',
  components: { JobScheduler }
};
</script>

<style scoped>
.header-inner,
.page-body {
  max-width: 1500px;
}
.jobs-wrap { height: calc(100vh - 220px); min-height: 480px; }

/deep/ .el-card__body{
  height: 80vh;
}
</style>
