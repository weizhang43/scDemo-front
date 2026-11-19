<template>
  <div class="work-page" :class="{ 'knowledge-mobile-page': mobile }">
    <div class="page-header">
      <div class="header-inner">
        <div class="header-title">
          <i class="el-icon-collection-tag" />
          知识速记
        </div>
        <div class="header-actions">
          <button
            type="button"
            class="stats-toggle-btn"
            :class="{ 'is-active': showStats }"
            @click="showStats = !showStats"
          >
            <i :class="showStats ? 'el-icon-document' : 'el-icon-data-analysis'" />
            <span>{{ showStats ? '返回刷题' : '刷题统计' }}</span>
          </button>
          <router-link to="/portal" class="back-link">
            <i class="el-icon-back" />
            返回首页
          </router-link>
        </div>
      </div>
    </div>
    <div class="page-body">
      <el-card>
        <KnowledgeStats v-if="showStats" :mobile="mobile" />
        <KnowledgeQuick v-else :mobile="mobile" />
      </el-card>
    </div>
  </div>
</template>

<script>
import KnowledgeQuick from './KnowledgeQuick.vue';
import KnowledgeStats from './KnowledgeStats.vue';

export default {
  name: 'KnowledgePage',
  components: { KnowledgeQuick, KnowledgeStats },
  data() {
    return {
      mobile: window.matchMedia('(max-width: 768px)').matches,
      showStats: false
    };
  },
  created() {
    window.addEventListener('resize', this.updateMobile);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.updateMobile);
  },
  methods: {
    updateMobile() {
      this.mobile = window.matchMedia('(max-width: 768px)').matches;
    }
  }
};
</script>

<style scoped>
.header-inner,
.page-body {
  max-width: 1500px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stats-toggle-btn {
  appearance: none;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: color 0.2s ease;
}

.stats-toggle-btn i {
  font-size: 14px;
}

.stats-toggle-btn:hover {
  color: #fff;
}

.stats-toggle-btn.is-active {
  color: #fff;
  font-weight: 600;
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
