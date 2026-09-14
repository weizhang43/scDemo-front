<template>
  <div class="work-page" :class="{ 'knowledge-mobile-page': mobile }">
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
        <KnowledgeQuick :mobile="mobile" />
      </el-card>
    </div>
  </div>
</template>

<script>
import KnowledgeQuick from './KnowledgeQuick.vue';

export default {
  name: 'KnowledgePage',
  components: { KnowledgeQuick },
  props: {
    mobile: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style scoped>
.header-inner,
.page-body {
  max-width: 1500px;
}

@media (max-width: 768px) {
  .knowledge-mobile-page .page-header {
    padding: 0 12px;
  }
  .knowledge-mobile-page .header-inner {
    height: 50px;
  }
  .knowledge-mobile-page .header-title {
    font-size: 16px;
  }
  .knowledge-mobile-page .page-body {
    margin: 12px auto;
    padding: 0 12px;
  }
  .knowledge-mobile-page >>> .el-card__body {
    padding: 12px;
  }
}
</style>
