<template>
  <div class="product-gallery">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">商品列表</span>
          <span class="header-meta">共 {{ pagination.total }} 件</span>
        </div>
      </div>

      <div class="search-form">
        <div class="search-row">
          <el-input
            v-model="searchForm.pName"
            placeholder="搜索商品名称"
            prefix-icon="el-icon-search"
            clearable
            class="search-input"
            @keyup.enter.native="handleSearch"
          />
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button icon="el-icon-refresh-left" @click="handleReset">重置</el-button>
        </div>
      </div>

      <el-row v-if="list.length" :gutter="16" class="goods-row">
        <el-col v-for="item in list" :key="item.pId" :xs="12" :sm="8" :md="4">
          <div
            class="goods-card"
            :class="{ 'goods-card--disabled': isSoldOut(item) }"
            @click="goBuy(item)"
          >
            <div class="goods-image-wrap">
              <el-image v-if="item.imageUrl" :src="item.imageUrl" fit="cover" class="goods-image">
                <div slot="error" class="goods-image-fallback">
                  <i class="el-icon-picture-outline" />
                </div>
              </el-image>
              <div v-else class="goods-image-fallback">
                <i class="el-icon-picture-outline" />
              </div>
              <div v-if="isSoldOut(item)" class="sold-out-mask">已售罄</div>
            </div>
            <div class="goods-body">
              <div class="goods-name" :title="item.pName">{{ item.pName }}</div>
              <div class="goods-foot">
                <div class="goods-price">
                  <span class="price-text">¥ {{ effectivePriceOf(item) }}</span>
                  <span v-if="item.discount" class="price-origin">¥ {{ item.price }}</span>
                </div>
                <span class="goods-stock">库存 {{ item.stock == null ? '-' : item.stock }}</span>
              </div>
              <el-tag v-if="item.discount" type="danger" size="mini" effect="dark" class="discount-tag">
                {{ discountText(item.discount) }}
              </el-tag>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-empty v-else-if="!loading" description="暂无商品" />

      <div v-if="pagination.total" class="pagination-wrap">
        <el-pagination
          :current-page="pagination.pageNo"
          :page-size="pagination.pageSize"
          :page-sizes="[12, 24, 48]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { pageQuery } from '../../api/product';

export default {
  name: 'ProductGallery',
  data() {
    return {
      list: [],
      loading: false,
      searchForm: {
        pName: ''
      },
      pagination: {
        pageNo: 1,
        pageSize: 12,
        total: 0
      }
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.loading = true;
      // 下架商品由服务端按角色过滤，这里只额外排除过期商品
      pageQuery({
        pName: this.searchForm.pName || '',
        isExpired: 0,
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize
      })
        .then(res => {
          const page = res.daoResult || {};
          this.list = page.records || [];
          this.pagination.total = page.total || 0;
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
        });
    },
    effectivePriceOf(item) {
      return item.effectivePrice != null ? item.effectivePrice : item.price;
    },
    discountText(discount) {
      const d = Number(discount) || 0;
      if (!d) return '';
      return `${(d / 10).toFixed(1).replace(/\.0$/, '')} 折`;
    },
    isSoldOut(item) {
      return item.stock === 0;
    },
    goBuy(item) {
      if (this.isSoldOut(item)) {
        this.$message.warning('该商品已售罄');
        return;
      }
      this.$router.push('/product-buy/' + item.pId);
    },
    handleSearch() {
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    handleReset() {
      this.searchForm.pName = '';
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    handlePageChange(pageNo) {
      this.pagination.pageNo = pageNo;
      this.fetchData();
    },
    handleSizeChange(pageSize) {
      this.pagination.pageSize = pageSize;
      this.pagination.pageNo = 1;
      this.fetchData();
    }
  }
};
</script>

<style scoped>
.product-gallery {
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
}
.search-form {
  background: linear-gradient(180deg, #fafbff 0%, #f3f5fb 100%);
  border: 1px solid #e8ecf5;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 18px;
}
.search-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.search-input {
  width: 240px;
}
.goods-row {
  margin-bottom: 4px;
}
.goods-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.goods-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(31, 41, 59, 0.1);
}
.goods-card--disabled {
  cursor: not-allowed;
  opacity: 0.72;
}
.goods-card--disabled:hover {
  transform: none;
  box-shadow: none;
}
.goods-image-wrap {
  position: relative;
  width: 100%;
  height: 168px;
  background: #f7f8fb;
}
.goods-image {
  width: 100%;
  height: 100%;
  display: block;
}
.goods-image-fallback {
  width: 100%;
  height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c3c9d4;
  font-size: 34px;
}
.sold-out-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 41, 59, 0.45);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
}
.goods-body {
  padding: 12px 14px 14px;
}
.goods-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2733;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 8px;
}
.goods-foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}
.goods-price {
  display: flex;
  align-items: baseline;
  gap: 6px;
}
.price-origin {
  font-size: 12px;
  color: #9aa3b2;
  text-decoration: line-through;
  font-variant-numeric: tabular-nums;
}
.discount-tag {
  margin-top: 8px;
}
.price-text {
  font-size: 17px;
  font-weight: 600;
  color: #d97706;
  font-variant-numeric: tabular-nums;
}
.goods-stock {
  font-size: 12px;
  color: #8a93a4;
}
.pagination-wrap {
  text-align: right;
  padding-top: 16px;
  border-top: 1px dashed #e8ebf2;
}
@media (max-width: 768px) {
  .product-gallery {
    padding: 12px;
  }
  .search-input {
    width: 100%;
  }
}
</style>

<style>
.product-gallery .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.product-gallery .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.product-gallery .el-card__body {
  padding: 20px 24px;
}
.product-gallery .goods-image .el-image__inner {
  object-fit: cover;
}
</style>
