<template>
  <div class="my-review-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">我的评价</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
        </div>
        <div class="header-actions">
          <el-button type="primary" size="small" icon="el-icon-s-order" @click="goOrders">我的订单</el-button>
        </div>
      </div>

      <el-table
        v-if="tableData.length"
        :data="tableData"
        v-loading="loading"
        border
        stripe
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600 }"
      >
        <el-table-column type="index" :index="indexMethod" label="序号" width="70" align="center" />
        <el-table-column label="商品名称" min-width="180" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <i class="el-icon-goods cell-icon"></i>
            <span class="cell-strong">{{ scope.row.pName || ('商品 #' + scope.row.pId) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="星级" width="170" align="center">
          <template slot-scope="scope">
            <el-rate :value="scope.row.rating || 0" disabled class="row-rate" />
          </template>
        </el-table-column>
        <el-table-column label="评论内容" min-width="240" align="center" show-overflow-tooltip>
          <template slot-scope="scope">
            <span :class="scope.row.content ? 'cell-text' : 'cell-muted'">
              {{ scope.row.content || '未填写评价内容' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="评价时间" width="180" align="center">
          <template slot-scope="scope">
            <i class="el-icon-time cell-icon"></i>
            <span class="cell-time">{{ formatTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" icon="el-icon-goods" @click="goProduct(scope.row.pId)">查看商品</el-button>
            <el-button type="text" icon="el-icon-document" @click="goOrder(scope.row.oId)">查看订单</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-else-if="!loading" description="还没有评价过商品">
        <el-button type="primary" size="small" @click="goOrders">去我的订单</el-button>
      </el-empty>

      <div v-if="pagination.total" class="pagination-wrap">
        <el-pagination
          :current-page="pagination.pageNo"
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50]"
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
import { getMyReviews } from '../../api/review';

export default {
  name: 'MyReviewList',
  data() {
    return {
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
      getMyReviews({ pageNo: this.pagination.pageNo, pageSize: this.pagination.pageSize })
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
    goProduct(pId) {
      this.$router.push(`/product-buy/${pId}`);
    },
    goOrder(oId) {
      this.$router.push(`/order/${oId}`);
    },
    goOrders() {
      this.$router.push('/my-orders');
    },
    formatTime(time) {
      if (!time) return '-';
      const d = new Date(time);
      if (isNaN(d.getTime())) return String(time);
      const pad = n => (n < 10 ? '0' + n : n);
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    }
  }
};
</script>

<style scoped>
.my-review-list {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.cell-icon {
  color: #9aa3b2;
  margin-right: 6px;
}
.cell-strong {
  font-weight: 600;
  color: #1f2733;
}
.cell-text {
  color: #4a5568;
}
.cell-muted {
  color: #b3bac6;
  font-style: italic;
}
.cell-time {
  color: #4a5568;
  font-variant-numeric: tabular-nums;
  font-family: var(--font-mono);
}
.row-rate {
  line-height: 1;
}
</style>

<style>
.my-review-list .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.my-review-list .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.my-review-list .el-card__body {
  padding: 20px 24px;
}
.my-review-list .el-rate__icon {
  margin-right: 2px;
  font-size: 15px;
}
</style>
