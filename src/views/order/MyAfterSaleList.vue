<template>
  <div class="my-aftersale-list list-page">
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
        <el-table-column type="expand">
          <template slot-scope="scope">
            <div class="expand-detail">
              <el-steps :active="progressOf(scope.row).active" :process-status="progressOf(scope.row).processStatus" align-center class="progress-steps">
                <el-step
                  v-for="(step, idx) in progressOf(scope.row).steps"
                  :key="idx"
                  :title="step.title"
                  :description="step.desc"
                  :status="step.status"
                />
              </el-steps>
              <div v-if="scope.row.status === 3 && scope.row.rejectReason" class="reject-box">
                <i class="el-icon-warning"></i>
                <span>商家拒绝原因：{{ scope.row.rejectReason }}</span>
              </div>
              <div v-if="imageList(scope.row.images).length" class="evidence-box">
                <span class="evidence-label">凭证图片：</span>
                <el-image
                  v-for="(img, idx) in imageList(scope.row.images)"
                  :key="idx"
                  :src="img"
                  fit="cover"
                  class="evidence-image"
                  :preview-src-list="imageList(scope.row.images)"
                />
              </div>
            </div>
          </template>
        </el-table-column>
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
    imageList(images) {
      if (!images) return [];
      return String(images).split(',').filter(u => !!u);
    },
    /** 售后进度：0 待审核 / 1 退款中 / 2 已退款 走三步正向流；3 拒绝、4 撤销为终态 */
    progressOf(row) {
      const t = time => formatTime(time);
      if (row.status === 4) {
        return {
          active: 2,
          processStatus: 'finish',
          steps: [
            { title: '提交申请', desc: t(row.createTime) },
            { title: '已撤销', desc: '', status: 'finish' }
          ]
        };
      }
      if (row.status === 3) {
        return {
          active: 2,
          processStatus: 'error',
          steps: [
            { title: '提交申请', desc: t(row.createTime) },
            { title: '商家已拒绝', desc: t(row.auditTime), status: 'error' }
          ]
        };
      }
      const active = row.status === 2 ? 3 : row.status === 1 ? 2 : 1;
      return {
        active,
        processStatus: 'process',
        steps: [
          { title: '提交申请', desc: t(row.createTime) },
          { title: row.status === 0 ? '商家审核中' : '商家已同意', desc: row.auditTime ? t(row.auditTime) : '等待商家处理' },
          { title: row.status === 2 ? '退款完成' : '退款处理中', desc: row.refundTime ? t(row.refundTime) : '' }
        ]
      };
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
.expand-detail {
  padding: 12px 24px;
}
.progress-steps {
  margin-bottom: 8px;
}
.progress-steps >>> .el-step__description {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.reject-box {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 10px 0;
  padding: 10px 14px;
  background: #fef0f0;
  border: 1px solid #fde2e2;
  border-radius: var(--radius-md);
  color: #f56c6c;
  font-size: 13px;
}
.evidence-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
}
.evidence-label {
  font-size: 13px;
  color: #4a5568;
}
.evidence-image {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-md);
  border: 1px solid #eef0f4;
  cursor: pointer;
}
</style>


