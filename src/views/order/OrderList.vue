<template>
  <div class="order-list list-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">订单列表</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
        </div>
        <div class="header-actions">
          <el-button type="info" size="small" icon="el-icon-download" :loading="exporting" @click="handleExport">导出</el-button>
        </div>
      </div>
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="订单编号">
          <el-input v-model="searchForm.orderNo" placeholder="请输入订单编号" prefix-icon="el-icon-document" clearable @keyup.enter.native="handleSearch" />
        </el-form-item>
        <el-form-item label="下单人">
          <el-input v-model="searchForm.key" placeholder="请输入下单人关键字" prefix-icon="el-icon-user" clearable @keyup.enter.native="handleSearch" />
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

      <el-tabs v-model="activeStatus" class="status-tabs pill-tabs" @tab-click="handleTabChange">
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
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600, textAlign: 'center' }"
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
        <el-table-column prop="addPerson" label="下单人" min-width="160" align="center">
          <template slot-scope="scope">
            <i class="el-icon-user-solid cell-icon"></i>
            <span class="cell-strong">{{ scope.row.addPerson || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="下单时间" min-width="200" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time cell-icon"></i>
            <span class="cell-time">{{ formatTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="orderAddress" label="下单地址" min-width="220" align="center" show-overflow-tooltip>
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
        <el-table-column label="操作" width="300" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-document" @click="goDetail(scope.row.oid)">详情</el-button>
            <el-button v-if="scope.row.orderStatus == 1" type="text" icon="el-icon-truck" @click="openShipDialog(scope.row)">发货</el-button>
            <el-button v-if="scope.row.orderStatus == 0 || scope.row.orderStatus == 1" type="text" icon="el-icon-delete" class="text-danger" @click="updateOrderStatus(scope.row.oid,-1)">取消订单</el-button>
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

      <el-dialog title="订单发货" :visible.sync="shipDialogVisible" width="480px" :close-on-click-modal="false">
        <el-form ref="shipForm" :model="shipForm" :rules="shipRules" label-width="90px">
          <el-form-item label="订单编号">
            <span class="order-no">{{ shipForm.orderNo || '-' }}</span>
          </el-form-item>
          <el-form-item label="快递公司" prop="shippingCompany">
            <el-input v-model="shipForm.shippingCompany" placeholder="请输入快递公司" maxlength="64" />
          </el-form-item>
          <el-form-item label="快递单号" prop="trackingNo">
            <el-input v-model="shipForm.trackingNo" placeholder="请输入快递单号" maxlength="64" />
          </el-form-item>
        </el-form>
        <div slot="footer">
          <el-button @click="shipDialogVisible = false">取 消</el-button>
          <el-button type="primary" :loading="shipSubmitting" @click="confirmShip">确认发货</el-button>
        </div>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { queryOrder, updateOrderStatus, exportOrder, orderStatusCount, shipOrder } from '../../api/order';
import { downloadBlob } from '../../utils/export';
import { formatTime, formatAmount, ORDER_STATUS_MAP as STATUS_MAP } from '../../utils/format';

const STATUS_TABS = [
  { name: '0', label: '待支付' },
  { name: '1', label: '待发货' },
  { name: '3', label: '已发货' },
  { name: '2', label: '已完成' },
  { name: '-1', label: '已取消' }
];

/** 商家最关心待发货，默认落在该页签 */
const DEFAULT_STATUS = '1';

export default {
  name: 'OrderList',
  data() {
    const queryStatus = String(this.$route.query.status || '');
    const activeStatus = STATUS_TABS.some(t => t.name === queryStatus) ? queryStatus : DEFAULT_STATUS;
    return {
      searchForm: {
        key: '',
        orderNo: '',
        dateRange: []
      },
      activeStatus,
      statusTabs: STATUS_TABS,
      statusCounts: {},
      tableData: [],
      loading: false,
      pagination: {
        pageNo: 1,
        pageSize: 10,
        total: 0
      },
      exporting: false,
      shipDialogVisible: false,
      shipSubmitting: false,
      shipForm: {
        id: null,
        orderNo: '',
        shippingCompany: '',
        trackingNo: ''
      },
      shipRules: {
        shippingCompany: [{ required: true, message: '请输入快递公司', trigger: 'blur' }],
        trackingNo: [{ required: true, message: '请输入快递单号', trigger: 'blur' }]
      }
    };
  },
  created() {
    this.fetchData();
    this.fetchStatusCount();
  },
  watch: {
    '$route.query.status'(val) {
      const status = String(val || '');
      if (STATUS_TABS.some(t => t.name === status) && status !== this.activeStatus) {
        this.activeStatus = status;
        this.handleTabChange();
      }
    }
  },
  methods: {
    buildFilterParams() {
      return {
        key: this.searchForm.key || '',
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
    handleTabChange() {
      this.pagination.pageNo = 1;
      this.fetchData();
    },
    handleSearch() {
      this.pagination.pageNo = 1;
      this.fetchData();
      this.fetchStatusCount();
    },
    handleReset() {
      this.searchForm.key = '';
      this.searchForm.orderNo = '';
      this.searchForm.dateRange = [];
      this.pagination.pageNo = 1;
      this.fetchData();
      this.fetchStatusCount();
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
    updateOrderStatus(id,status){
      this.$confirm('是否确认取消订单？取消后将回补库存。', '操作确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
          .then(() =>
              updateOrderStatus(id, status).then(() => {
                this.$message.success('操作成功');
                this.fetchData();
                this.fetchStatusCount();
              })
              .catch(() => {}))
          .catch(() => {});
    },
    goDetail(id) {
      this.$router.push(`/order/${id}`);
    },
    openShipDialog(row) {
      this.shipForm = {
        id: row.oid,
        orderNo: row.orderNo,
        shippingCompany: '',
        trackingNo: ''
      };
      this.shipDialogVisible = true;
      this.$nextTick(() => {
        if (this.$refs.shipForm) this.$refs.shipForm.clearValidate();
      });
    },
    confirmShip() {
      this.$refs.shipForm.validate(valid => {
        if (!valid) return;
        this.shipSubmitting = true;
        shipOrder(this.shipForm.id, this.shipForm.shippingCompany.trim(), this.shipForm.trackingNo.trim())
          .then(() => {
            this.$message.success('发货成功');
            this.shipDialogVisible = false;
            this.fetchData();
            this.fetchStatusCount();
          })
          .catch(() => {})
          .finally(() => {
            this.shipSubmitting = false;
          });
      });
    },
    statusText(status) {
      return (STATUS_MAP[status] || {}).label || '未知';
    },
    statusTagType(status) {
      return (STATUS_MAP[status] || {}).type || 'info';
    },
    formatAmount,
    formatTime,
    handleExport() {
      const params = {
        ...this.buildFilterParams(),
        orderStatus: Number(this.activeStatus)
      };
      this.exporting = true;
      exportOrder(params)
        .then(res => downloadBlob(res, '订单列表.xlsx'))
        .catch(() => {})
        .finally(() => { this.exporting = false; });
    }
  }
};
</script>

<style scoped>
.search-form {
  margin-bottom: 18px;
  padding: 18px 20px 2px;
  background: #fafbfd;
  border: 1px solid #eef0f4;
  border-radius: var(--radius-md);
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
  border-radius: var(--radius-sm);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.search-form .el-button:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.order-id {
  font-family: var(--font-mono);
  color: #4c5163;
  font-size: 13px;
}
.order-no {
  font-family: var(--font-mono);
  color: #3b4a6b;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.3px;
}
.cell-strong {
  font-weight: 600;
  color: #1f2733;
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
  color: var(--color-price);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
}
</style>

<style>
/* 页面特有：激活 tab 内徽标配色 */
.order-list .status-tabs .el-tabs__item.is-active .el-badge__content {
  background: rgba(255, 255, 255, 0.28);
  color: #fff;
}
</style>

