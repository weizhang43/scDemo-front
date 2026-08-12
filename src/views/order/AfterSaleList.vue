<template>
  <div class="aftersale-list list-page">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">售后管理</span>
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
        empty-text="暂无售后工单"
      >
        <el-table-column type="index" label="序号" width="70" align="center" :index="indexMethod" />
        <el-table-column label="订单编号" min-width="170" align="center">
          <template slot-scope="scope">
            <span class="order-no">{{ scope.row.orderNo || '#' + scope.row.oId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="申请人" width="120" align="center">
          <template slot-scope="scope">
            <span>{{ scope.row.uName || '#' + scope.row.uId }}</span>
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
        <el-table-column label="操作" width="220" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-document" @click="goOrder(scope.row.oId)">查看订单</el-button>
            <template v-if="scope.row.status === 0">
              <el-button type="text" icon="el-icon-check" class="btn-approve"
                         @click="handleApprove(scope.row)">同意</el-button>
              <el-button type="text" icon="el-icon-close" class="text-danger"
                         @click="handleReject(scope.row)">拒绝</el-button>
            </template>
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
import { queryAfterSale, auditAfterSale } from '../../api/aftersale';
import { formatTime, formatAmount, AFTERSALE_STATUS_MAP as STATUS_MAP } from '../../utils/format';

export default {
  name: 'AfterSaleList',
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
      queryAfterSale(params)
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
    handleApprove(row) {
      this.$confirm(
        `确认同意订单 ${row.orderNo || '#' + row.oId} 的售后申请吗？同意后将自动发起退款（¥${this.formatAmount(row.refundAmount)}）并回补库存。`,
        '审核确认',
        {
          confirmButtonText: '同意并退款',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
        .then(() => auditAfterSale(row.id, true))
        .then(() => {
          this.$message.success('已同意，退款处理中');
          this.fetchData();
        })
        .catch(() => {});
    },
    handleReject(row) {
      this.$prompt('请填写拒绝原因', '拒绝售后申请', {
        confirmButtonText: '确定拒绝',
        cancelButtonText: '取消',
        inputType: 'textarea',
        inputPlaceholder: '如：商品已使用、不符合退款条件等',
        inputValidator: val => {
          if (!val || !val.trim()) return '拒绝原因不能为空';
          if (val.trim().length > 200) return '拒绝原因不能超过200字';
          return true;
        }
      })
        .then(({ value }) => auditAfterSale(row.id, false, value.trim()))
        .then(() => {
          this.$message.success('已拒绝该售后申请');
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
.aftersale-list {
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
.btn-approve {
  color: #67c23a !important;
}
.btn-approve:hover {
  color: #529b2e !important;
}
</style>
