<template>
  <div class="coupon-template-list">
    <el-card>
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">优惠券管理</span>
          <span class="header-meta">共 {{ total }} 条</span>
        </div>
        <div class="header-actions">
          <el-button type="text" size="small" icon="el-icon-refresh" @click="fetchList">刷新</el-button>
          <el-button type="primary" size="small" icon="el-icon-plus" @click="openAdd">发布优惠券</el-button>
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
        empty-text="暂无优惠券"
      >
        <el-table-column type="index" label="序号" width="70" align="center" :index="indexMethod" />
        <el-table-column prop="name" label="券名称" min-width="150" show-overflow-tooltip />
        <el-table-column label="类型" width="80">
          <template slot-scope="s">
            <el-tag :type="s.row.type === 1 ? 'warning' : 'primary'" size="mini">
              {{ s.row.type === 1 ? '满减' : '折扣' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="优惠规则" min-width="170">
          <template slot-scope="s">{{ ruleText(s.row) }}</template>
        </el-table-column>
        <el-table-column label="剩余/总量" width="110">
          <template slot-scope="s">
            {{ s.row.redisRemain == null ? s.row.remainCount : s.row.redisRemain }} / {{ s.row.totalCount }}
          </template>
        </el-table-column>
        <el-table-column label="有效期" width="300">
          <template slot-scope="s">{{ formatTime(s.row.validStart) }} ~ {{ formatTime(s.row.validEnd) }}</template>
        </el-table-column>
        <el-table-column label="发行方" width="100">
          <template slot-scope="s">
            <el-tag v-if="s.row.merchantId === 0" type="info" size="mini">平台</el-tag>
            <span v-else>商家 #{{ s.row.merchantId }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template slot-scope="s">
            <el-tag :type="s.row.status === 1 ? 'success' : 'info'" size="mini">
              {{ s.row.status === 1 ? '有效' : '已停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="110">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.status === 1"
              type="text"
              class="text-danger"
              @click="handleDisable(scope.row)"
            >停用</el-button>
            <span v-else style="color:#bbb">-</span>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          :page-size="query.pageSize"
          :page-sizes="[10, 20, 50]"
          :current-page="query.pageNo"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog title="发布优惠券" :visible.sync="dialogVisible" width="560px" :close-on-click-modal="false">
      <el-form ref="couponForm" :model="couponForm" :rules="rules" label-width="90px">
        <el-form-item label="券名称" prop="name">
          <el-input v-model="couponForm.name" placeholder="如：满100减20" maxlength="64" show-word-limit />
        </el-form-item>
        <el-form-item label="券类型" prop="type">
          <el-radio-group v-model="couponForm.type">
            <el-radio :label="1">满减券</el-radio>
            <el-radio :label="2">折扣券</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="使用门槛" prop="thresholdAmount">
          <el-input-number v-model="couponForm.thresholdAmount" :min="0" :precision="2" controls-position="right" style="width:180px" />
          <span class="tip">订单满该金额可用，0 为不限</span>
        </el-form-item>
        <el-form-item v-if="couponForm.type === 1" label="减免金额" prop="offAmount">
          <el-input-number v-model="couponForm.offAmount" :min="0.01" :precision="2" controls-position="right" style="width:180px" />
          <span class="tip">元</span>
        </el-form-item>
        <el-form-item v-if="couponForm.type === 2" label="折扣率" prop="discountRate">
          <el-input-number v-model="couponForm.discountRate" :min="0.01" :max="0.99" :step="0.05" :precision="2" controls-position="right" style="width:180px" />
          <span class="tip">0.85 即 85 折</span>
        </el-form-item>
        <el-form-item label="发行总量" prop="totalCount">
          <el-input-number v-model="couponForm.totalCount" :min="1" :max="999999" controls-position="right" style="width:180px" />
          <span class="tip">每人限领 1 张</span>
        </el-form-item>
        <el-form-item label="有效期" prop="validRange">
          <el-date-picker
            v-model="couponForm.validRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="yyyy-MM-dd HH:mm:ss"
            style="width:100%"
          />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="handleSave">发布</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { createCouponTemplate, queryCouponTemplate, disableCouponTemplate } from '../../api/coupon';

export default {
  name: 'CouponTemplateList',
  data() {
    return {
      loading: false,
      saving: false,
      tableData: [],
      total: 0,
      query: { pageNo: 1, pageSize: 10 },
      dialogVisible: false,
      couponForm: {
        name: '',
        type: 1,
        thresholdAmount: 0,
        offAmount: null,
        discountRate: null,
        totalCount: 100,
        validRange: []
      },
      rules: {
        name: [{ required: true, message: '请输入券名称', trigger: 'blur' }],
        validRange: [{ required: true, message: '请选择有效期', trigger: 'change' }]
      }
    };
  },
  created() {
    this.fetchList();
  },
  methods: {
    fetchList() {
      this.loading = true;
      queryCouponTemplate({ pageNo: this.query.pageNo, pageSize: this.query.pageSize })
        .then(res => {
          const page = res.daoResult || {};
          this.tableData = page.records || [];
          this.total = page.total || 0;
        })
        .finally(() => { this.loading = false; });
    },
    handlePageChange(p) {
      this.query.pageNo = p;
      this.fetchList();
    },
    indexMethod(index) {
      return (this.query.pageNo - 1) * this.query.pageSize + index + 1;
    },
    ruleText(row) {
      const threshold = Number(row.thresholdAmount || 0);
      const prefix = threshold > 0 ? `满 ${threshold.toFixed(2)} 元` : '无门槛';
      if (row.type === 1) {
        return `${prefix}减 ${Number(row.offAmount || 0).toFixed(2)} 元`;
      }
      const rate = Number(row.discountRate || 0);
      return `${prefix}打 ${(rate * 10).toFixed(1)} 折`;
    },
    formatTime(t) {
      return t || '-';
    },
    openAdd() {
      this.couponForm = {
        name: '',
        type: 1,
        thresholdAmount: 0,
        offAmount: null,
        discountRate: null,
        totalCount: 100,
        validRange: []
      };
      this.dialogVisible = true;
      this.$nextTick(() => this.$refs.couponForm && this.$refs.couponForm.clearValidate());
    },
    handleSave() {
      this.$refs.couponForm.validate(valid => {
        if (!valid) return;
        const f = this.couponForm;
        if (f.type === 1 && !(f.offAmount > 0)) {
          this.$message.warning('请填写减免金额');
          return;
        }
        if (f.type === 2 && !(f.discountRate > 0 && f.discountRate < 1)) {
          this.$message.warning('折扣率必须在 0 到 1 之间');
          return;
        }
        this.saving = true;
        createCouponTemplate({
          name: f.name.trim(),
          type: f.type,
          thresholdAmount: f.thresholdAmount,
          offAmount: f.type === 1 ? f.offAmount : null,
          discountRate: f.type === 2 ? f.discountRate : null,
          totalCount: f.totalCount,
          validStart: f.validRange[0],
          validEnd: f.validRange[1]
        })
          .then(() => {
            this.$message.success('发布成功');
            this.dialogVisible = false;
            this.fetchList();
          })
          .finally(() => { this.saving = false; });
      });
    },
    handleDisable(row) {
      this.$confirm(`确认停用优惠券 [${row.name}]？停用后不可再领取。`, '提示', { type: 'warning' })
        .then(() => {
          disableCouponTemplate(row.id).then(() => {
            this.$message.success('已停用');
            this.fetchList();
          });
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.coupon-template-list { width: 100%; }
.tip { margin-left: 10px; color: #909399; font-size: 12px; }
</style>
