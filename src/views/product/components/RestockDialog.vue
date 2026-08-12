<template>
  <el-dialog
    title="商品补货"
    :visible="visible"
    width="480px"
    :close-on-click-modal="false"
    @update:visible="v => $emit('update:visible', v)"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="商品名称">
        <span class="restock-name">{{ row && row.pName }}</span>
      </el-form-item>
      <el-form-item label="当前库存">
        <span class="restock-current">{{ row && row.stock }}</span>
      </el-form-item>
      <el-form-item label="补货数量" prop="quantity">
        <el-input-number v-model="form.quantity" :min="1" :precision="0" controls-position="right" style="width:180px;" />
      </el-form-item>
      <el-form-item label="补货后库存">
        <span class="restock-after">{{ restockAfter }}</span>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="$emit('update:visible', false)">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="submit">确认补货</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { updateProduct } from '../../../api/product';
import { formatDate } from '../../../utils/format';

export default {
  name: 'RestockDialog',
  props: {
    visible: { type: Boolean, default: false },
    row: { type: Object, default: null }
  },
  data() {
    return {
      form: { quantity: 1 },
      submitting: false,
      rules: {
        quantity: [{ required: true, message: '请输入补货数量', trigger: 'blur' }]
      }
    };
  },
  computed: {
    restockAfter() {
      const current = Number(this.row && this.row.stock) || 0;
      const add = Number(this.form.quantity) || 0;
      return current + add;
    }
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.form = { quantity: 1 };
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate();
      });
    }
  },
  methods: {
    submit() {
      this.$refs.form.validate(valid => {
        if (!valid) return;
        const add = Number(this.form.quantity) || 0;
        const current = Number(this.row.stock) || 0;
        const payload = {
          pId: this.row.pId,
          pName: this.row.pName,
          price: this.row.price,
          stock: current + add,
          productionDate: formatDate(this.row.productionDate),
          shelfLife: this.row.shelfLife,
          origin: this.row.origin,
          manufacturer: this.row.manufacturer,
          imageUrl: this.row.imageUrl || ''
        };
        this.submitting = true;
        updateProduct(this.row.pId, payload)
          .then(() => {
            this.$message.success('补货成功');
            this.$emit('update:visible', false);
            this.$emit('saved');
          })
          .catch(() => {})
          .finally(() => {
            this.submitting = false;
          });
      });
    }
  }
};
</script>

<style scoped>
.restock-name {
  font-weight: 600;
  color: #1f2733;
}
.restock-current {
  color: #cf1322;
  font-weight: 600;
}
.restock-after {
  color: #67c23a;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
