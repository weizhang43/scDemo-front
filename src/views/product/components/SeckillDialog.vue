<template>
  <el-dialog
    title="发布秒杀活动"
    :visible="visible"
    width="560px"
    :close-on-click-modal="false"
    @update:visible="v => $emit('update:visible', v)"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="商品">
        <span class="dialog-name">{{ row && row.pName }}</span>
        <span class="dialog-hint">原价 ¥ {{ row && row.price }} · 库存 {{ row && row.stock }}</span>
      </el-form-item>
      <el-form-item label="秒杀价" prop="seckillPrice">
        <el-input-number v-model="form.seckillPrice" :min="0.01" :precision="2" :step="1" controls-position="right" style="width:150px;" />
        <span class="dialog-hint">必须低于原价</span>
      </el-form-item>
      <el-form-item label="秒杀名额" prop="seckillStock">
        <el-input-number v-model="form.seckillStock" :min="1" :precision="0" controls-position="right" style="width:150px;" />
        <span class="dialog-hint">从商品库存中划出的上限，不预扣库存</span>
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
    <div slot="footer">
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">发布</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createSeckill } from '../../../api/seckill';

export default {
  name: 'SeckillDialog',
  props: {
    visible: { type: Boolean, default: false },
    row: { type: Object, default: null }
  },
  data() {
    return {
      form: { seckillPrice: 1, seckillStock: 10, range: [] },
      submitting: false,
      rules: {
        seckillPrice: [{ required: true, message: '请输入秒杀价', trigger: 'blur' }],
        seckillStock: [{ required: true, message: '请输入秒杀名额', trigger: 'blur' }],
        range: [{ required: true, message: '请选择活动时间', trigger: 'change' }]
      }
    };
  },
  watch: {
    visible(val) {
      if (!val || !this.row) return;
      const price = Number(this.row.price) || 1;
      this.form = {
        // 默认给一个必然低于原价的建议值，避免商家一提交就撞「秒杀价必须低于原价」
        seckillPrice: Number(Math.max(price * 0.5, 0.01).toFixed(2)),
        seckillStock: Math.min(10, Number(this.row.stock) || 1),
        range: []
      };
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    }
  },
  methods: {
    submit() {
      this.$refs.form.validate(valid => {
        if (!valid) return;
        const range = this.form.range || [];
        if (range.length !== 2) {
          this.$message.warning('请选择完整的活动起止时间');
          return;
        }
        this.submitting = true;
        createSeckill({
          pId: this.row.pId,
          seckillPrice: this.form.seckillPrice,
          seckillStock: this.form.seckillStock,
          startTime: range[0],
          endTime: range[1]
        })
          .then(() => {
            this.$message.success('秒杀活动已发布');
            this.$emit('update:visible', false);
          })
          .catch(() => {})
          .finally(() => { this.submitting = false; });
      });
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
</style>
