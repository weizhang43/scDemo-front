<template>
  <div class="order-detail">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">订单详情</span>
          <span v-if="order" class="header-meta header-meta--id">订单 {{ order.orderNo || '#' + order.oid }}</span>
        </div>
        <el-button type="text" icon="el-icon-back" @click="goBack">返回列表</el-button>
      </div>

      <div v-if="order" class="detail-body">
        <div class="detail-hero">
          <div class="hero-icon">
            <i class="el-icon-document"></i>
          </div>
          <div class="hero-info">
            <div class="hero-name">订单 {{ order.orderNo || '#' + order.oid }}</div>
            <div class="hero-sub">
              <span class="hero-person">
                <i class="el-icon-user-solid"></i>{{ order.addPerson || '-' }}
              </span>
              <span class="hero-time">
                <i class="el-icon-time"></i>{{ formatTime(order.createTime) }}
              </span>
            </div>
          </div>
        </div>

        <el-descriptions :column="2" border class="detail-desc">
          <el-descriptions-item label="订单编号">
            <span class="desc-no">{{ order.orderNo || '-' }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="订单ID">
            <span class="desc-id">#{{ order.oid }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="下单人">
            <i class="el-icon-user-solid desc-icon"></i>{{ order.addPerson || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="订单状态">
            <el-tag :type="statusTagType(order.orderStatus)" size="small" effect="light">
              {{ statusText(order.orderStatus) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下单时间" :span="2">
            <i class="el-icon-time desc-icon"></i>{{ formatTime(order.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="下单地址" :span="2">
            <i class="el-icon-location-outline desc-icon"></i>{{ order.orderAddress || '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="下单金额" :span="2">
            <i class="el-icon-wallet desc-icon"></i>
            <span class="desc-amount">¥{{ formatAmount(order.orderAmount) }}</span>
          </el-descriptions-item>
        </el-descriptions>

        <div v-if="canApplyAfterSale" class="aftersale-apply-row">
          <el-button type="warning" plain size="small" icon="el-icon-refresh-left" @click="afterSaleVisible = true">
            申请售后
          </el-button>
        </div>

        <div v-if="afterSale" class="goods-section">
          <div class="section-title">
            <i class="el-icon-refresh-left"></i>
            <span>售后信息</span>
          </div>
          <el-descriptions :column="2" border class="detail-desc">
            <el-descriptions-item label="售后状态">
              <el-tag :type="afterSaleTagType(afterSale.status)" size="small" effect="light">
                {{ afterSaleStatusText(afterSale.status) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="退款金额">
              <span class="desc-amount">¥{{ formatAmount(afterSale.refundAmount) }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="申请原因" :span="2">
              {{ afterSale.reason || '-' }}
            </el-descriptions-item>
            <el-descriptions-item v-if="afterSale.status === 3" label="拒绝原因" :span="2">
              {{ afterSale.rejectReason || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="申请时间" :span="2">
              <i class="el-icon-time desc-icon"></i>{{ formatTime(afterSale.createTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div v-if="hasShipInfo" class="goods-section">
          <div class="section-title">
            <i class="el-icon-truck"></i>
            <span>物流信息</span>
          </div>
          <el-descriptions :column="2" border class="detail-desc">
            <el-descriptions-item label="快递公司">
              {{ order.shippingCompany || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="快递单号">
              <span class="desc-no">{{ order.trackingNo || '-' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="发货时间">
              <i class="el-icon-time desc-icon"></i>{{ formatTime(order.shipTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="收货时间">
              <i class="el-icon-time desc-icon"></i>{{ order.receiveTime ? formatTime(order.receiveTime) : '待收货' }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="goods-section">
          <div class="section-title">
            <i class="el-icon-goods"></i>
            <span>商品列表</span>
            <span class="section-count">共 {{ orderItems.length }} 件</span>
          </div>
          <el-table
            v-if="orderItems.length"
            :data="orderItems"
            border
            stripe
            class="goods-table"
            :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600 }"
            empty-text="暂无商品"
          >
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column label="商品名称" min-width="150" align="center" >
              <template slot-scope="scope">
                <i class="el-icon-goods cell-icon"></i>
                <span class="cell-strong">{{ scope.row.pName || scope.row.productName || scope.row.pname || '-' }}</span>
              </template>
            </el-table-column>
            <el-table-column label="单价" min-width="140" align="center">
              <template slot-scope="scope">
                <span class="cell-amount">¥{{ formatAmount(scope.row.price) }}</span>
              </template>
            </el-table-column>
            <el-table-column label="数量" min-width="120" align="center">
              <template slot-scope="scope">
                <span class="cell-qty">×{{ scope.row.quantity || scope.row.qty || 0 }}</span>
              </template>
            </el-table-column>
            <el-table-column label="小计" min-width="140" align="center">
              <template slot-scope="scope">
                <span class="cell-amount">¥{{ formatAmount(subtotal(scope.row)) }}</span>
              </template>
            </el-table-column>
            <!-- 点赞与评价是顾客专属动作，本路由商家也能进，故整列门控 -->
            <el-table-column v-if="isCustomer" label="操作" width="170" align="center">
              <template slot-scope="scope">
                <el-button
                  v-if="liked(scope.row.pId)"
                  type="text"
                  icon="el-icon-thumb"
                  disabled
                >已赞</el-button>
                <el-button
                  v-else
                  type="text"
                  icon="el-icon-thumb"
                  :loading="likingId === scope.row.pId"
                  @click="handleLike(scope.row)"
                >点赞</el-button>
                <template v-if="canReview">
                  <el-button v-if="reviewed(scope.row.pId)" type="text" icon="el-icon-star-on" disabled>已评价</el-button>
                  <el-button v-else type="text" icon="el-icon-star-off" @click="openReview(scope.row)">评价</el-button>
                </template>
              </template>
            </el-table-column>
          </el-table>
          <el-empty v-else description="该订单暂无商品明细" :image-size="80" />
        </div>
      </div>

      <el-empty v-else description="未找到订单信息" />
    </el-card>

    <order-review-dialog
      :visible.sync="reviewVisible"
      :o-id="order && order.oid"
      :items="reviewItems"
      :reviewed-p-ids="reviewedPIds"
      @submitted="loadReviewedPIds"
    />

    <after-sale-apply-dialog
      :visible.sync="afterSaleVisible"
      :o-id="order && order.oid"
      :order-no="(order && order.orderNo) || ''"
      :refund-amount="order && order.orderAmount"
      @submitted="loadAfterSale"
    />
  </div>
</template>

<script>
import { getOrderById } from '../../api/order';
import { likeProduct, getMyLikedProducts } from '../../api/product';
import { getOrderReviewedPIds } from '../../api/review';
import { getAfterSaleByOrder } from '../../api/aftersale';
import OrderReviewDialog from '../../components/OrderReviewDialog.vue';
import AfterSaleApplyDialog from '../../components/AfterSaleApplyDialog.vue';
import { formatTime, formatAmount, ORDER_STATUS_MAP as STATUS_MAP, AFTERSALE_STATUS_MAP } from '../../utils/format';

export default {
  name: 'OrderDetail',
  components: { OrderReviewDialog, AfterSaleApplyDialog },
  data() {
    return {
      order: null,
      loading: false,
      likedPIds: [],
      reviewedPIds: [],
      likingId: null,
      reviewVisible: false,
      reviewItems: [],
      afterSale: null,
      afterSaleVisible: false
    };
  },
  computed: {
    orderItems() {
      const o = this.order || {};
      const list = o.items || o.orderItems || o.productList || o.goodsList || o.details || [];
      return Array.isArray(list) ? list : [];
    },
    isCustomer() {
      return this.$store.getters.userType === 2;
    },
    canReview() {
      return this.isCustomer && Number((this.order || {}).orderStatus) === 2;
    },
    hasShipInfo() {
      const o = this.order || {};
      return !!(o.shippingCompany || o.trackingNo || o.shipTime);
    },
    canApplyAfterSale() {
      if (!this.isCustomer || !this.order) return false;
      const status = Number(this.order.orderStatus);
      if (status !== 2 && status !== 3) return false;
      // 已有在途/已退款工单不可再申请；被拒/已取消可重新申请
      return !this.afterSale || this.afterSale.status === 3 || this.afterSale.status === 4;
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    liked(pId) {
      return this.likedPIds.indexOf(Number(pId)) > -1;
    },
    reviewed(pId) {
      return this.reviewedPIds.indexOf(Number(pId)) > -1;
    },
    /** 按钮态接口失败只影响按钮显示，不该拖垮详情页主体，故一律静默 */
    loadLikedPIds() {
      const pIds = this.orderItems.map(it => Number(it.pId)).filter(id => id);
      if (!pIds.length) return;
      getMyLikedProducts(pIds)
        .then(res => {
          this.likedPIds = (res.dataList || []).map(Number);
        })
        .catch(() => {});
    },
    loadReviewedPIds() {
      const oid = (this.order || {}).oid;
      if (!oid) return;
      getOrderReviewedPIds(oid)
        .then(res => {
          this.reviewedPIds = (res.dataList || []).map(Number);
        })
        .catch(() => {});
    },
    loadAfterSale() {
      const oid = (this.order || {}).oid;
      if (!oid) return;
      getAfterSaleByOrder(oid)
        .then(res => {
          this.afterSale = res.daoResult || null;
        })
        .catch(() => {});
    },
    handleLike(row) {
      if (this.likingId) return;
      this.likingId = row.pId;
      likeProduct(row.pId)
        .then(() => {
          this.$message.success('点赞成功');
          this.likedPIds = this.likedPIds.concat(Number(row.pId));
        })
        .catch(() => {})
        .finally(() => {
          this.likingId = null;
        });
    },
    openReview(row) {
      this.reviewItems = [{ pId: row.pId, pName: row.pName }];
      this.reviewVisible = true;
    },
    subtotal(row) {
      const price = Number(row && row.price) || 0;
      const qty = Number(row && (row.quantity != null ? row.quantity : row.qty)) || 0;
      return price * qty;
    },
    formatAmount,
    fetchData() {
      const id = this.$route.params.id;
      if (!id) return;
      this.loading = true;
      getOrderById(id)
        .then(res => {
          this.order = res;
          if (this.isCustomer) {
            this.loadLikedPIds();
            this.loadReviewedPIds();
            this.loadAfterSale();
          }
        })
        .catch(() => {
          this.order = null;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    goBack() {
      this.$router.push(this.$store.getters.userType === 2 ? '/my-orders' : '/orders');
    },
    statusText(status) {
      return (STATUS_MAP[status] || {}).label || '未知';
    },
    statusTagType(status) {
      return (STATUS_MAP[status] || {}).type || 'info';
    },
    afterSaleStatusText(status) {
      return (AFTERSALE_STATUS_MAP[status] || {}).label || '未知';
    },
    afterSaleTagType(status) {
      return (AFTERSALE_STATUS_MAP[status] || {}).type || 'info';
    },
    formatTime
  }
};
</script>

<style scoped>
.order-detail {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.header-meta--id {
  font-family: var(--font-mono);
}
.detail-body {
  padding: 4px 0;
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
  background: var(--gradient-brand);
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
  font-family: var(--font-mono);
}
.hero-sub {
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}
.hero-person,
.hero-time {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #4a5568;
}
.hero-person i {
  color: var(--color-primary);
}
.hero-time i {
  color: #9aa3b2;
}
.hero-time {
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
  font-family: var(--font-mono);
  color: #4c5163;
}
.desc-no {
  font-family: var(--font-mono);
  color: #3b4a6b;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.desc-icon {
  color: #9aa3b2;
  margin-right: 6px;
}
.desc-amount {
  color: var(--color-price);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
  letter-spacing: 0.3px;
}
.goods-section {
  margin-top: 20px;
}
.aftersale-apply-row {
  margin-top: 14px;
  text-align: right;
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
.goods-table {
  border-radius: 10px;
  overflow: hidden;
}
.cell-icon {
  color: #9aa3b2;
  margin-right: 6px;
}
.cell-strong {
  font-weight: 600;
  color: #1f2733;
}
.cell-amount {
  color: var(--color-price);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
}
.cell-qty {
  color: #4a5568;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
}
.goods-table >>> .el-table__row:hover > td.el-table__cell {
  background-color: #f0f4ff !important;
}
</style>

<style>
.order-detail .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.order-detail .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.order-detail .el-card__body {
  padding: 20px 24px;
}
.order-detail .el-descriptions--border .el-descriptions__body {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #eef0f4;
}
.order-detail .el-descriptions--border .el-descriptions__body {
  border-collapse: separate;
}
</style>
