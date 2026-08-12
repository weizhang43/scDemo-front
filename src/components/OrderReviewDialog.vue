<template>
  <el-dialog
    title="商品评价"
    :visible="visible"
    width="560px"
    :close-on-click-modal="false"
    custom-class="review-dialog"
    @close="handleClose"
  >
    <div v-if="items.length" class="review-form">
      <div v-for="item in items" :key="item.pId" class="review-row" :class="{ 'is-done': isReviewed(item.pId) }">
        <div class="row-head">
          <i class="el-icon-goods row-icon"></i>
          <span class="row-name">{{ item.pName || ('商品 #' + item.pId) }}</span>
          <el-tag v-if="isReviewed(item.pId)" size="mini" type="info">已评价</el-tag>
        </div>
        <template v-if="!isReviewed(item.pId)">
          <el-rate
            v-model="forms[item.pId].rating"
            class="row-rate"
            show-text
            :texts="RATE_TEXTS"
          />
          <el-input
            v-model="forms[item.pId].content"
            type="textarea"
            :rows="2"
            maxlength="500"
            show-word-limit
            placeholder="说说这件商品怎么样吧（选填）"
          />
        </template>
        <div v-else class="row-tip">该商品在此订单中已评价过，不能重复评价</div>
      </div>
      <div class="form-tip">
        <i class="el-icon-info"></i>只有打了星的商品才会提交，未打星的会被跳过
      </div>
    </div>
    <el-empty v-else description="没有可评价的商品" :image-size="80" />

    <span slot="footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" :loading="submitting" :disabled="!hasRated" @click="handleSubmit">
        提交评价
      </el-button>
    </span>
  </el-dialog>
</template>

<script>
import { submitReview } from '../api/review';

const RATE_TEXTS = ['很差', '较差', '一般', '满意', '非常满意'];

export default {
  name: 'OrderReviewDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    oId: {
      type: [Number, String],
      default: null
    },
    /** [{ pId, pName }]，订单详情页传单个商品、我的订单列表传整单商品 */
    items: {
      type: Array,
      default: () => []
    },
    reviewedPIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      RATE_TEXTS,
      forms: {},
      submitting: false
    };
  },
  computed: {
    hasRated() {
      return this.pendingItems.length > 0;
    },
    pendingItems() {
      return this.items.filter(it => {
        const f = this.forms[it.pId];
        return !this.isReviewed(it.pId) && f && f.rating > 0;
      });
    }
  },
  watch: {
    visible(val) {
      if (val) this.resetForms();
    },
    items() {
      if (this.visible) this.resetForms();
    }
  },
  methods: {
    resetForms() {
      const forms = {};
      this.items.forEach(it => {
        forms[it.pId] = { rating: 0, content: '' };
      });
      this.forms = forms;
    },
    isReviewed(pId) {
      return this.reviewedPIds.indexOf(Number(pId)) > -1;
    },
    handleClose() {
      this.$emit('update:visible', false);
    },
    /**
     * 串行提交：评价之间彼此独立，没有原子性诉求，
     * 某一条失败不回滚已成功的，最后只汇总成功条数。
     */
    handleSubmit() {
      const pending = this.pendingItems;
      if (!pending.length) return;
      this.submitting = true;
      let ok = 0;
      pending
        .reduce(
          (chain, it) =>
            chain.then(() =>
              submitReview({
                oId: Number(this.oId),
                pId: Number(it.pId),
                rating: this.forms[it.pId].rating,
                content: this.forms[it.pId].content
              })
                .then(() => {
                  ok += 1;
                })
                .catch(() => {})
            ),
          Promise.resolve()
        )
        .then(() => {
          this.submitting = false;
          if (ok > 0) {
            this.$message.success(`成功提交 ${ok} 条评价`);
            this.$emit('submitted');
            this.handleClose();
          }
        });
    }
  }
};
</script>

<style scoped>
.review-form {
  max-height: 56vh;
  overflow-y: auto;
  padding-right: 4px;
}
.review-row {
  padding: 14px 16px;
  border: 1px solid #eef0f4;
  border-radius: 10px;
  margin-bottom: 12px;
  background: #fff;
}
.review-row.is-done {
  background: #fafbfd;
}
.review-row:last-of-type {
  margin-bottom: 0;
}
.row-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}
.row-icon {
  color: var(--color-primary);
}
.row-name {
  font-size: 14px;
  font-weight: 600;
  color: #1f2733;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.row-rate {
  margin-bottom: 10px;
  line-height: 1;
}
.row-tip {
  font-size: 13px;
  color: #9aa3b2;
}
.form-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 12px;
  color: #8a93a4;
}
.form-tip i {
  color: #b3bac6;
}
</style>

<style>
.review-dialog {
  border-radius: 14px;
  overflow: hidden;
}
.review-dialog .el-dialog__header {
  padding: 18px 22px;
  border-bottom: 1px solid #eef0f4;
}
.review-dialog .el-dialog__title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2733;
}
.review-dialog .el-dialog__body {
  padding: 18px 22px;
}
</style>
