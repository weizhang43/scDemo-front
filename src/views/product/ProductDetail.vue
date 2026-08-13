<template>
  <div class="product-detail detail-page">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">商品详情</span>
          <span v-if="product" class="header-meta mono">ID #{{ product.pId }}</span>
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
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
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
.hero-icon {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.detail-hero:hover .hero-icon {
  transform: translateY(-2px);
  box-shadow: 0 10px 22px rgba(102, 126, 234, 0.38);
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
.hero-price {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-price);
  font-variant-numeric: tabular-nums;
}
.hero-price-origin {
  font-size: 14px;
  color: #9aa3b2;
  text-decoration: line-through;
  font-variant-numeric: tabular-nums;
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
</style>
