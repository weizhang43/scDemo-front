<template>
  <div class="cart-page list-page">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">我的购物车</span>
          <span class="header-meta">共 {{ rows.length }} 种商品</span>
        </div>
        <div class="header-actions">
          <el-button type="text" icon="el-icon-goods" @click="goGallery">继续购物</el-button>
          <el-button type="text" icon="el-icon-refresh" @click="fetchList">刷新</el-button>
        </div>
      </div>

      <el-empty v-if="!loading && !rows.length" description="购物车还是空的">
        <el-button type="primary" @click="goGallery">去逛逛</el-button>
      </el-empty>

      <div v-else>
        <el-table
          :data="rows"
          row-key="id"
          :row-class-name="rowClassName"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="46" :selectable="rowSelectable" />
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column label="商品" min-width="260">
            <template slot-scope="scope">
              <div class="goods-cell">
                <el-image
                  v-if="scope.row.imageUrl"
                  :src="scope.row.imageUrl"
                  fit="cover"
                  class="goods-thumb"
                />
                <div v-else class="goods-thumb goods-thumb-empty"><i class="el-icon-goods" /></div>
                <div class="goods-info">
                  <div class="goods-name">{{ scope.row.pName || ('商品 #' + scope.row.pId) }}</div>
                  <div class="goods-tags">
                    <el-tag v-if="!scope.row.available" type="danger" size="mini" effect="light">
                      {{ scope.row.unavailableReason }}
                    </el-tag>
                    <template v-else-if="scope.row.exceedStock">
                      <el-tag type="warning" size="mini" effect="light">{{ scope.row.unavailableReason }}</el-tag>
                      <el-button type="text" size="mini" @click="clampQuantity(scope.row)">
                        调整为 {{ scope.row.stock }} 件
                      </el-button>
                    </template>
                  </div>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="单价" width="140">
            <template slot-scope="scope">
              <span class="price-now">¥ {{ Number(scope.row.effectivePrice || 0).toFixed(2) }}</span>
              <template v-if="scope.row.discount">
                <span class="price-origin">¥{{ scope.row.price }}</span>
                <el-tag type="danger" size="mini" effect="dark">{{ discountText(scope.row.discount) }}</el-tag>
              </template>
            </template>
          </el-table-column>
          <el-table-column label="数量" width="150">
            <template slot-scope="scope">
              <el-input-number
                v-model="scope.row.quantity"
                :min="1"
                :max="scope.row.stock || 1"
                :disabled="!scope.row.available"
                size="mini"
                controls-position="right"
                @change="handleQuantityChange(scope.row)"
              />
            </template>
          </el-table-column>
          <el-table-column label="小计" width="130">
            <template slot-scope="scope">
              <span class="price-now">¥ {{ lineTotal(scope.row) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90">
            <template slot-scope="scope">
              <el-button type="text" size="mini" class="text-danger" @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="cart-footer">
          <span class="footer-meta">已选 {{ selectedRows.length }} 种 / 共 {{ selectedQuantity }} 件</span>
          <el-select
            v-model="addressId"
            placeholder="请选择收货地址"
            :disabled="!addressList.length"
            class="address-select"
          >
            <el-option
              v-for="addr in addressList"
              :key="addr.aId"
              :label="formatAddressLabel(addr)"
              :value="addr.aId"
            />
          </el-select>
          <el-button v-if="!addressList.length" type="text" @click="goAddress">暂无收货地址，去添加</el-button>
          <coupon-select :order-amount="Number(selectedTotal)" @change="onCouponChange" />
          <div class="footer-right">
            <span class="total-text">
              合计 ¥ {{ payTotal }}
              <span v-if="coupon" class="coupon-off">已优惠 ¥ {{ coupon.couponAmount.toFixed(2) }}</span>
            </span>
            <el-button
              icon="el-icon-delete"
              :disabled="!selectedRows.length"
              @click="handleBatchDelete"
            >删除所选</el-button>
            <el-button
              type="primary"
              icon="el-icon-shopping-cart-2"
              :loading="submitting"
              :disabled="!canCheckout"
              @click="handleCheckout"
            >结算</el-button>
            <span v-if="checkoutDisabledReason" class="form-tip">{{ checkoutDisabledReason }}</span>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getCartList, updateCartQuantity, deleteCartItem, batchDeleteCart } from '../../api/cart';
import { getMyAddressList } from '../../api/address';
import { placeOrderV2 } from '../../api/order';
import CouponSelect from '../../components/CouponSelect.vue';

export default {
  name: 'CartList',
  components: { CouponSelect },
  data() {
    return {
      rows: [],
      selectedRows: [],
      addressList: [],
      addressId: null,
      coupon: null,
      loading: false,
      submitting: false
    };
  },
  computed: {
    selectedQuantity() {
      return this.selectedRows.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0);
    },
    /** selectedRows 持有的是 rows 里同一批对象引用，数量 spinner 一动这里自动重算 */
    selectedTotal() {
      const total = this.selectedRows.reduce(
        (sum, r) => sum + Number(r.effectivePrice || 0) * (Number(r.quantity) || 0),
        0
      );
      return total.toFixed(2);
    },
    payTotal() {
      const total = Number(this.selectedTotal);
      const off = this.coupon ? this.coupon.couponAmount : 0;
      return Math.max(total - off, 0).toFixed(2);
    },
    canCheckout() {
      return this.selectedRows.length > 0 && !!this.addressId && !this.submitting;
    },
    checkoutDisabledReason() {
      if (!this.selectedRows.length) return '请先勾选要结算的商品';
      if (!this.addressId) return '请选择收货地址';
      return '';
    }
  },
  created() {
    this.fetchList();
    this.loadAddresses();
  },
  methods: {
    fetchList() {
      this.loading = true;
      getCartList()
        .then(res => {
          this.rows = res.dataList || [];
          this.selectedRows = [];
          // 顺手校准角标，每次进入列表都免费同步一次
          this.$store.commit('SET_CART_COUNT', this.rows.length);
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
        });
    },
    loadAddresses() {
      getMyAddressList()
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
    /** 核心防线：不可购买的行结构上就进不了 payload，Element 的全选也会自动跳过 */
    rowSelectable(row) {
      return !!row.available && !row.exceedStock;
    },
    rowClassName({ row }) {
      if (!row.available) return 'row-disabled';
      return row.exceedStock ? 'row-warn' : '';
    },
    lineTotal(row) {
      if (!row.available) return '-';
      return (Number(row.effectivePrice || 0) * (Number(row.quantity) || 0)).toFixed(2);
    },
    handleSelectionChange(sel) {
      this.selectedRows = sel;
    },
    onCouponChange(c) {
      this.coupon = c;
    },
    handleQuantityChange(row) {
      updateCartQuantity({ pId: row.pId, quantity: row.quantity })
        .then(res => {
          const r = res.daoResult || {};
          // 服务端对最终数量有决定权
          if (r.quantity != null) row.quantity = r.quantity;
          if (r.capped) this.$message.warning(`已达该商品可购上限 ${r.quantity} 件`);
        })
        // 失败就回源，不让界面撒谎
        .catch(() => this.fetchList());
    },
    clampQuantity(row) {
      row.quantity = row.stock;
      updateCartQuantity({ pId: row.pId, quantity: row.quantity })
        .then(() => this.fetchList())
        .catch(() => this.fetchList());
    },
    handleDelete(row) {
      this.$confirm('确认从购物车中删除该商品吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => deleteCartItem(row.pId))
        .then(() => {
          this.$message.success('已删除');
          this.fetchList();
        })
        .catch(() => {});
    },
    handleBatchDelete() {
      if (!this.selectedRows.length) return;
      const pIds = this.selectedRows.map(r => r.pId);
      this.$confirm(`确认删除所选 ${pIds.length} 种商品吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => batchDeleteCart(pIds))
        .then(() => {
          this.$message.success('已删除');
          this.fetchList();
        })
        .catch(() => {});
    },
    /**
     * 结算：把勾选行拼成一次 placeOrderV2（多商品落进同一张订单），成功后清车并跳支付页。
     * expectedPrice 取列表接口回传的实时有效价，不是本地快照。
     */
    handleCheckout() {
      if (this.submitting) return;
      if (!this.selectedRows.length) {
        this.$message.warning('请先勾选要结算的商品');
        return;
      }
      if (!this.addressId) {
        this.$message.warning('请选择收货地址');
        return;
      }
      const bad = this.selectedRows.filter(r => !r.available || r.exceedStock);
      if (bad.length) {
        this.$message.warning('存在不可购买的商品，请调整后再结算');
        return;
      }

      const user = this.$store.state.userInfo || {};
      const pIds = this.selectedRows.map(r => r.pId);
      this.submitting = true;
      placeOrderV2({
        uId: user.uId,
        addPerson: user.uName || (user.realName || 'anonymous'),
        addressId: this.addressId,
        orderStatus: 0,
        couponId: this.coupon ? this.coupon.couponId : null,
        expectedPayAmount: this.coupon ? Number(this.payTotal) : null,
        items: this.selectedRows.map(r => ({
          pId: r.pId,
          quantity: r.quantity,
          expectedPrice: Number(r.effectivePrice)
        }))
      })
        .then(res => {
          const oid = (res && res.daoResult && res.daoResult.oid) || null;
          this.$message.success('下单成功');
          // 订单已成立，购物车清理失败不能表现为下单失败
          return batchDeleteCart(pIds)
            .catch(() => {
              this.$message.warning('订单已提交，但购物车清理失败，请手动删除已购商品');
            })
            .then(() => oid);
        })
        .then(oid => {
          if (oid) {
            // 要跳去支付页了，fetchList 不会再执行，角标得单独校准
            this.$store.dispatch('refreshCartCount');
            this.$router.push('/pay/' + oid);
            return;
          }
          this.fetchList();
        })
        // 价格/库存类失败：回源让用户直接看到新价与新库存
        .catch(() => {
          this.fetchList();
        })
        .finally(() => {
          this.submitting = false;
        });
    },
    discountText(d) {
      if (!d) return '';
      return `${(d / 10).toFixed(1).replace(/\.0$/, '')} 折`;
    },
    formatAddressLabel(addr) {
      if (!addr) return '';
      const region = [addr.province, addr.city, addr.district].filter(v => v).join('');
      return `${addr.consignee} ${addr.phone} ${region}${addr.detail || ''}${addr.isDefault === 1 ? '（默认）' : ''}`;
    },
    goGallery() {
      this.$router.push('/gallery');
    },
    goAddress() {
      const user = this.$store.state.userInfo || {};
      this.$router.push(`/user/${user.uId}/address`);
    }
  }
};
</script>

<style scoped>
.cart-page {
  animation: fadeInUp 0.35s ease;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 4px;
}
.goods-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.goods-thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
  background: #f3f5fa;
}
.goods-thumb-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  font-size: 20px;
}
.goods-info {
  min-width: 0;
}
.goods-name {
  font-size: 14px;
  color: #1f2733;
  font-weight: 500;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.goods-tags {
  display: flex;
  align-items: center;
  gap: 6px;
}
.price-now {
  color: var(--color-price);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.price-origin {
  margin-left: 6px;
  color: #9aa3b2;
  text-decoration: line-through;
  font-size: 12px;
}
.cart-footer {
  margin-top: 16px;
  background: linear-gradient(180deg, #fafbff 0%, #f3f5fb 100%);
  border: 1px solid #e8ecf5;
  border-radius: 12px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.footer-meta {
  font-size: 13px;
  color: #5b6473;
  font-variant-numeric: tabular-nums;
}
.address-select {
  width: 320px;
}
.footer-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.total-text {
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
.form-tip {
  font-size: 12px;
  color: #8a93a4;
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
@media (max-width: 768px) {
  .cart-page {
    padding: 12px;
  }
  .address-select {
    width: 100%;
  }
  .footer-right {
    margin-left: 0;
    width: 100%;
  }
}
</style>

<style>
.cart-page .el-table .row-disabled {
  background: #fafafa;
}
.cart-page .el-table .row-disabled td {
  color: #c0c4cc;
}
.cart-page .el-table .row-warn {
  background: #fdf6ec;
}
</style>
