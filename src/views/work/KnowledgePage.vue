<template>
  <div class="work-page">
    <div class="page-header">
      <div class="header-inner">
        <div class="header-title">
          <i class="el-icon-collection-tag" />
          知识速记
        </div>
        <router-link to="/portal" class="back-link">
          <i class="el-icon-back" />
          返回首页
        </router-link>
      </div>
    </div>
    <div class="page-body">
      <el-card>
        <KnowledgeQuick />
      </el-card>
    </div>
  </div>
</template>

<script>
import KnowledgeQuick from './KnowledgeQuick.vue';

export default {
  name: 'KnowledgePage',
  components: { KnowledgeQuick }
};
</script>

<style scoped>
.header-inner,
.page-body {
  max-width: 1500px;
}
</style>
