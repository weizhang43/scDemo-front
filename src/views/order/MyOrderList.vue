<template>
  <div class="my-order-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">我的订单</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="small" icon="el-icon-shopping-cart-2" @click="goGallery">去逛逛</el-button>
        </div>
      </div>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" prefix-icon="el-icon-document" clearable @keyup.enter.native="handleSearch" />
        </el-form-item>
        <el-form-item label="下单日期">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            value-format="yyyy-MM-dd"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            prefix-icon="el-icon-date"
            clearable
          />
        </el-form-item>
        <el-form-item class="search-actions">
          <el-button size="small" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
          <el-button size="small" icon="el-icon-refresh-right" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-tabs v-model="activeStatus" class="status-tabs" @tab-click="handleTabChange">
        <el-tab-pane v-for="tab in statusTabs" :key="tab.name" :name="tab.name">
          <span slot="label" class="tab-label">
            {{ tab.label }}
            <el-badge :value="statusCounts[tab.name] || 0" :max="999" class="tab-badge" />
          </span>
        </el-tab-pane>
      </el-tabs>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f3f5fa', color: '#2d3748', fontWeight: 600, textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        empty-text="暂无订单数据"
      >
        <el-table-column type="index" label="序号" width="70" align="center"
                         :index="indexMethod" />
        <el-table-column prop="orderNo" label="订单编号" min-width="180" align="center">
          <template slot-scope="scope">
            <span class="order-no">{{ scope.row.orderNo || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" min-width="200" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time cell-icon"></i>
            <span class="cell-time">{{ formatTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderAddress" label="收货地址" min-width="220" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-location-outline cell-icon"></i>
            <span class="cell-text">{{ scope.row.orderAddress || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" label="订单金额" width="140" align="center">
          <template slot-scope="scope">
            <span class="cell-amount">¥{{ formatAmount(scope.row.orderAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="statusTagType(scope.row.orderStatus)" size="small" effect="light">
              {{ statusText(scope.row.orderStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-document" @click="goDetail(scope.row.oid)">详情</el-button>
            <el-button v-if="scope.row.orderStatus == 0" type="text" icon="el-icon-wallet" @click="goPay(scope.row.oid)">支付</el-button>
            <el-button v-if="scope.row.orderStatus == 1" type="text" icon="el-icon-circle-check" class="btn-success" @click="changeStatus(scope.row, 2)">确认收货</el-button>
            <el-button v-if="scope.row.orderStatus == 2" type="text" icon="el-icon-star-off" :loading="reviewLoadingId === scope.row.oid" @click="openReview(scope.row)">评价</el-button>
            <el-button v-if="scope.row.orderStatus == 0 || scope.row.orderStatus == 1" type="text" icon="el-icon-close" class="btn-danger" @click="changeStatus(scope.row, -1)">取消</el-button>
            <el-button v-if="scope.row.orderStatus == -1 || scope.row.orderStatus == 2" type="text" icon="el-icon-delete" class="btn-danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          :current-page="pagination.pageNo"
          :page-size="pagination.pageSize"
          :page-sizes="[5, 10, 20, 50]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <order-review-dialog
      :visible.sync="reviewVisible"
      :o-id="reviewOId"
      :items="reviewItems"
      :reviewed-p-ids="reviewedPIds"
      @submitted="refresh"
    />
  </div>
</template>

<script>
import { queryOrder, updateOrderStatus, deleteOrder, orderStatusCount, getOrderById } from '../../api/order';
import { getOrderReviewedPIds } from '../../api/review';
import OrderReviewDialog from '../../components/OrderReviewDialog.vue';

const STATUS_MAP = {
  '-1': { label: '已取消', type: 'info' },
  '0': { label: '待支付', type: 'warning' },
  '1': { label: '待签收', type: 'primary' },
  '2': { label: '已完成', type: 'success' }
};

const STATUS_TABS = [
  { name: '0', label: '待支付' },
  { name: '1', label: '待签收' },
  { name: '2', label: '已完成' },
  { name: '-1', label: '已取消' }
];

const ACTION_TEXT = {
  '-1': '取消订单',
  '2': '确认收货'
};

export default {
  name: 'MyOrderList',
  components: { OrderReviewDialog },
  data() {
    return {
      searchForm: {
        orderNo: '',
        dateRange: []
      },
      activeStatus: '0',
      statusTabs: STATUS_TABS,
      statusCounts: {},
      tableData: [],
      loading: false,
      reviewVisible: false,
      reviewLoadingId: null,
      reviewOId: null,
      reviewItems: [],
      reviewedPIds: [],
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  created() {
    this.fetchData();
    this.fetchStatusCount();
  },
  methods: {
    buildFilterParams() {
      return {
        orderNo: this.searchForm.orderNo || '',
        createTimeStart: (this.searchForm.dateRange && this.searchForm.dateRange[0]) || '',
        createTimeEnd: (this.searchForm.dateRange && this.searchForm.dateRange[1]) || ''
      };
    },
    fetchData() {
      this.loading = true;
      const params = {
        ...this.buildFilterParams(),
        orderStatus: Number(this.activeStatus),
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize
      };
      queryOrder(params)
        .then(res => {
          const page = res.daoResult || {};
          this.tableData = page.records || [];
          this.pagination.total = page.total || 0;
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
        });
    },
    fetchStatusCount() {
      orderStatusCount(this.buildFilterParams())
        .then(res => {
          this.statusCounts = res.daoResult || {};
        })
        .catch(() => {});
    },
    refresh() {
      this.fetchData();
      this.fetchStatusCount();
    },
    handleTabChange() {
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    handleSearch() {
      this.pagination.pageNo = 1;
      this.refresh();
    },
    handleReset() {
      this.searchForm.orderNo = '';
      this.searchForm.dateRange = [];
      this.pagination.pageNo = 1;
      this.refresh();
    },
    handlePageChange(pageNo) {
      this.pagination.pageNo = pageNo;
      this.fetchData();
    },
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    indexMethod(index) {
      return (this.pagination.pageNo - 1) * this.pagination.pageSize + index + 1;
    },
    changeStatus(row, status) {
      const action = ACTION_TEXT[String(status)];
      this.$confirm(`是否确认${action}？`, '操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() =>
          updateOrderStatus(row.oid, status)
            .then(() => {
              this.$message.success(`${action}成功`);
              this.refresh();
            })
            .catch(() => {}))
        .catch(() => {});
    },
    handleDelete(row) {
      this.$confirm(`确认删除订单 ${row.orderNo || '#' + row.oid} 吗？此操作不可恢复。`, '删除确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => deleteOrder(row.oid))
        .then(() => {
          this.$message.success('删除成功');
          if (this.tableData.length === 1 && this.pagination.pageNo > 1) {
            this.pagination.pageNo -= 1;
          }
          this.refresh();
        })
        .catch(() => {});
    },
    goDetail(id) {
      this.$router.push(`/order/${id}`);
    },
    /** 整单评价：明细与已评列表都拿到手再开弹窗，避免弹窗先空后跳 */
    openReview(row) {
      if (this.reviewLoadingId) return;
      this.reviewLoadingId = row.oid;
      Promise.all([
        getOrderById(row.oid),
        getOrderReviewedPIds(row.oid).catch(() => ({ dataList: [] }))
      ])
        .then(([order, reviewed]) => {
          const items = (order && order.orderItems) || [];
          if (!items.length) {
            this.$message.warning('该订单没有可评价的商品');
            return;
          }
          this.reviewOId = row.oid;
          this.reviewItems = items.map(it => ({ pId: it.pId, pName: it.pName }));
          this.reviewedPIds = (reviewed.dataList || []).map(Number);
          this.reviewVisible = true;
        })
        .catch(() => {})
        .finally(() => {
          this.reviewLoadingId = null;
        });
    },
    goPay(id) {
      this.$router.push(`/pay/${id}`);
    },
    goGallery() {
      this.$router.push('/gallery');
    },
    statusText(status) {
      return (STATUS_MAP[status] || {}).label || '未知';
    },
    statusTagType(status) {
      return (STATUS_MAP[status] || {}).type || 'info';
    },
    formatAmount(amount) {
      if (amount === null || amount === undefined || amount === '') return '0.00';
      const num = Number(amount);
      if (isNaN(num)) return '0.00';
      return num.toFixed(2);
    },
    formatTime(time) {
      if (!time) return '-';
      const d = new Date(time);
      if (isNaN(d.getTime())) return String(time);
      const pad = n => (n < 10 ? '0' + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }
  }
};
</script>

<style scoped>
.my-order-list {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  margin-bottom: 18px;
  padding: 18px 20px 2px;
  background: #fafbfd;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 16px;
  align-items: flex-start;
}
.search-form >>> .el-form-item {
  margin-bottom: 16px;
}
.search-actions {
  margin-left: auto !important;
}
.search-actions >>> .el-form-item__content {
  margin-left: 0 !important;
}
.status-tabs {
  margin-bottom: 18px;
}
.tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
}
.tab-label >>> .el-badge__content {
  border: none;
  background: #e6e9f0;
  color: #6b7280;
  font-weight: 600;
  padding: 0 6px;
  height: 17px;
  line-height: 17px;
  border-radius: 9px;
  transition: background-color 0.2s ease, color 0.2s ease;
}
.search-form .el-button {
  border-radius: 8px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.search-form .el-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.pagination-wrap {
  margin-top: 18px;
  padding: 14px 4px 4px;
  text-align: right;
  border-top: 1px dashed #e8ebf2;
}
.order-no {
  font-family: 'Menlo', 'Consolas', monospace;
  color: #3b4a6b;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.cell-icon {
  color: #9aa3b2;
  margin-right: 6px;
}
.cell-time {
  color: #4a5568;
  font-variant-numeric: tabular-nums;
  font-size: 13px;
}
.cell-text {
  color: #4a5568;
  font-size: 13px;
}
.cell-amount {
  color: #e67700;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  font-family: 'Menlo', 'Consolas', monospace;
}
.btn-success {
  color: #67c23a !important;
}
.btn-success:hover {
  color: #529b2e !important;
}
.btn-danger {
  color: #f56c6c !important;
}
.btn-danger:hover {
  color: #d9363e !important;
}
</style>

<style>
.my-order-list .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.my-order-list .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.my-order-list .el-card__body {
  padding: 20px 24px 12px;
}
.my-order-list .search-form .el-form-item__label {
  color: #4a5568;
  font-weight: 500;
}
.my-order-list .search-form .el-input__inner {
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.my-order-list .search-form .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}
.my-order-list .el-table {
  border-radius: 10px;
  overflow: hidden;
}
.my-order-list .el-table th.el-table__cell {
  background: #f3f5fa !important;
  color: #2d3748;
  font-weight: 600;
  padding: 12px 0;
}
.my-order-list .el-table td.el-table__cell {
  border-bottom: 1px solid #eef0f4;
  padding: 12px 0;
}
.my-order-list .el-table--border,
.my-order-list .el-table--group {
  border: 1px solid #eef0f4;
}
.my-order-list .el-table--border th.el-table__cell,
.my-order-list .el-table--border td.el-table__cell {
  border-right: 1px solid #eef0f4;
}
.my-order-list .el-table__row:hover > td.el-table__cell {
  background-color: #f0f4ff !important;
}
.my-order-list .el-table .el-button--text {
  padding: 4px 6px;
}
.my-order-list .el-table .el-button--text:hover {
  color: #667eea;
}
.my-order-list .status-tabs .el-tabs__header {
  margin: 0;
}
.my-order-list .status-tabs .el-tabs__content {
  display: none;
}
.my-order-list .status-tabs .el-tabs__nav-wrap::after {
  display: none;
}
.my-order-list .status-tabs .el-tabs__active-bar {
  display: none;
}
.my-order-list .status-tabs .el-tabs__nav {
  display: inline-flex;
  gap: 8px;
  padding: 5px;
  background: #f3f5fa;
  border: 1px solid #eef0f4;
  border-radius: 12px;
}
.my-order-list .status-tabs .el-tabs__item {
  height: 34px;
  line-height: 34px;
  padding: 0 18px !important;
  color: #6b7280;
  border-radius: 9px;
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}
.my-order-list .status-tabs .el-tabs__item:hover {
  color: #667eea;
}
.my-order-list .status-tabs .el-tabs__item.is-active {
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.32);
}
.my-order-list .status-tabs .el-tabs__item.is-active .el-badge__content {
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
}
</style>
