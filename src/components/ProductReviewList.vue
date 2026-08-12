<template>
  <div class="review-list" v-loading="loading">
    <div class="section-title">
      <i class="el-icon-chat-dot-square"></i>
      <span>商品评价</span>
      <span class="section-count">共 {{ total }} 条</span>
      <el-rate
        v-if="total > 0"
        class="avg-rate"
        :value="Number(avgRating)"
        disabled
        show-score
        score-template="{value} 分"
      />
    </div>

    <div v-if="records.length" class="review-items">
      <div v-for="item in records" :key="item.id" class="review-item">
        <div class="review-avatar">
          <img v-if="item.uAvatar" :src="item.uAvatar" class="review-avatar-img" alt="">
          <template v-else>{{ avatarText(item.uName) }}</template>
        </div>
        <div class="review-body">
          <div class="review-head">
            <span class="review-user">{{ item.uName || '匿名用户' }}</span>
            <el-rate :value="item.rating || 0" disabled class="review-rate" />
            <span class="review-time">{{ formatTime(item.createTime) }}</span>
          </div>
          <div class="review-content" :class="{ 'is-empty': !item.content }">
            {{ item.content || '该用户没有填写评价内容' }}
          </div>
        </div>
      </div>
    </div>
    <el-empty v-else description="暂无评价" :image-size="80" />

    <div v-if="total > pageSize" class="review-pager">
      <el-pagination
        background
        layout="prev, pager, next"
        :current-page="pageNo"
        :page-size="pageSize"
        :total="total"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script>
import { getProductReviews } from '../api/review';

export default {
  name: 'ProductReviewList',
  props: {
    pId: {
      type: [Number, String],
      default: null
    }
  },
  data() {
    return {
      loading: false,
      records: [],
      total: 0,
      avgRating: 0,
      pageNo: 1,
      pageSize: 5
    };
  },
  watch: {
    pId() {
      this.pageNo = 1;
      this.fetchData();
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      if (!this.pId) return;
      this.loading = true;
      getProductReviews(this.pId, { pageNo: this.pageNo, pageSize: this.pageSize })
        .then(res => {
          const data = (res && res.daoResult) || {};
          this.records = data.records || [];
          this.total = Number(data.total) || 0;
          this.avgRating = Number(data.avgRating) || 0;
        })
        .catch(() => {
          this.records = [];
          this.total = 0;
          this.avgRating = 0;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handlePageChange(page) {
      this.pageNo = page;
      this.fetchData();
    },
    avatarText(name) {
      if (!name) return 'U';
      return String(name).charAt(0).toUpperCase();
    },
    formatTime(time) {
      if (!time) return '-';
      const d = new Date(time);
      if (isNaN(d.getTime())) return String(time);
      const pad = n => (n < 10 ? '0' + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
};
</script>

<style scoped>
.review-list {
  margin-top: 24px;
}
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: #1f2733;
  margin-bottom: 12px;
  padding-left: 10px;
  position: relative;
  line-height: 1;
}
.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 16px;
  border-radius: 2px;
  background: var(--gradient-brand);
}
.section-title i {
  color: var(--color-primary);
  font-size: 16px;
}
.section-count {
  font-size: 12px;
  color: #8a93a4;
  font-weight: 500;
  background: #f3f5fa;
  padding: 3px 8px;
  border-radius: 10px;
  line-height: 1.4;
}
.avg-rate {
  margin-left: 4px;
  line-height: 1;
}
.review-items {
  border: 1px solid #eef0f4;
  border-radius: 10px;
  overflow: hidden;
}
.review-item {
  display: flex;
  gap: 12px;
  padding: 16px 18px;
  border-bottom: 1px solid #f2f4f8;
  transition: background-color 0.2s ease;
}
.review-item:last-child {
  border-bottom: none;
}
.review-item:hover {
  background-color: #fafbfd;
}
.review-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  background: var(--gradient-brand);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.review-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.review-body {
  flex: 1;
  min-width: 0;
}
.review-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}
.review-user {
  font-size: 14px;
  font-weight: 600;
  color: #1f2733;
}
.review-rate {
  line-height: 1;
}
.review-time {
  font-size: 12px;
  color: #9aa3b2;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
  margin-left: auto;
}
.review-content {
  font-size: 14px;
  color: #4a5568;
  line-height: 1.7;
  word-break: break-word;
  white-space: pre-wrap;
}
.review-content.is-empty {
  color: #b3bac6;
  font-style: italic;
}
.review-pager {
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
</style>

<style>
.review-list .el-rate__icon {
  margin-right: 2px;
  font-size: 15px;
}
.review-list .el-rate__text {
  font-size: 13px;
  color: var(--color-price);
  font-weight: 600;
}
</style>
