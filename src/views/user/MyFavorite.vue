<template>
  <div class="my-favorite list-page">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">收藏与足迹</span>
          <span class="header-meta">{{ activeTab === 'favorite' ? '共 ' + favorites.length + ' 件收藏' : '最近浏览 ' + history.length + ' 件' }}</span>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="status-tabs pill-tabs" @tab-click="handleTabChange">
        <el-tab-pane label="我的收藏" name="favorite" />
        <el-tab-pane label="浏览足迹" name="history" />
      </el-tabs>

      <template v-if="activeTab === 'favorite'">
        <el-row v-if="favorites.length" :gutter="14">
          <el-col v-for="item in favorites" :key="item.favorite_id" :xs="12" :sm="8" :md="4">
            <div class="fav-card" :class="{ 'fav-card--off': item.status !== 1 }" @click="goProduct(item)">
              <div class="fav-image-wrap">
                <el-image v-if="item.image_url" :src="item.image_url" fit="cover" class="fav-image">
                  <div slot="error" class="fav-fallback"><i class="el-icon-picture-outline" /></div>
                </el-image>
                <div v-else class="fav-fallback"><i class="el-icon-picture-outline" /></div>
                <div v-if="item.status !== 1" class="fav-off-mask">已下架</div>
                <button type="button" class="fav-remove" aria-label="取消收藏" @click.stop="handleUnfavorite(item)">
                  <i class="el-icon-close" />
                </button>
              </div>
              <div class="fav-name" :title="item.p_name">{{ item.p_name }}</div>
              <div class="fav-meta">
                <span class="fav-price">¥ {{ item.price }}</span>
                <span class="fav-time">{{ formatTime(item.favorite_time) }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-empty v-else description="还没有收藏商品，去商城逛逛吧">
          <el-button type="primary" size="small" @click="goGallery">去逛逛</el-button>
        </el-empty>
      </template>

      <template v-else>
        <el-row v-if="history.length" :gutter="14">
          <el-col v-for="item in history" :key="item.p_id" :xs="12" :sm="8" :md="4">
            <div class="fav-card" :class="{ 'fav-card--off': item.status !== 1 }" @click="goProduct(item)">
              <div class="fav-image-wrap">
                <el-image v-if="item.image_url" :src="item.image_url" fit="cover" class="fav-image">
                  <div slot="error" class="fav-fallback"><i class="el-icon-picture-outline" /></div>
                </el-image>
                <div v-else class="fav-fallback"><i class="el-icon-picture-outline" /></div>
                <div v-if="item.status !== 1" class="fav-off-mask">已下架</div>
              </div>
              <div class="fav-name" :title="item.p_name">{{ item.p_name }}</div>
              <div class="fav-meta">
                <span class="fav-price">¥ {{ item.price }}</span>
                <span class="fav-time">{{ formatTime(item.browse_time) }}</span>
              </div>
            </div>
          </el-col>
        </el-row>
        <el-empty v-else description="暂无浏览足迹">
          <el-button type="primary" size="small" @click="goGallery">去逛逛</el-button>
        </el-empty>
      </template>
    </el-card>
  </div>
</template>

<script>
import { getFavoriteList, getBrowseList, unfavoriteProduct } from '../../api/product';
import { formatTime } from '../../utils/format';

export default {
  name: 'MyFavorite',
  data() {
    return {
      activeTab: 'favorite',
      loading: false,
      favorites: [],
      history: []
    };
  },
  created() {
    this.loadFavorites();
    this.loadHistory();
  },
  methods: {
    formatTime,
    handleTabChange() {
      if (this.activeTab === 'favorite' && !this.favorites.length) this.loadFavorites();
      if (this.activeTab === 'history' && !this.history.length) this.loadHistory();
    },
    loadFavorites() {
      this.loading = true;
      getFavoriteList()
        .then(res => { this.favorites = (res && res.dataList) || []; })
        .catch(() => { this.favorites = []; })
        .finally(() => { this.loading = false; });
    },
    loadHistory() {
      getBrowseList(24)
        .then(res => { this.history = (res && res.dataList) || []; })
        .catch(() => { this.history = []; });
    },
    handleUnfavorite(item) {
      unfavoriteProduct(item.p_id).then(() => {
        this.favorites = this.favorites.filter(f => f.p_id !== item.p_id);
        this.$message.success('已取消收藏');
      }).catch(() => {});
    },
    goProduct(item) {
      if (item.status !== 1) {
        this.$message.info('该商品已下架');
        return;
      }
      this.$router.push('/product-buy/' + item.p_id).catch(() => {});
    },
    goGallery() {
      this.$router.push('/gallery').catch(() => {});
    }
  }
};
</script>

<style scoped>
.fav-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 14px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.fav-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(31, 41, 59, 0.1);
}
.fav-card--off { cursor: not-allowed; opacity: 0.75; }
.fav-image-wrap { position: relative; }
.fav-image {
  width: 100%;
  height: 130px;
  display: block;
}
.fav-image .el-image__inner { object-fit: cover; }
.fav-fallback {
  height: 130px;
  display: grid;
  place-items: center;
  color: #c3c9d4;
  font-size: 30px;
  background: #f7f8fb;
}
.fav-off-mask {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(31, 41, 59, 0.6);
  color: #fff;
  font-size: 11px;
}
.fav-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: rgba(31, 41, 59, 0.55);
  color: #fff;
  font-size: 11px;
  cursor: pointer;
}
.fav-remove:hover { background: #f56c6c; }
.fav-name {
  font-size: 13px;
  color: #1f2733;
  font-weight: 550;
  padding: 9px 10px 2px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.fav-meta {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 2px 10px 10px;
}
.fav-price {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-price);
  font-variant-numeric: tabular-nums;
}
.fav-time {
  font-size: 11px;
  color: #aab3c5;
}
</style>
