<template>
  <div class="product-buy">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">商品下单</span>
          <span v-if="product" class="header-meta">ID #{{ product.pId }}</span>
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
              <span class="hero-price">¥ {{ unitPrice }}</span>
              <template v-if="product.discount">
                <span class="hero-price-origin">¥ {{ product.price }}</span>
                <el-tag type="danger" size="mini" effect="dark">{{ discountText }}</el-tag>
              </template>
              <el-tag :type="product.isExpired === 1 ? 'danger' : 'success'" size="mini" effect="light">
                {{ product.isExpired === 1 ? '已过期' : '正常' }}
              </el-tag>
              <el-tag v-if="soldOut" type="info" size="mini" effect="light">已售罄</el-tag>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border class="detail-desc">
          <el-descriptions-item label="库存">
            <span :class="{ 'stock-low': product.stock != null && product.stock < 10 }">
              {{ product.stock == null ? '-' : product.stock }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="保质期">{{ product.shelfLife }} 天</el-descriptions-item>
          <el-descriptions-item label="生产日期">
            <i class="el-icon-date desc-icon"></i>{{ formatDate(product.productionDate) }}
          </el-descriptions-item>
          <el-descriptions-item label="产地">
            <i class="el-icon-location-outline desc-icon"></i>{{ product.origin || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="厂家名称" :span="2">
            {{ product.manufacturer || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <div class="buy-block">
          <div class="buy-title">填写订单</div>
          <el-form label-width="90px" class="buy-form">
            <el-form-item label="购买数量">
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="maxQuantity"
                :disabled="!canBuy"
                controls-position="right"
              />
              <span class="form-tip">最多可购买 {{ maxQuantity }} 件</span>
            </el-form-item>
            <el-form-item label="收货地址">
              <el-select
                v-model="addressId"
                placeholder="请选择收货地址"
                :disabled="!canBuy || !addressList.length"
                class="address-select"
              >
                <el-option
                  v-for="addr in addressList"
                  :key="addr.aId"
                  :label="formatAddressLabel(addr)"
                  :value="addr.aId"
                />
              </el-select>
              <el-button v-if="!addressList.length" type="text" @click="goAddress">
                暂无收货地址，去添加
              </el-button>
            </el-form-item>
            <el-form-item label="合计金额">
              <span class="total-text">¥ {{ totalAmount }}</span>
            </el-form-item>
            <el-form-item>
              <el-button
                icon="el-icon-shopping-cart-1"
                :loading="addingCart"
                :disabled="!canBuy"
                @click="handleAddToCart"
              >加入购物车</el-button>
              <el-button
                type="primary"
                icon="el-icon-wallet"
                :loading="submitting"
                :disabled="!canBuy"
                @click="handleSubmit"
              >下单支付</el-button>
              <span v-if="!canBuy" class="form-tip">{{ disabledReason }}</span>
            </el-form-item>
          </el-form>
        </div>

        <product-review-list :p-id="product.pId" />
      </div>

      <el-empty v-else-if="!loading" description="未找到商品信息" />
    </el-card>
  </div>
</template>

<script>
import { getProductById } from '../../api/product';
import { getAddressList } from '../../api/address';
import { placeOrderV2 } from '../../api/order';
import { addToCart } from '../../api/cart';
import ProductReviewList from '../../components/ProductReviewList.vue';

export default {
  name: 'ProductBuy',
  components: { ProductReviewList },
  data() {
    return {
      product: null,
      addressList: [],
      addressId: null,
      quantity: 1,
      loading: false,
      submitting: false,
      addingCart: false
    };
  },
  computed: {
    soldOut() {
      return !!this.product && this.product.stock === 0;
    },
    maxQuantity() {
      const stock = this.product && this.product.stock;
      return stock == null || stock < 0 ? 0 : Number(stock);
    },
    canBuy() {
      return !!this.product && !this.soldOut && this.product.isExpired !== 1;
    },
    disabledReason() {
      if (!this.product) return '';
      if (this.soldOut) return '该商品已售罄';
      if (this.product.isExpired === 1) return '该商品已过期，无法下单';
      return '';
    },
    totalAmount() {
      return (this.unitPrice * (Number(this.quantity) || 0)).toFixed(2);
    },
    /** 服务端权威单价：有折扣即折后价。下单金额由服务端重算，这里只负责展示与比对 */
    unitPrice() {
      if (!this.product) return 0;
      const p = this.product.effectivePrice != null ? this.product.effectivePrice : this.product.price;
      return Number(p) || 0;
    },
    discountText() {
      const d = this.product && this.product.discount;
      if (!d) return '';
      return `${(d / 10).toFixed(1).replace(/\.0$/, '')} 折`;
    }
  },
  created() {
    this.fetchProduct();
    this.loadAddresses();
  },
  methods: {
    fetchProduct() {
      const id = this.$route.params.id;
      if (!id) return;
      this.loading = true;
      // GET /product/{id} 返回裸 Product，没有 ResponseDto 包装
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
    loadAddresses() {
      const user = this.$store.state.userInfo || {};
      const uId = user.uId;
      if (!uId) {
        this.addressList = [];
        this.addressId = null;
        return;
      }
      getAddressList(uId)
        .then(res => {
          const list = res.dataList || [];
          this.addressList = Array.isArray(list) ? list : [];
          const def = this.addressList.find(a => a.isDefault === 1);
          this.addressId = def ? def.aId : (this.addressList[0] && this.addressList[0].aId) || null;
        })
        .catch(() => {
          this.addressList = [];
          this.addressId = null;
        });
    },
    formatAddressLabel(addr) {
      if (!addr) return '';
      const region = [addr.province, addr.city, addr.district].filter(v => v).join('');
      return `${addr.consignee} ${addr.phone} ${region}${addr.detail || ''}${addr.isDefault === 1 ? '（默认）' : ''}`;
    },
    handleSubmit() {
      if (!this.addressId) {
        this.$message.warning('请选择收货地址');
        return;
      }
      if (!this.quantity || this.quantity < 1) {
        this.$message.warning('请填写下单数量');
        return;
      }
      if (this.quantity > this.maxQuantity) {
        this.$message.warning(`下单数量不能大于库存（${this.maxQuantity}）`);
        return;
      }
      const user = this.$store.state.userInfo || {};
      this.submitting = true;
      placeOrderV2({
        uId: user.uId,
        addPerson: user.uName || (user.realName || 'anonymous'),
        addressId: this.addressId,
        orderStatus: 0,
        items: [{ pId: this.product.pId, quantity: this.quantity, expectedPrice: this.unitPrice }]
      })
        // 订单落在待支付态，主键从 daoResult.oid 取（Jackson 把 getOId() 序列化成 oid）
        .then(res => {
          const oid = (res && res.daoResult && res.daoResult.oid) || null;
          if (oid) {
            this.$router.push('/pay/' + oid);
            return;
          }
          // 拿不到主键就退回原行为，绝不把已成立的订单报成失败
          this.$message.success('下单成功，请到我的订单完成支付');
          this.quantity = 1;
          this.fetchProduct();
        })
        .catch(() => {})
        .finally(() => {
          this.submitting = false;
        });
    },
    /** 加购不需要收货地址，服务端按 (uId, pId) 累加数量并按实时库存截断 */
    handleAddToCart() {
      if (!this.canBuy) return;
      if (this.quantity > this.maxQuantity) {
        this.$message.warning(`加购数量不能大于库存（${this.maxQuantity}）`);
        return;
      }
      this.addingCart = true;
      addToCart({ pId: this.product.pId, quantity: this.quantity })
        .then(res => {
          const r = res.daoResult || {};
          if (r.capped) {
            this.$message.warning(`已达该商品可购上限 ${r.quantity} 件`);
          } else {
            this.$message.success('已加入购物车');
          }
          // 直接用返回体里的条目数刷角标，不再多发一次 /count
          if (r.cartCount != null) {
            this.$store.commit('SET_CART_COUNT', r.cartCount);
          }
        })
        .catch(() => {})
        .finally(() => {
          this.addingCart = false;
        });
    },
    goBack() {
      this.$router.push('/gallery');
    },
    goAddress() {
      const user = this.$store.state.userInfo || {};
      this.$router.push(`/user/${user.uId}/address`);
    },
    goService() {
      this.$router.push('/customer-service');
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
.product-buy {
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
.hero-image-wrap {
  flex-shrink: 0;
}
.hero-image {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  border: 1px solid #e6e9f5;
  display: block;
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
}
.hero-icon i {
  font-size: 28px;
  color: #fff;
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
.desc-icon {
  color: #9aa3b2;
  margin-right: 6px;
}
.stock-low {
  color: #e6a23c;
  font-weight: 600;
}
.buy-block {
  margin-top: 22px;
  padding: 18px 20px 4px;
  background: linear-gradient(180deg, #fafbff 0%, #f3f5fb 100%);
  border: 1px solid #e8ecf5;
  border-radius: 12px;
}
.buy-title {
  font-size: 15px;
  font-weight: 600;
  color: #1f2733;
  margin-bottom: 16px;
}
.address-select {
  width: 420px;
  max-width: 100%;
}
.form-tip {
  margin-left: 12px;
  font-size: 12px;
  color: #8a93a4;
}
.total-text {
  font-size: 20px;
  font-weight: 700;
  color: #d97706;
  font-variant-numeric: tabular-nums;
}
@media (max-width: 768px) {
  .product-buy {
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
  .address-select {
    width: 100%;
  }
}
</style>

<style>
.product-buy .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.product-buy .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.product-buy .el-card__body {
  padding: 20px 24px;
}
.product-buy .el-descriptions--border .el-descriptions__body {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #eef0f4;
  border-collapse: separate;
}
</style>
