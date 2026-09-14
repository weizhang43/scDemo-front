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
  .knowledge-mobile-page {
    min-height: 100dvh;
    background: #f5f7fb;
  }
  .knowledge-mobile-page .page-header {
    position: sticky;
    top: 0;
    z-index: 10;
    padding: env(safe-area-inset-top) 12px 0;
    box-shadow: 0 1px 10px rgba(31, 45, 77, 0.12);
  }
  .knowledge-mobile-page .header-inner {
    height: 50px;
    min-width: 0;
  }
  .knowledge-mobile-page .header-title {
    display: flex;
    align-items: center;
    min-width: 0;
    font-size: 16px;
    white-space: nowrap;
  }
  .knowledge-mobile-page .back-link {
    display: none;
  }
  .knowledge-mobile-page .page-body {
    width: 100%;
    box-sizing: border-box;
    margin: 0 auto;
    padding: 10px 12px calc(24px + env(safe-area-inset-bottom));
  }
  .knowledge-mobile-page >>> .el-card {
    border: 0;
    border-radius: 0;
    box-shadow: none;
    background: transparent;
  }
  .knowledge-mobile-page >>> .el-card__body {
    padding: 0;
  }
}
</style>
