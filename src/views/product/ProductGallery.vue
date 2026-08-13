<template>
  <div class="product-gallery list-page">
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

      <div class="list-toolbar">
        <div v-if="categories.length" class="category-nav">
          <span class="category-nav-label">分类</span>
          <span
            class="category-pill"
            :class="{ 'is-active': categoryId === null }"
            @click="handleCategoryChange(null)"
          >全部</span>
          <span
            v-for="c in categories"
            :key="c.id"
            class="category-pill"
            :class="{ 'is-active': categoryId === c.id }"
            @click="handleCategoryChange(c.id)"
          >{{ c.name }}</span>
        </div>
        <el-select
          v-model="sortBy"
          size="small"
          class="sort-select"
          @change="handleSortChange"
        >
          <el-option
            v-for="opt in sortOptions"
            :key="opt.value"
            :label="opt.label"
            :value="opt.value"
          >
            <i :class="opt.icon" class="sort-option-icon" />{{ opt.label }}
          </el-option>
        </el-select>
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
              <div class="like-badge">
                <i class="el-icon-thumb" />{{ item.likeCount == null ? 0 : item.likeCount }}
              </div>
              <div v-if="isSoldOut(item)" class="sold-out-mask">已售罄</div>
              <div v-else class="hover-actions">
                <el-button
                  size="mini"
                  icon="el-icon-wallet"
                  class="hover-btn hover-btn--buy"
                  :loading="buyingId === item.pId"
                  @click.stop="handleQuickBuy(item)"
                >立即下单</el-button>
                <el-button
                  size="mini"
                  icon="el-icon-shopping-cart-1"
                  class="hover-btn hover-btn--cart"
                  :loading="addingId === item.pId"
                  @click.stop="handleQuickAddCart(item)"
                >加入购物车</el-button>
              </div>
            </div>
            <div class="goods-body">
              <div class="goods-name" :title="item.pName">{{ item.pName }}</div>
              <div class="goods-meta">
                <span>成交 {{ item.saleCount || 0 }}</span>
                <span class="goods-meta-dot">·</span>
                <span>评价 {{ item.reviewCount || 0 }}</span>
              </div>
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

    <el-dialog title="快速下单" :visible.sync="quickBuy.visible" width="480px" :close-on-click-modal="false">
      <div v-if="quickBuy.item" class="quick-buy-body">
        <div class="quick-buy-row">
          <span class="quick-buy-label">商品</span>
          <span>{{ quickBuy.item.pName }} × 1</span>
        </div>
        <div class="quick-buy-row">
          <span class="quick-buy-label">收货地址</span>
          <span>{{ shortAddress(defaultAddress) }}</span>
        </div>
        <div class="quick-buy-row">
          <span class="quick-buy-label">优惠券</span>
          <coupon-select :order-amount="quickBuyPrice" @change="onQuickCouponChange" />
        </div>
        <div class="quick-buy-row">
          <span class="quick-buy-label">应付金额</span>
          <span class="quick-buy-total">
            ¥ {{ quickBuyPayAmount }}
            <span v-if="quickBuy.coupon" class="coupon-off">已优惠 ¥ {{ quickBuy.coupon.couponAmount.toFixed(2) }}</span>
          </span>
        </div>
      </div>
      <div slot="footer">
        <el-button @click="quickBuy.visible = false">取消</el-button>
        <el-button type="primary" :loading="buyingId !== null" @click="doQuickBuy">确认下单</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { pageQuery } from '../../api/product';
import { getCategoryTree } from '../../api/category';
import { getMyAddressList } from '../../api/address';
import { placeOrderV2 } from '../../api/order';
import { addToCart } from '../../api/cart';
import { getToken } from '../../utils/auth';
import CouponSelect from '../../components/CouponSelect.vue';

// 空 value 即后端的默认排序（p_id 倒序），不往请求里塞 sortBy
const SORT_OPTIONS = [
  { value: '', label: '综合排序', icon: 'el-icon-s-operation' },
  { value: 'sales', label: '成交数优先', icon: 'el-icon-sold-out' },
  { value: 'reviews', label: '评价数优先', icon: 'el-icon-chat-line-square' },
  { value: 'likes', label: '点赞数优先', icon: 'el-icon-thumb' }
];

export default {
  name: 'ProductGallery',
  components: { CouponSelect },
  data() {
    return {
      isGuest: !getToken(),
      list: [],
      loading: false,
      defaultAddress: null,
      buyingId: null,
      addingId: null,
      quickBuy: {
        visible: false,
        item: null,
        coupon: null
      },
      sortOptions: SORT_OPTIONS,
      sortBy: '',
      categories: [],
      categoryId: null,
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
  computed: {
    quickBuyPrice() {
      if (!this.quickBuy.item) return 0;
      return Number(this.effectivePriceOf(this.quickBuy.item)) || 0;
    },
    quickBuyPayAmount() {
      const off = this.quickBuy.coupon ? this.quickBuy.coupon.couponAmount : 0;
      return Math.max(this.quickBuyPrice - off, 0).toFixed(2);
    }
  },
  created() {
    const keyword = this.$route.query.keyword;
    if (keyword) this.searchForm.pName = String(keyword);
    this.fetchData();
    this.fetchCategories();
    if (!this.isGuest) {
      this.loadDefaultAddress();
    }
  },
  methods: {
    /** 游客拦截：需要账号的动作先引导登录，返回 true 表示已拦截 */
    guardGuest() {
      if (!this.isGuest) return false;
      this.$confirm('登录后即可购买，是否去登录？', '提示', {
        confirmButtonText: '去登录',
        cancelButtonText: '再逛逛',
        type: 'info'
      })
        .then(() => this.$router.push('/login'))
        .catch(() => {});
      return true;
    },
    fetchCategories() {
      getCategoryTree()
        .then(res => { this.categories = res.dataList || []; })
        .catch(() => {});
    },
    handleCategoryChange(id) {
      this.categoryId = id;
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    fetchData() {
      this.loading = true;
      // 下架商品由服务端按角色过滤，这里只额外排除过期商品；选一级分类时服务端会聚合其子分类商品
      pageQuery({
        pName: this.searchForm.pName || '',
        isExpired: 0,
        categoryId: this.categoryId || undefined,
        sortBy: this.sortBy || undefined,
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
      if (this.guardGuest()) return;
      if (this.isSoldOut(item)) {
        this.$message.warning('该商品已售罄');
        return;
      }
      this.$router.push('/product-buy/' + item.pId);
    },
    loadDefaultAddress() {
      getMyAddressList()
        .then(res => {
          const list = res.dataList || [];
          const arr = Array.isArray(list) ? list : [];
          this.defaultAddress = arr.find(a => a.isDefault === 1) || arr[0] || null;
        })
        .catch(() => {
          this.defaultAddress = null;
        });
    },
    shortAddress(addr) {
      if (!addr) return '';
      const region = [addr.province, addr.city, addr.district].filter(v => v).join('');
      return `${addr.consignee} ${region}${addr.detail || ''}`;
    },
    /**
     * 悬浮层快速下单：默认地址 + 1 件，落单后进支付页（订单仍是待支付）。
     * 悬浮按钮容易误触，且下单会即时扣库存，所以先弹窗把商品/金额/收货地址/选券摊开给用户看。
     */
    handleQuickBuy(item) {
      if (this.guardGuest()) return;
      if (this.isSoldOut(item)) {
        this.$message.warning('该商品已售罄');
        return;
      }
      if (!this.defaultAddress) {
        this.$confirm('还没有收货地址，是否现在去添加？', '提示', {
          confirmButtonText: '去添加',
          cancelButtonText: '取消',
          type: 'warning'
        })
          .then(() => {
            const user = this.$store.state.userInfo || {};
            this.$router.push(`/user/${user.uId}/address`);
          })
          .catch(() => {});
        return;
      }
      this.quickBuy.item = item;
      this.quickBuy.coupon = null;
      this.quickBuy.visible = true;
    },
    onQuickCouponChange(c) {
      this.quickBuy.coupon = c;
    },
    doQuickBuy() {
      const item = this.quickBuy.item;
      if (!item || this.buyingId !== null) return;
      const user = this.$store.state.userInfo || {};
      this.buyingId = item.pId;
      placeOrderV2({
        uId: user.uId,
        addPerson: user.uName || user.realName || 'anonymous',
        addressId: this.defaultAddress.aId,
        orderStatus: 0,
        couponId: this.quickBuy.coupon ? this.quickBuy.coupon.couponId : null,
        expectedPayAmount: this.quickBuy.coupon ? Number(this.quickBuyPayAmount) : null,
        items: [{ pId: item.pId, quantity: 1, expectedPrice: this.quickBuyPrice }]
      })
        .then(res => {
          this.quickBuy.visible = false;
          const oid = (res && res.daoResult && res.daoResult.oid) || null;
          if (oid) {
            this.$router.push('/pay/' + oid);
            return;
          }
          // 拿不到主键就退回提示，绝不把已成立的订单报成失败
          this.$message.success('下单成功，请到我的订单完成支付');
          this.fetchData();
        })
        // 价格/库存类失败：回源让用户直接看到新价与新库存
        .catch(() => {
          this.quickBuy.visible = false;
          this.fetchData();
        })
        .finally(() => {
          this.buyingId = null;
        });
    },
    /** 加购固定 1 件，服务端按 (uId, pId) 累加并按实时库存截断 */
    handleQuickAddCart(item) {
      if (this.guardGuest()) return;
      if (this.isSoldOut(item)) {
        this.$message.warning('该商品已售罄');
        return;
      }
      this.addingId = item.pId;
      addToCart({ pId: item.pId, quantity: 1 })
        .then(res => {
          const r = res.daoResult || {};
          if (r.capped) {
            this.$message.warning(`已达该商品可购上限 ${r.quantity} 件`);
          } else {
            this.$message.success('已加入购物车');
          }
          if (r.cartCount != null) {
            this.$store.commit('SET_CART_COUNT', r.cartCount);
          }
        })
        .catch(() => {})
        .finally(() => {
          this.addingId = null;
        });
    },
    handleSearch() {
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    handleSortChange() {
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    handleReset() {
      this.searchForm.pName = '';
      this.sortBy = '';
      this.categoryId = null;
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
.list-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}
.sort-select {
  flex-shrink: 0;
  width: 148px;
  /* 无分类时也保持靠右 */
  margin-left: auto;
}
.sort-option-icon {
  color: var(--color-primary);
  margin-right: 6px;
}
.category-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.category-nav-label {
  font-size: 13px;
  color: #8a93a4;
  margin-right: 2px;
}
.category-pill {
  padding: 5px 16px;
  border-radius: var(--radius-card);
  background: #f3f5fa;
  border: 1px solid #eef0f4;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}
.category-pill:hover {
  color: var(--color-primary);
}
.category-pill.is-active {
  color: #fff;
  background: var(--gradient-brand);
  border-color: transparent;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.32);
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
.like-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: var(--radius-md);
  background: rgba(31, 41, 59, 0.55);
  backdrop-filter: blur(4px);
  color: #fff;
  font-size: 12px;
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
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
  /* 压住点赞角标：售罄遮罩是全屏蒙层，角标透出来会显得脏 */
  z-index: 3;
}
/* 底部动作条：不盖住图片主体，避免点图进详情时误触按钮 */
.hover-actions {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 14px 8px 8px;
  background: linear-gradient(180deg, rgba(31, 41, 59, 0) 0%, rgba(31, 41, 59, 0.6) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
  z-index: 3;
}
.goods-card:hover .hover-actions {
  opacity: 1;
}
.hover-btn {
  flex: 1;
  padding-left: 0;
  padding-right: 0;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
}
/* Element 给相邻按钮的 10px 左边距会挤坏等分布局 */
.hover-btn + .hover-btn {
  margin-left: 0;
}
.hover-btn--buy {
  background: var(--gradient-brand);
  color: #fff;
}
.hover-btn--buy:hover,
.hover-btn--buy:focus {
  background: linear-gradient(135deg, #7b8ff0 0%, #8a5bb8 100%);
  color: #fff;
}
.hover-btn--cart {
  background: rgba(255, 255, 255, 0.94);
  color: #4a5568;
}
.hover-btn--cart:hover,
.hover-btn--cart:focus {
  background: #fff;
  color: var(--color-primary);
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
.goods-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  font-size: 12px;
  color: #8a93a4;
  font-variant-numeric: tabular-nums;
}
.goods-meta-dot {
  color: #d5d9e2;
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
  color: var(--color-price);
  font-variant-numeric: tabular-nums;
}
.goods-stock {
  font-size: 12px;
  color: #8a93a4;
}
.quick-buy-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.quick-buy-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #1f2733;
}
.quick-buy-label {
  flex: 0 0 70px;
  color: #8a93a4;
}
.quick-buy-total {
  font-size: 17px;
  font-weight: 600;
  color: var(--color-price);
  font-variant-numeric: tabular-nums;
}
.coupon-off {
  font-size: 12px;
  font-weight: 500;
  color: #67c23a;
  margin-left: 4px;
}
@media (max-width: 768px) {
  .product-gallery {
    padding: 12px;
  }
  .search-input {
    width: 100%;
  }
  /* 触屏没有 hover，动作条常驻显示 */
  .hover-actions {
    opacity: 1;
  }
}
</style>

<style>
.product-gallery .goods-image .el-image__inner {
  object-fit: cover;
}
.product-gallery .sort-select .el-input__inner {
  border-radius: var(--radius-md);
  border-color: #e8ecf5;
  background: #fafbff;
  color: #4a5568;
  font-weight: 500;
}
.product-gallery .sort-select .el-input__inner:hover {
  border-color: #c3cdf5;
}
.product-gallery .sort-select .el-input.is-focus .el-input__inner {
  border-color: var(--color-primary);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.18);
}
</style>
