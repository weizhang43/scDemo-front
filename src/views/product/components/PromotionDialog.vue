<template>
  <el-dialog
    title="商品折扣"
    :visible="visible"
    width="820px"
    :close-on-click-modal="false"
    @update:visible="v => $emit('update:visible', v)"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="商品">
        <span class="dialog-name">{{ row && row.pName }}</span>
        <span class="dialog-hint">原价 ¥ {{ row && row.price }}</span>
      </el-form-item>
      <el-form-item label="折扣率" prop="discount">
        <el-input-number v-model="form.discount" :min="1" :max="99" :precision="0" controls-position="right" style="width:150px;" />
        <span class="dialog-hint">
          {{ discountText(form.discount) }}，折后 <b class="dialog-strong">¥ {{ preview }}</b>
        </span>
      </el-form-item>
      <el-form-item label="活动时间" prop="range">
        <el-date-picker
          v-model="form.range"
          type="datetimerange"
          value-format="yyyy-MM-dd HH:mm:ss"
          range-separator="至"
          start-placeholder="开始时间"
          end-placeholder="结束时间"
          style="width:100%;"
        />
      </el-form-item>
    </el-form>

    <div class="sub-title">该商品已有折扣</div>
    <el-table v-loading="loading" :data="list" size="mini" border empty-text="暂无折扣活动">
      <el-table-column label="折扣" width="80" align="center">
        <template slot-scope="scope">{{ discountText(scope.row.discount) }}</template>
      </el-table-column>
      <el-table-column label="折后价" width="90" align="center">
        <template slot-scope="scope"><span class="price-text">¥ {{ scope.row.effectivePrice }}</span></template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" min-width="140" align="center" />
      <el-table-column prop="endTime" label="结束时间" min-width="140" align="center" />
      <el-table-column label="状态" width="80" align="center">
        <template slot-scope="scope">
          <el-tag :type="phaseOf(scope.row).type" size="mini" effect="plain">{{ phaseOf(scope.row).text }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="70" align="center">
        <template slot-scope="scope">
          <el-button type="text" class="text-danger" @click="handleCancel(scope.row)">取消</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div slot="footer">
      <el-button @click="$emit('update:visible', false)">关闭</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">创建折扣</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { promotionPageQuery, createPromotion, cancelPromotion } from '../../../api/product';
import { discountText, phaseOf } from '../product-helpers';

export default {
  name: 'PromotionDialog',
  props: {
    visible: { type: Boolean, default: false },
    row: { type: Object, default: null }
  },
  data() {
    return {
      form: { discount: 90, range: [] },
      list: [],
      loading: false,
      submitting: false,
      rules: {
        discount: [{ required: true, message: '请输入折扣率', trigger: 'blur' }],
        range: [{ required: true, message: '请选择活动时间', trigger: 'change' }]
      }
    };
  },
  computed: {
    /** 折后价预览。price 是整数元，85 折可能除不尽，保留两位与后端 HALF_UP 一致 */
    preview() {
      const price = Number(this.row && this.row.price) || 0;
      const discount = Number(this.form.discount) || 0;
      return (price * discount / 100).toFixed(2);
    }
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.form = { discount: 90, range: [] };
      this.list = [];
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
      this.fetchList();
    }
  },
  methods: {
    discountText,
    phaseOf,
    fetchList() {
      if (!this.row) return;
      this.loading = true;
      promotionPageQuery({ pId: this.row.pId, pageNo: 1, pageSize: 50 })
        .then(res => {
          const page = res.daoResult || {};
          this.list = page.records || [];
        })
        .catch(() => {})
        .finally(() => { this.loading = false; });
    },
    submit() {
      this.$refs.form.validate(valid => {
        if (!valid) return;
        const range = this.form.range || [];
        if (range.length !== 2) {
          this.$message.warning('请选择完整的活动起止时间');
          return;
        }
        this.submitting = true;
        createPromotion({
          pId: this.row.pId,
          discount: this.form.discount,
          startTime: range[0],
          endTime: range[1]
        })
          .then(() => {
            this.$message.success('折扣活动已创建');
            this.form.range = [];
            this.fetchList();
            // 折扣可能立即生效，通知父级刷新列表让折扣列同步
            this.$emit('changed');
          })
          .catch(() => {})
          .finally(() => { this.submitting = false; });
      });
    },
    handleCancel(promotion) {
      this.$confirm('取消后该折扣立即失效，是否继续？', '确认取消折扣', { type: 'warning' })
        .then(() => cancelPromotion(promotion.id))
        .then(() => {
          this.$message.success('已取消');
          this.fetchList();
          this.$emit('changed');
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.dialog-name {
  font-weight: 600;
  color: #1f2733;
}
.dialog-hint {
  margin-left: 10px;
  font-size: 12px;
  color: #8a93a4;
}
.dialog-strong {
  color: var(--color-price);
}
.sub-title {
  margin: 4px 0 10px;
  padding-left: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #4a5568;
  border-left: 3px solid var(--color-primary);
  line-height: 1.2;
}
.price-text {
  color: var(--color-price);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
