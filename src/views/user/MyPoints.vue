<template>
  <div class="my-points list-page">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">我的积分</span>
          <span class="header-meta">{{ summary.levelName || '普通会员' }}</span>
        </div>
        <div class="header-actions">
          <el-button size="small" icon="el-icon-refresh" @click="loadAll">刷新</el-button>
        </div>
      </div>

      <div class="points-hero">
        <div class="points-balance">
          <div class="balance-label">当前积分</div>
          <div class="balance-value">{{ summary.balance == null ? 0 : summary.balance }}</div>
        </div>
        <div class="points-level">
          <div class="level-row">
            <el-tag :type="levelTagType" size="small" effect="dark">{{ summary.levelName || '普通会员' }}</el-tag>
            <span class="level-earned">累计获取 {{ summary.totalEarned == null ? 0 : summary.totalEarned }} 分</span>
          </div>
          <el-progress
            :percentage="levelProgress"
            :stroke-width="12"
            :format="levelProgressText"
            class="level-progress"
          />
          <div class="level-hint">{{ levelHint }}</div>
        </div>
      </div>

      <div class="redeem-block">
        <div class="redeem-title"><i class="el-icon-present" /> 积分兑换</div>
        <el-row :gutter="14">
          <el-col v-for="opt in redeemOptions" :key="opt.key" :xs="24" :sm="8">
            <div class="redeem-card">
              <div class="redeem-name">{{ opt.name }}</div>
              <div class="redeem-cost">{{ opt.cost }} 积分</div>
              <el-button
                type="primary"
                size="small"
                plain
                :disabled="!opt.affordable"
                :loading="redeeming === opt.key"
                @click="handleRedeem(opt)"
              >{{ opt.affordable ? '立即兑换' : '积分不足' }}</el-button>
            </div>
          </el-col>
        </el-row>
      </div>

      <el-table
        v-loading="recordsLoading"
        :data="records"
        border
        stripe
        style="width: 100%;"
        :header-cell-style="{ background: '#f5f7fb', color: '#4a5568', fontWeight: 600, textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        empty-text="暂无积分记录"
      >
        <el-table-column type="index" label="序号" width="70" align="center" :index="indexMethod" />
        <el-table-column label="变更" width="120" align="center">
          <template slot-scope="scope">
            <span :class="scope.row.changeValue >= 0 ? 'points-in' : 'points-out'">
              {{ scope.row.changeValue >= 0 ? '+' : '' }}{{ scope.row.changeValue }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120" align="center">
          <template slot-scope="scope">
            <el-tag :type="typeTagType(scope.row.type)" size="small" effect="light">{{ typeText(scope.row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="备注" min-width="200" align="center" show-overflow-tooltip>
          <template slot-scope="scope">{{ scope.row.remark || '-' }}</template>
        </el-table-column>
        <el-table-column prop="orderNo" label="关联单号" min-width="160" align="center">
          <template slot-scope="scope"><span class="mono">{{ scope.row.orderNo || '-' }}</span></template>
        </el-table-column>
        <el-table-column prop="createTime" label="时间" width="180" align="center" />
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, prev, pager, next"
          :total="pagination.total"
          :page-size="pagination.pageSize"
          :current-page.sync="pagination.pageNum"
          @current-change="loadRecords"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { Message } from 'element-ui';
import { getPointsSummary, getPointsRecords, redeemPoints } from '../../api/points';

const TYPE_TEXT = { EARN: '下单获取', REDEEM: '兑换消耗', COMPENSATE: '兑换返还' };

export default {
  name: 'MyPoints',
  data() {
    return {
      loading: false,
      recordsLoading: false,
      summary: {},
      redeemOptions: [],
      records: [],
      redeeming: null,
      pagination: { pageNum: 1, pageSize: 10, total: 0 }
    };
  },
  computed: {
    levelTagType() {
      const code = this.summary.levelCode || 0;
      return ['', '', 'warning', 'success'][code] || '';
    },
    levelProgress() {
      const cur = Number(this.summary.currentThreshold) || 0;
      const next = Number(this.summary.nextThreshold);
      const earned = Number(this.summary.totalEarned) || 0;
      if (!next || next < 0) return 100;
      return Math.min(100, Math.round(((earned - cur) / (next - cur)) * 100));
    },
    levelProgressText() {
      const next = Number(this.summary.nextThreshold);
      if (!next || next < 0) return '已满级';
      return '';
    },
    levelHint() {
      const next = Number(this.summary.nextThreshold);
      const earned = Number(this.summary.totalEarned) || 0;
      if (!next || next < 0) return '已达最高等级';
      return `再获取 ${next - earned} 积分可升级`;
    }
  },
  created() {
    this.loadAll();
  },
  methods: {
    indexMethod(index) {
      return (this.pagination.pageNum - 1) * this.pagination.pageSize + index + 1;
    },
    typeText(type) { return TYPE_TEXT[type] || type; },
    typeTagType(type) {
      if (type === 'EARN') return 'success';
      if (type === 'REDEEM') return 'warning';
      return 'info';
    },
    loadAll() {
      this.loadSummary();
      this.loadRecords();
    },
    loadSummary() {
      this.loading = true;
      getPointsSummary()
        .then(res => {
          this.summary = res.daoResult || {};
          this.redeemOptions = this.summary.redeemOptions || [];
        })
        .catch(() => {})
        .finally(() => { this.loading = false; });
    },
    loadRecords() {
      this.recordsLoading = true;
      getPointsRecords({
        pageNum: this.pagination.pageNum,
        pageSize: this.pagination.pageSize
      })
        .then(res => {
          const page = (res && res.dataList && res.dataList[0]) || {};
          this.records = page.records || [];
          this.pagination.total = Number(page.total) || 0;
        })
        .catch(() => {})
        .finally(() => { this.recordsLoading = false; });
    },
    handleRedeem(opt) {
      this.$confirm(`确认消耗 ${opt.cost} 积分兑换「${opt.name}」？`, '积分兑换', {
        confirmButtonText: '兑换',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.redeeming = opt.key;
        redeemPoints(opt.key).then(() => {
          Message.success(`兑换成功，「${opt.name}」已发放到我的优惠券`);
          this.loadSummary();
          this.pagination.pageNum = 1;
          this.loadRecords();
        }).catch(() => {}).finally(() => {
          this.redeeming = null;
        });
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.points-hero {
  display: flex;
  align-items: center;
  gap: 26px;
  padding: 18px 20px;
  margin-bottom: 18px;
  border-radius: 12px;
  background: linear-gradient(120deg, #1e3c72, #2a5298);
  color: #fff;
  flex-wrap: wrap;
}
.points-balance { min-width: 150px; }
.balance-label { font-size: 12px; opacity: .8; }
.balance-value { font-size: 40px; font-weight: 700; line-height: 1.2; font-variant-numeric: tabular-nums; }
.points-level { flex: 1; min-width: 240px; }
.level-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.level-earned { font-size: 12px; opacity: .85; }
.level-progress { margin-bottom: 4px; }
.level-hint { font-size: 12px; opacity: .8; }
.redeem-block { margin-bottom: 18px; }
.redeem-title { font-size: 15px; font-weight: 600; color: #1e3c72; margin-bottom: 12px; }
.redeem-title i { color: #667eea; margin-right: 6px; }
.redeem-card {
  border: 1px solid #eef0f4;
  border-radius: 12px;
  padding: 16px 14px;
  text-align: center;
  margin-bottom: 12px;
  background: #fff;
}
.redeem-name { font-size: 14px; font-weight: 600; color: #1f2733; }
.redeem-cost { font-size: 13px; color: var(--color-price); margin: 8px 0 12px; font-weight: 600; }
.points-in { color: #67c23a; font-weight: 650; }
.points-out { color: #f56c6c; font-weight: 650; }
</style>
