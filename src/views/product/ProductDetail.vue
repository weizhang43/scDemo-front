<template>
  <div class="product-detail">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">商品详情</span>
          <span v-if="product" class="header-meta header-meta--id">ID #{{ product.pId }}</span>
        </div>
        <div class="header-actions">
          <el-button type="text" icon="el-icon-service" @click="goService">智能客服</el-button>
          <el-button type="text" icon="el-icon-back" @click="goBack">返回列表</el-button>
        </div>
      </div>

      <div v-if="product" class="detail-body">
        <div class="detail-hero">
          <div class="hero-image-wrap">
            <el-image
              v-if="product.imageUrl"
              :src="product.imageUrl"
              :preview-src-list="[product.imageUrl]"
              fit="cover"
              class="hero-image"
            />
            <div v-else class="hero-icon">
              <i class="el-icon-goods"></i>
            </div>
          </div>
          <div class="hero-info">
            <div class="hero-name">{{ product.pName }}</div>
            <div class="hero-sub">
              <span class="hero-price">¥ {{ effectivePrice }}</span>
              <template v-if="product.discount">
                <span class="hero-price-origin">¥ {{ product.price }}</span>
                <el-tag type="danger" size="mini" effect="dark">{{ discountText }}</el-tag>
              </template>
              <el-tag v-if="product.status === 0" type="info" size="mini" effect="plain">已下架</el-tag>
              <el-tag
                :type="product.isExpired === 1 ? 'danger' : 'success'"
                size="mini"
                effect="light"
              >
                {{ product.isExpired === 1 ? '已过期' : '正常' }}
              </el-tag>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border class="detail-desc">
          <el-descriptions-item label="商品ID">
            <span class="desc-id">#{{ product.pId }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="库存">
            <span :class="{ 'stock-low': product.stock !== null && product.stock !== undefined && product.stock < 10 }">
              {{ product.stock === null || product.stock === undefined ? '-' : product.stock }}
            </span>
            <span v-if="product.stock !== null && product.stock !== undefined && product.stock < 10" class="stock-tip">
              <i class="el-icon-warning"></i> 库存不足
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="点赞数">
            <i class="el-icon-thumb desc-icon"></i>{{ product.likeCount == null ? 0 : product.likeCount }}
          </el-descriptions-item>
          <el-descriptions-item label="生产日期">
            <i class="el-icon-date desc-icon"></i>{{ formatDate(product.productionDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="保质期">
            {{ product.shelfLife }} 天
          </el-descriptions-item>
          <el-descriptions-item label="商品分类">
            {{ product.categoryName || '未分类' }}
          </el-descriptions-item>
          <el-descriptions-item label="产地">
            <i class="el-icon-location-outline desc-icon"></i>{{ product.origin || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="厂家名称">
            {{ product.manufacturer || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <product-review-list :p-id="product.pId" />
      </div>

      <el-empty v-else description="未找到商品信息" />
    </el-card>
  </div>
</template>

<script>
import { getProductById } from '../../api/product';
import ProductReviewList from '../../components/ProductReviewList.vue';

export default {
  name: 'ProductDetail',
  components: { ProductReviewList },
  data() {
    return {
      product: null,
      loading: false
    };
  },
  computed: {
    effectivePrice() {
      if (!this.product) return 0;
      return this.product.effectivePrice != null ? this.product.effectivePrice : this.product.price;
    },
    discountText() {
      const d = this.product && this.product.discount;
      if (!d) return '';
      return `${(d / 10).toFixed(1).replace(/\.0$/, '')} 折`;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      const id = this.$route.params.id;
      if (!id) return;
      this.loading = true;
      getProductById(id)
        .then(res => {
          this.product = res;
        })
        .catch(() => {
          this.product = null;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    goBack() {
      this.$router.push('/products');
    },
    goService() {
      this.$router.push({
        path: '/customer',
        query: { from: 'product', id: this.$route.params.id }
      });
    },
    formatDate(d) {
      if (!d) return '-';
      const s = String(d);
      return s.length >= 10 ? s.substring(0, 10) : s;
    }
  }
};
</script>

<style scoped>
.product-detail {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1f2733;
  position: relative;
  padding-left: 12px;
  line-height: 1;
}
.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.header-meta {
  font-size: 13px;
  color: #8a93a4;
  font-weight: 500;
  background: #f3f5fa;
  padding: 3px 10px;
  border-radius: 10px;
  line-height: 1.4;
  font-family: 'Menlo', 'Consolas', monospace;
}
.detail-body {
  padding: 4px 0;
  animation: fadeInUp 0.35s ease both;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.detail-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #f0f4ff 0%, #f7f0ff 100%);
  border-radius: 12px;
  border: 1px solid #e6e9f5;
}
.hero-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.detail-hero:hover .hero-icon {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(102, 126, 234, 0.38);
}
.hero-icon i {
  font-size: 28px;
  color: #fff;
}
.hero-image-wrap {
  flex-shrink: 0;
}
.hero-image {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  border: 1px solid #e6e9f5;
  object-fit: cover;
  display: block;
}
.hero-info {
  flex: 1;
  min-width: 0;
}
.hero-name {
  font-size: 20px;
  font-weight: 700;
  color: #1f2733;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.hero-sub {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hero-price {
  font-size: 18px;
  font-weight: 600;
  color: #d97706;
  font-variant-numeric: tabular-nums;
}
.hero-price-origin {
  font-size: 14px;
  color: #9aa3b2;
  text-decoration: line-through;
  font-variant-numeric: tabular-nums;
}
.detail-desc >>> .el-descriptions__label {
  width: 120px;
  background: #fafbfd;
  color: #4a5568;
  font-weight: 500;
}
.detail-desc >>> .el-descriptions__content {
  color: #1f2733;
}
.desc-id {
  font-family: 'Menlo', 'Consolas', monospace;
  color: #4c5163;
}
.desc-icon {
  color: #9aa3b2;
  margin-right: 6px;
}
.stock-low {
  color: #e6a23c;
  font-weight: 600;
}
.stock-tip {
  margin-left: 8px;
  font-size: 12px;
  color: #e6a23c;
}
@media (max-width: 768px) {
  .product-detail {
    padding: 12px;
  }
  .detail-hero {
    flex-direction: column;
    align-items: flex-start;
    padding: 16px;
    gap: 14px;
  }
  .hero-name {
    white-space: normal;
  }
}
</style>

<style>
.product-detail .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.product-detail .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.product-detail .el-card__body {
  padding: 20px 24px;
}
.product-detail .el-descriptions--border .el-descriptions__body {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #eef0f4;
}
.product-detail .el-descriptions--border .el-descriptions__body {
  border-collapse: separate;
}
</style>
