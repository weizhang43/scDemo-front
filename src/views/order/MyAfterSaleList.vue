<template>
  <div class="my-aftersale-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">我的售后</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
        </div>
        <div class="header-actions">
          <el-select v-model="statusFilter" size="small" placeholder="全部状态" clearable style="width: 140px;" @change="handleSearch">
            <el-option v-for="(item, key) in STATUS_MAP" :key="key" :label="item.label" :value="Number(key)" />
          </el-select>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600, textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        empty-text="暂无售后记录"
      >
        <el-table-column type="index" label="序号" width="70" align="center" :index="indexMethod" />
        <el-table-column label="订单编号" min-width="170" align="center">
          <template slot-scope="scope">
            <span class="order-no">{{ scope.row.orderNo || '#' + scope.row.oId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="reason" label="申请原因" min-width="200" align="center" show-overflow-tooltip />
        <el-table-column label="退款金额" width="130" align="center">
          <template slot-scope="scope">
            <span class="cell-amount">¥{{ formatAmount(scope.row.refundAmount) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="120" align="center">
          <template slot-scope="scope">
            <el-tooltip v-if="scope.row.status === 3 && scope.row.rejectReason"
                        :content="'拒绝原因：' + scope.row.rejectReason" placement="top">
              <el-tag :type="statusTagType(scope.row.status)" size="small" effect="light">
                {{ statusText(scope.row.status) }}
              </el-tag>
            </el-tooltip>
            <el-tag v-else :type="statusTagType(scope.row.status)" size="small" effect="light">
              {{ statusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="申请时间" min-width="180" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time cell-icon"></i>
            <span class="cell-time">{{ formatTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-document" @click="goOrder(scope.row.oId)">查看订单</el-button>
            <el-button v-if="scope.row.status === 0" type="text" icon="el-icon-close" class="text-danger"
                       @click="handleCancel(scope.row)">撤销</el-button>
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
  </div>
</template>

<script>
import { myAfterSaleList, cancelAfterSale } from '../../api/aftersale';
import { formatTime, formatAmount, AFTERSALE_STATUS_MAP as STATUS_MAP } from '../../utils/format';

export default {
  name: 'MyAfterSaleList',
  data() {
    return {
      STATUS_MAP,
      statusFilter: null,
      tableData: [],
      loading: false,
      pagination: {
        pageNo: 1,
        pageSize: 10,
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
      const params = {
        pageNo: this.pagination.pageNo,
        pageSize: this.pagination.pageSize
      };
      if (this.statusFilter !== null && this.statusFilter !== '') {
        params.status = this.statusFilter;
      }
      myAfterSaleList(params)
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
    handleSearch() {
      this.pagination.pageNo = 1;
      this.fetchData();
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
    handleCancel(row) {
      this.$confirm(`确认撤销订单 ${row.orderNo || '#' + row.oId} 的售后申请吗？`, '撤销确认', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => cancelAfterSale(row.id))
        .then(() => {
          this.$message.success('已撤销售后申请');
          this.fetchData();
        })
        .catch(() => {});
    },
    goOrder(oId) {
      this.$router.push(`/order/${oId}`);
    },
    statusText(status) {
      return (STATUS_MAP[status] || {}).label || '未知';
    },
    statusTagType(status) {
      return (STATUS_MAP[status] || {}).type || 'info';
    },
    formatAmount,
    formatTime
  }
};
</script>

<style scoped>
.my-aftersale-list {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.order-no {
  font-family: var(--font-mono);
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
.cell-amount {
  color: var(--color-price);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
}
</style>

<style>
.my-aftersale-list .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.my-aftersale-list .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.my-aftersale-list .el-card__body {
  padding: 20px 24px 12px;
}
.my-aftersale-list .el-table {
  border-radius: 10px;
  overflow: hidden;
}
.my-aftersale-list .el-table th.el-table__cell {
  background: #f5f7fb !important;
  color: #4a5568;
  font-weight: 600;
  padding: 12px 0;
}
.my-aftersale-list .el-table td.el-table__cell {
  border-bottom: 1px solid #eef0f4;
  padding: 12px 0;
}
.my-aftersale-list .el-table__row:hover > td.el-table__cell {
  background-color: #f0f4ff !important;
}
.my-aftersale-list .el-table .el-button--text {
  padding: 4px 6px;
}
.my-aftersale-list .el-table .el-button--text:hover {
  color: var(--color-primary);
}
</style>
