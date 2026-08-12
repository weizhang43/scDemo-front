<template>
  <div class="seckill-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">秒杀活动</span>
          <span class="header-meta">共 {{ pagination.total }} 条</span>
        </div>
        <div class="header-actions">
          <span class="header-tip">在「商品管理」中选择商品即可发布新的秒杀活动</span>
          <el-button type="primary" size="small" icon="el-icon-goods" @click="$router.push('/products')">去发布</el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600 }"
      >
        <el-table-column type="index" label="序号" width="60" align="center" :index="indexMethod" />
        <el-table-column label="商品" min-width="220">
          <template slot-scope="scope">
            <div class="product-cell">
              <el-image v-if="scope.row.imageUrl" :src="scope.row.imageUrl" fit="cover" class="product-thumb" />
              <i v-else class="el-icon-picture-outline no-image" />
              <div class="product-info">
                <div class="product-name">{{ scope.row.pName }}</div>
                <div class="product-sub">原价 ¥ {{ scope.row.price }} · 库存 {{ scope.row.productStock }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="秒杀价" width="110" align="center">
          <template slot-scope="scope">
            <span class="seckill-price">¥ {{ scope.row.seckillPrice }}</span>
          </template>
        </el-table-column>
        <el-table-column label="名额" width="110" align="center">
          <template slot-scope="scope">
            <span class="remain-stock">{{ scope.row.remainStock }}</span>
            <span class="quota-total"> / {{ scope.row.seckillStock }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="160" align="center" />
        <el-table-column prop="endTime" label="结束时间" width="160" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template slot-scope="scope">
            <el-tag :type="phaseOf(scope.row).type" size="mini" effect="plain">{{ phaseOf(scope.row).text }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="90" align="center" fixed="right">
          <template slot-scope="scope">
            <el-button
              v-if="cancelable(scope.row)"
              type="text"
              icon="el-icon-close"
              class="text-danger"
              @click="handleCancel(scope.row)"
            >取消</el-button>
            <span v-else class="cell-muted">—</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
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
import { seckillPageQuery, cancelSeckill } from '../../api/seckill';

export default {
  name: 'SeckillActivityList',
  data() {
    return {
      tableData: [],
      loading: false,
      pagination: { pageNo: 1, pageSize: 10, total: 0 }
    };
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      this.loading = true;
      seckillPageQuery({ pageNo: this.pagination.pageNo, pageSize: this.pagination.pageSize })
        .then(res => {
          const page = res.daoResult || {};
          this.tableData = page.records || [];
          this.pagination.total = page.total || 0;
        })
        .catch(() => {})
        .finally(() => { this.loading = false; });
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
    /** 后端返回 'yyyy-MM-dd HH:mm:ss'，替换成 '/' 兼容 Safari 解析 */
    phaseOf(row) {
      if (row.status === 0) return { text: '已取消', type: 'danger' };
      const now = Date.now();
      const start = new Date(String(row.startTime || '').replace(/-/g, '/')).getTime();
      const end = new Date(String(row.endTime || '').replace(/-/g, '/')).getTime();
      if (now < start) return { text: '未开始', type: 'info' };
      if (now > end) return { text: '已结束', type: '' };
      return { text: '进行中', type: 'success' };
    },
    cancelable(row) {
      const text = this.phaseOf(row).text;
      return text === '未开始' || text === '进行中';
    },
    handleCancel(row) {
      this.$confirm('取消后顾客将无法再参与该场秒杀，是否继续？', '确认取消活动', { type: 'warning' })
        .then(() => cancelSeckill(row.id))
        .then(() => {
          this.$message.success('活动已取消');
          this.fetchData();
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.seckill-list {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header-tip {
  font-size: 12px;
  color: #8a93a4;
}
.header-actions .el-button {
  border-radius: 8px;
}
.product-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.product-thumb {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  border: 1px solid #e8ecf5;
  flex-shrink: 0;
}
.no-image {
  font-size: 26px;
  color: #c0c4cc;
  width: 44px;
  text-align: center;
}
.product-info {
  min-width: 0;
}
.product-name {
  font-weight: 600;
  color: #1f2733;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.product-sub {
  font-size: 12px;
  color: #8a93a4;
  margin-top: 2px;
}
.seckill-price {
  color: var(--color-price);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.remain-stock {
  color: var(--color-primary);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.quota-total {
  color: #8a93a4;
  font-size: 12px;
}
.cell-muted {
  color: #c0c4cc;
}
</style>

<style>
.seckill-list .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
}
.seckill-list .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}
.seckill-list .el-card__body {
  padding: 20px 24px 12px;
}
.seckill-list .el-table {
  border-radius: 10px;
  overflow: hidden;
}
.seckill-list .el-table th.el-table__cell {
  background: #f5f7fb !important;
  color: #4a5568;
  font-weight: 600;
  padding: 12px 0;
}
.seckill-list .el-table td.el-table__cell {
  border-bottom: 1px solid #eef0f4;
  padding: 10px 0;
}
.seckill-list .el-table__row:hover > td.el-table__cell {
  background-color: #f0f4ff !important;
}
</style>
