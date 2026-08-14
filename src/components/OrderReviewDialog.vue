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
          <div class="row-upload">
            <el-upload
              :key="item.pId + '-' + resetKey"
              action="/product/image/upload"
              list-type="picture-card"
              :headers="uploadHeaders"
              accept="image/png,image/jpeg,image/gif,image/webp"
              :limit="IMAGES_MAX"
              :before-upload="beforeImageUpload"
              :on-success="(res, file, fileList) => handleImageSuccess(item.pId, res, file, fileList)"
              :on-error="handleImageError"
              :on-remove="(file, fileList) => handleImageRemove(item.pId, fileList)"
              :on-exceed="handleImageExceed"
            >
              <i class="el-icon-plus"></i>
            </el-upload>
            <div class="upload-tip">最多上传 {{ IMAGES_MAX }} 张图片（选填）</div>
          </div>
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
import { getToken } from '../utils/auth';

const RATE_TEXTS = ['很差', '较差', '一般', '满意', '非常满意'];
const IMAGES_MAX = 3;
const IMAGE_SIZE_LIMIT_MB = 5;

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
      IMAGES_MAX,
      forms: {},
      resetKey: 0,
      submitting: false
    };
  },
  computed: {
    uploadHeaders() {
      const token = getToken();
      return token ? { Authorization: 'Bearer ' + token } : {};
    },
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
        forms[it.pId] = { rating: 0, content: '', images: [] };
      });
      this.forms = forms;
      this.resetKey += 1;
    },
    isReviewed(pId) {
      return this.reviewedPIds.indexOf(Number(pId)) > -1;
    },
    beforeImageUpload(file) {
      if (file.size > IMAGE_SIZE_LIMIT_MB * 1024 * 1024) {
        this.$message.error(`图片大小不能超过 ${IMAGE_SIZE_LIMIT_MB}MB`);
        return false;
      }
      return true;
    },
    handleImageSuccess(pId, res, file, fileList) {
      const url = res && res.daoResult;
      if (!url) {
        this.$message.error((res && res.msg) || '图片上传失败');
        const idx = fileList.indexOf(file);
        if (idx > -1) fileList.splice(idx, 1);
        return;
      }
      this.syncImages(pId, fileList);
    },
    handleImageError() {
      this.$message.error('图片上传失败，请重试');
    },
    handleImageRemove(pId, fileList) {
      this.syncImages(pId, fileList);
    },
    syncImages(pId, fileList) {
      this.forms[pId].images = fileList
        .map(f => f.response && f.response.daoResult)
        .filter(u => !!u);
    },
    handleImageExceed() {
      this.$message.warning(`每条评价最多上传 ${IMAGES_MAX} 张图片`);
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
                content: this.forms[it.pId].content,
                images: this.forms[it.pId].images
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
  border-radius: var(--radius-md);
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
.row-upload {
  margin-top: 10px;
}
.row-upload >>> .el-upload--picture-card {
  width: 72px;
  height: 72px;
  line-height: 76px;
}
.row-upload >>> .el-upload-list--picture-card .el-upload-list__item {
  width: 72px;
  height: 72px;
}
.upload-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #8a93a4;
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
  border-radius: var(--radius-card);
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
