<template>
  <div class="notice-carousel">
    <el-carousel
      v-if="notices.length"
      :height="height"
      :interval="4000"
      :autoplay="true"
      :pause-on-hover="true"
      :loop="true"
      arrow="hover"
      indicator-position="inside"
      :type="type"
    >
      <el-carousel-item v-for="n in notices" :key="n.noticeId" @click.native="openNotice(n)">
        <div class="carousel-slide" :style="slideStyle(n)">
          <div class="carousel-mask">
            <div class="carousel-title">{{ n.title }}</div>
            <div class="carousel-time"><i class="el-icon-time" /> {{ n.createTime }}</div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
    <el-empty v-else description="暂无通知" :image-size="70" />

    <el-dialog
      :title="current.title"
      :visible.sync="detailVisible"
      width="560px"
      top="8vh"
      append-to-body
      custom-class="notice-dialog"
    >
      <div class="notice-detail" v-html="current.content"></div>
    </el-dialog>
  </div>
</template>

<script>
import { getPublishedNotices } from '../../api/notice';

export default {
  name: 'NoticeCarousel',
  props: {
    height: { type: String, default: '200px' },
    type: { type: String, default: '' }
  },
  data() {
    return {
      notices: [],
      detailVisible: false,
      current: { title: '', content: '' }
    };
  },
  created() {
    getPublishedNotices()
      .then(res => {
        this.notices = res.dataList || [];
        this.$emit('loaded', this.notices);
      })
      .catch(() => {});
  },
  methods: {
    slideStyle(n) {
      if (n.coverImage) {
        return { backgroundImage: `url(${n.coverImage})` };
      }
      return { background: 'linear-gradient(135deg,#1e3c72,#2a5298 55%,#667eea)' };
    },
    openNotice(n) {
      this.current = n;
      this.detailVisible = true;
    }
  }
};
</script>

<style scoped>
.carousel-slide {
  height: 100%;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border-radius: var(--radius-md);
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12);
}
.carousel-mask {
  width: 100%;
  padding: 14px 18px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  color: #fff;
}
.carousel-title { font-size: 16px; font-weight: 600; text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4); }
.carousel-time { font-size: 12px; opacity: 0.85; margin-top: 4px; }
.notice-detail { max-height: 62vh; overflow: auto; line-height: 1.75; color: #303133; }
.notice-detail >>> img { max-width: 100%; border-radius: 4px; }
</style>
