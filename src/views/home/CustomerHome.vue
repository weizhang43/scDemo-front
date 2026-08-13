<template>
  <div class="customer-home">
    <!-- 顶部横幅：欢迎 + 搜索 + 快捷入口 + 公告轮播 -->
    <div class="hero">
      <div class="hero-left">
        <div class="hero-hi">Hi，{{ username }} 👋</div>
        <div class="hero-sub-row">
          <span class="hero-sub">发现好物，从这里开始</span>
          <div class="hero-search">
            <el-input
              v-model="keyword"
              placeholder="搜索想要的商品，回车直达"
              prefix-icon="el-icon-search"
              clearable
              @keyup.enter.native="doSearch"
            >
              <el-button slot="append" icon="el-icon-search" @click="doSearch">搜索</el-button>
            </el-input>
          </div>
        </div>
        <div class="hero-entries">
          <div class="entry" @click="go('/cart')">
            <el-badge :value="cartCount || undefined" :max="99" class="entry-badge">
              <i class="el-icon-shopping-cart-2 entry-ico" />
            </el-badge>
            <span>购物车</span>
          </div>
          <div class="entry" @click="go('/coupons')">
            <el-badge :value="myCouponCount || undefined" :max="99" class="entry-badge">
              <i class="el-icon-s-ticket entry-ico" />
            </el-badge>
            <span>我的券</span>
          </div>
          <div class="entry" :class="{ 'entry-warn': unpaidCount > 0 }" @click="go('/my-orders')">
            <el-badge :value="unpaidCount || undefined" :max="99" class="entry-badge">
              <i class="el-icon-wallet entry-ico" />
            </el-badge>
            <span>待付款</span>
          </div>
          <div class="entry" @click="go('/gallery')">
            <i class="el-icon-goods entry-ico" />
            <span>逛商城</span>
          </div>
        </div>
      </div>
      <NoticeCarousel height="196px" class="hero-media" />
    </div>

    <!-- 我的待办（横条，有待办才显示） -->
    <div v-if="earliestUnpaid || shippedCount > 0" class="todo-bar">
      <div class="todo-title"><i class="el-icon-bell" /> 我的待办</div>
      <div v-if="earliestUnpaid" class="todo-item warn" @click="goPay(earliestUnpaid)">
        <div class="todo-main">
          <div class="todo-text">待付款订单 <b>¥{{ earliestUnpaid.orderAmount }}</b></div>
          <div class="todo-sub">
            剩余 <CountdownText :expire-time="earliestUnpaid.expireTime" expired-text="已超时" />
            <span v-if="unpaidCount > 1" class="todo-extra">等 {{ unpaidCount }} 单</span>
          </div>
        </div>
        <el-button type="danger" size="mini" round>去支付</el-button>
      </div>
      <div v-if="shippedCount > 0" class="todo-item" @click="go('/my-orders')">
        <div class="todo-main">
          <div class="todo-text">{{ shippedCount }} 个包裹正在路上</div>
          <div class="todo-sub">已发货，记得确认收货</div>
        </div>
        <el-button type="primary" size="mini" round plain>查看</el-button>
      </div>
    </div>

    <!-- 秒杀 + 领券 并排 -->
    <div class="promo-row">
    <!-- 限时秒杀 -->
    <el-card v-if="seckills.length" class="section-card seckill-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title seckill-title"><i class="el-icon-alarm-clock" /> 限时秒杀</span>
        <el-button type="text" size="mini" class="btn-more" @click="go('/seckill')">全部场次 <i class="el-icon-arrow-right" /></el-button>
      </div>
      <div class="seckill-row">
        <div
          v-for="s in seckillTop"
          :key="s.id"
          class="seckill-item"
          :class="{ disabled: seckillPhase(s).key === 'ended' || (seckillPhase(s).key === 'running' && s.remainStock <= 0) }"
          @click="go('/seckill')"
        >
          <div class="seckill-thumb">
            <el-image v-if="s.imageUrl" :src="s.imageUrl" fit="cover" class="thumb-img">
              <div slot="error" class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
            </el-image>
            <div v-else class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
            <span class="phase-tag" :class="'phase-' + seckillPhase(s).key">{{ seckillPhase(s).text }}</span>
          </div>
          <div class="seckill-name" :title="s.pName">{{ s.pName }}</div>
          <div class="seckill-price-row">
            <span class="seckill-price">¥{{ s.seckillPrice }}</span>
            <span class="price-origin">¥{{ s.price }}</span>
          </div>
          <el-progress
            :percentage="seckillPct(s)"
            :show-text="false"
            :stroke-width="6"
            color="#f56c6c"
          />
          <div class="seckill-foot">
            <span>剩 {{ s.remainStock }} 份</span>
            <span class="seckill-count">{{ seckillCountdown(s) }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 领券专区 -->
    <el-card v-if="coupons.length" class="section-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title"><i class="el-icon-s-ticket accent-purple" /> 领券专区</span>
        <el-button type="text" size="mini" class="btn-more" @click="go('/coupons')">领券中心 <i class="el-icon-arrow-right" /></el-button>
      </div>
      <div class="coupon-row">
        <div
          v-for="tpl in coupons"
          :key="tpl.id"
          class="coupon-mini"
          :class="{ disabled: tpl.claimed || couponSoldOut(tpl) }"
        >
          <div class="coupon-val">
            <template v-if="tpl.type === 1"><span class="cur">¥</span>{{ num(tpl.offAmount) }}</template>
            <template v-else>{{ rateText(tpl.discountRate) }}<span class="cur">折</span></template>
          </div>
          <div class="coupon-info">
            <div class="coupon-name" :title="tpl.name">{{ tpl.name }}</div>
            <div class="coupon-rule">{{ thresholdText(tpl) }}</div>
          </div>
          <el-button
            v-if="tpl.claimed"
            size="mini"
            round
            disabled
          >已领</el-button>
          <el-button
            v-else-if="couponSoldOut(tpl)"
            size="mini"
            round
            disabled
          >已抢光</el-button>
          <el-button
            v-else
            size="mini"
            round
            class="claim-btn"
            :loading="claimingId === tpl.id"
            @click="handleClaim(tpl)"
          >领取</el-button>
        </div>
      </div>
    </el-card>
    </div>

    <!-- 新品推荐（通栏货架） -->
    <el-card class="section-card newest-card" shadow="never">
      <div slot="header" class="card-header">
        <span class="card-title"><i class="el-icon-goods accent-purple" /> 新品推荐</span>
        <el-button type="text" size="mini" class="btn-more" @click="go('/gallery')">更多商品 <i class="el-icon-arrow-right" /></el-button>
      </div>
      <el-row v-if="newest.length" :gutter="16" class="goods-row">
        <el-col v-for="item in newest" :key="item.pId" :md="6" :sm="12" :xs="12">
          <div
            class="goods-card"
            :class="{ 'goods-card--disabled': isSoldOut(item) }"
            @click="goBuy(item.pId)"
          >
            <div class="goods-image-wrap">
              <el-image v-if="item.imageUrl" :src="item.imageUrl" fit="cover" class="goods-image">
                <div slot="error" class="goods-image-fallback"><i class="el-icon-picture-outline" /></div>
              </el-image>
              <div v-else class="goods-image-fallback"><i class="el-icon-picture-outline" /></div>
              <div v-if="isSoldOut(item)" class="sold-out-mask">已售罄</div>
              <div v-else class="new-badge">NEW</div>
            </div>
            <div class="goods-body">
              <div class="goods-name" :title="item.pName">{{ item.pName }}</div>
              <div class="goods-foot">
                <span class="price-text">
                  ¥ {{ priceOf(item) }}
                  <span v-if="item.discount" class="price-origin">¥ {{ item.price }}</span>
                </span>
                <span class="goods-stock">库存 {{ item.stock == null ? '-' : item.stock }}</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
      <div v-else-if="loadingNewest" class="newest-loading" v-loading="true"></div>
      <el-empty v-else description="暂无上新商品" :image-size="90" />
    </el-card>

    <!-- 榜单双列 -->
    <div class="rank-row">
      <!-- 销量榜 -->
      <el-card class="rank-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-trophy rank-ico-sales" /> 销量榜</span>
          <span class="card-sub-inline">大家都在买</span>
        </div>
        <div v-loading="loadingSales" class="rank-list">
          <div v-for="(item, idx) in salesRank" :key="item.pId" class="rank-item" @click="goBuy(item.pId)">
            <span class="rank-no" :class="rankClass(idx)">{{ idx + 1 }}</span>
            <div class="rank-thumb">
              <el-image v-if="item.imageUrl" :src="item.imageUrl" fit="cover" class="thumb-img">
                <div slot="error" class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
              </el-image>
              <div v-else class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
            </div>
            <div class="rank-main">
              <div class="rank-name" :title="item.pName">{{ item.pName || '-' }}</div>
              <div class="rank-price" v-if="item.price != null">
                ¥ {{ priceOf(item) }}
                <span v-if="item.discount" class="price-origin">¥ {{ item.price }}</span>
              </div>
            </div>
            <span class="rank-metric sales"><i class="el-icon-shopping-cart-full" />{{ item.salesCount }}</span>
          </div>
          <el-empty v-if="!loadingSales && !salesRank.length" description="暂无销量数据" :image-size="60" />
        </div>
      </el-card>

      <!-- 好评榜 -->
      <el-card class="rank-card" shadow="never">
        <div slot="header" class="card-header">
          <span class="card-title"><i class="el-icon-star-on rank-ico-likes" /> 好评榜</span>
          <span class="card-sub-inline">口碑之选</span>
        </div>
        <div v-loading="loadingLikes" class="rank-list">
          <div v-for="(item, idx) in likeRank" :key="item.pId" class="rank-item" @click="goBuy(item.pId)">
            <span class="rank-no" :class="rankClass(idx)">{{ idx + 1 }}</span>
            <div class="rank-thumb">
              <el-image v-if="item.imageUrl" :src="item.imageUrl" fit="cover" class="thumb-img">
                <div slot="error" class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
              </el-image>
              <div v-else class="thumb-fallback"><i class="el-icon-picture-outline" /></div>
            </div>
            <div class="rank-main">
              <div class="rank-name" :title="item.pName">{{ item.pName || '-' }}</div>
              <div class="rank-price" v-if="item.price != null">
                ¥ {{ priceOf(item) }}
                <span v-if="item.discount" class="price-origin">¥ {{ item.price }}</span>
              </div>
            </div>
            <span class="rank-metric likes"><i class="el-icon-star-on" />{{ item.likeCount == null ? 0 : item.likeCount }}</span>
          </div>
          <el-empty v-if="!loadingLikes && !likeRank.length" description="暂无好评数据" :image-size="60" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { getSalesRank, getLikeRank, getNewestProducts, getMyTimeoutOrders } from '../../api/home';
import { getCartCount } from '../../api/cart';
import { orderStatusCount } from '../../api/order';
import { activeSeckillList } from '../../api/seckill';
import { couponCenter, claimCoupon, myCoupons } from '../../api/coupon';
import NoticeCarousel from '../../components/home/NoticeCarousel.vue';
import CountdownText from '../../components/home/CountdownText.vue';

const RANK_LIMIT = 5;
const NEWEST_LIMIT = 4;
const SECKILL_LIMIT = 2;
const COUPON_LIMIT = 2;

export default {
  name: 'CustomerHome',
  components: { NoticeCarousel, CountdownText },
  data() {
    return {
      keyword: '',
      cartCount: 0,
      myCouponCount: 0,
      unpaidCount: 0,
      shippedCount: 0,
      myTimeoutOrders: [],
      seckills: [],
      coupons: [],
      claimingId: null,
      salesRank: [],
      likeRank: [],
      newest: [],
      loadingSales: false,
      loadingLikes: false,
      loadingNewest: false,
      now: Date.now(),
      timer: null
    };
  },
  computed: {
    username() {
      const user = this.$store.state.userInfo || {};
      return user.realName || user.uName || '用户';
    },
    earliestUnpaid() {
      if (!this.myTimeoutOrders.length) return null;
      return [...this.myTimeoutOrders].sort((a, b) =>
        String(a.expireTime || '').localeCompare(String(b.expireTime || ''))
      )[0];
    },
    seckillTop() {
      return this.seckills.slice(0, SECKILL_LIMIT);
    }
  },
  created() {
    this.fetchAll();
    this.timer = setInterval(() => { this.now = Date.now(); }, 1000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    fetchAll() {
      getCartCount()
        .then(res => { this.cartCount = Number(res.daoResult) || 0; })
        .catch(() => {});
      myCoupons(0)
        .then(res => { this.myCouponCount = (res.dataList || []).length; })
        .catch(() => {});
      orderStatusCount({})
        .then(res => {
          const counts = res.daoResult || {};
          this.unpaidCount = Number(counts['0']) || 0;
          this.shippedCount = Number(counts['3']) || 0;
        })
        .catch(() => {});
      getMyTimeoutOrders()
        .then(res => { this.myTimeoutOrders = res.dataList || []; })
        .catch(() => {});
      activeSeckillList()
        .then(res => { this.seckills = res.dataList || []; })
        .catch(() => {});
      couponCenter()
        .then(res => { this.coupons = (res.dataList || []).slice(0, COUPON_LIMIT); })
        .catch(() => {});
      this.loadingSales = true;
      getSalesRank(RANK_LIMIT)
        .then(res => { this.salesRank = res.dataList || []; })
        .catch(() => {}).finally(() => { this.loadingSales = false; });
      this.loadingLikes = true;
      getLikeRank(RANK_LIMIT)
        .then(res => { this.likeRank = res.dataList || []; })
        .catch(() => {}).finally(() => { this.loadingLikes = false; });
      this.loadingNewest = true;
      getNewestProducts(NEWEST_LIMIT)
        .then(res => { this.newest = res.dataList || []; })
        .catch(() => {}).finally(() => { this.loadingNewest = false; });
    },
    doSearch() {
      const kw = this.keyword.trim();
      this.$router.push(kw ? { path: '/gallery', query: { keyword: kw } } : '/gallery').catch(() => {});
    },
    goPay(order) {
      if (order.oid == null) return;
      this.$router.push(`/pay/${order.oid}`).catch(() => {});
    },
    /* 秒杀 */
    parseTime(s) {
      return new Date(String(s || '').replace(/-/g, '/')).getTime();
    },
    seckillPhase(item) {
      if (this.now < this.parseTime(item.startTime)) return { key: 'upcoming', text: '即将开始' };
      if (this.now > this.parseTime(item.endTime)) return { key: 'ended', text: '已结束' };
      return { key: 'running', text: '抢购中' };
    },
    seckillPct(item) {
      const total = Number(item.seckillStock) || 0;
      if (!total) return 0;
      return Math.round(Math.max(Number(item.remainStock) || 0, 0) / total * 100);
    },
    seckillCountdown(item) {
      const phase = this.seckillPhase(item).key;
      if (phase === 'ended') return '已结束';
      const target = this.parseTime(phase === 'upcoming' ? item.startTime : item.endTime);
      let sec = Math.max(Math.floor((target - this.now) / 1000), 0);
      const d = Math.floor(sec / 86400);
      sec -= d * 86400;
      const pad = n => String(n).padStart(2, '0');
      const t = `${pad(Math.floor(sec / 3600))}:${pad(Math.floor((sec % 3600) / 60))}:${pad(sec % 60)}`;
      return (phase === 'upcoming' ? '距开始 ' : '距结束 ') + (d > 0 ? `${d}天 ` : '') + t;
    },
    /* 优惠券 */
    couponSoldOut(tpl) {
      const remain = tpl.redisRemain == null ? tpl.remainCount : tpl.redisRemain;
      return !remain || remain <= 0;
    },
    num(v) {
      return Number(v || 0).toFixed(2).replace(/\.00$/, '');
    },
    rateText(rate) {
      return (Number(rate || 0) * 10).toFixed(1).replace(/\.0$/, '');
    },
    thresholdText(tpl) {
      const t = Number(tpl.thresholdAmount || 0);
      return t > 0 ? `满 ${this.num(t)} 元可用` : '无门槛';
    },
    handleClaim(tpl) {
      this.claimingId = tpl.id;
      claimCoupon(tpl.id)
        .then(() => {
          this.$message.success('领取成功');
          this.$set(tpl, 'claimed', true);
          this.myCouponCount += 1;
        })
        .finally(() => { this.claimingId = null; });
    },
    /* 商品 */
    rankClass(idx) {
      return idx < 3 ? `top top-${idx + 1}` : '';
    },
    isSoldOut(item) {
      return item.stock != null && Number(item.stock) <= 0;
    },
    priceOf(item) {
      return item.effectivePrice != null ? item.effectivePrice : item.price;
    },
    goBuy(pId) {
      if (pId == null) return;
      this.$router.push(`/product-buy/${pId}`).catch(() => {});
    },
    go(path) {
      this.$router.push(path).catch(() => {});
    }
  }
};
</script>

<style scoped>
.customer-home { max-width: 1280px; margin: 0 auto; }

/* 顶部横幅：左侧欢迎/搜索/入口 + 右侧公告轮播 */
.hero {
  position: relative;
  display: flex;
  align-items: center;
  gap: 26px;
  padding: 22px 24px;
  margin-bottom: 16px;
  border-radius: var(--radius-lg);
  color: #fff;
  background: var(--gradient-topbar);
  box-shadow: 0 8px 24px rgba(30, 60, 114, 0.25);
  overflow: hidden;
}
.hero::before {
  content: '';
  position: absolute;
  top: -60px;
  right: -40px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.12), transparent 70%);
  pointer-events: none;
}
.hero-left {
  flex: 1 1 340px;
  min-width: 300px;
  position: relative;
}
.hero-hi { font-size: 24px; font-weight: 700; letter-spacing: 0.3px; }
.hero-sub-row { display: flex; align-items: center; gap: 14px; margin-top: 14px; flex-wrap: wrap; }
.hero-sub { font-size: 13px; opacity: 0.8; white-space: nowrap; flex-shrink: 0; }
.hero-search { flex: 1; min-width: 220px; max-width: 380px; }
.hero-search >>> .el-input__inner { border: none; border-radius: 8px 0 0 8px; }
.hero-search >>> .el-input-group__append {
  border: none;
  border-radius: 0 8px 8px 0;
  background: var(--gradient-brand);
  color: #fff;
  font-weight: 600;
}
.hero-entries { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
.entry {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 15px;
  border-radius: 999px;
  font-size: 13px;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.18);
  cursor: pointer;
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.entry:hover { transform: translateY(-2px); background: rgba(255, 255, 255, 0.26); }
.entry.entry-warn { background: rgba(245, 108, 108, 0.32); border-color: rgba(245, 108, 108, 0.5); }
.entry-ico { font-size: 17px; }
.entry-badge >>> .el-badge__content { border: none; }

/* 公告轮播（嵌入横幅右侧） */
.hero-media {
  flex: 1.15 1 400px;
  min-width: 300px;
  position: relative;
  border-radius: 12px;
}
.hero-media >>> .el-carousel { border-radius: 12px; overflow: hidden; }
.hero-media >>> .el-empty {
  padding: 30px 0;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
}
.hero-media >>> .el-empty__description p { color: rgba(255, 255, 255, 0.7); }

/* 秒杀 + 领券 并排 */
.promo-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}
.promo-row .section-card { margin-bottom: 0; }
.promo-row > .section-card:only-child { grid-column: 1 / -1; }

/* 待办横条 */
.todo-bar {
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
  background: #fff;
  border-radius: var(--radius-card);
  padding: 12px 18px;
  margin-bottom: 16px;
  box-shadow: var(--shadow-card);
  border-left: 4px solid var(--color-primary);
}
.todo-title { font-size: 14px; font-weight: 600; color: #2d3748; flex-shrink: 0; }
.todo-title i { color: var(--color-primary); margin-right: 5px; }
.todo-item {
  flex: 1;
  min-width: 260px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  background: #f7f8fc;
  cursor: pointer;
  transition: background-color 0.18s ease;
}
.todo-item:hover { background: #eef1fb; }
.todo-item.warn { background: #fdf2f2; }
.todo-item.warn:hover { background: #fbe9e9; }
.todo-main { min-width: 0; }
.todo-text { font-size: 13px; color: #2d3748; }
.todo-text b { color: #f56c6c; }
.todo-sub { font-size: 12px; color: #8a93a4; margin-top: 3px; }
.todo-extra { margin-left: 6px; }

/* 区块卡片 */
.section-card { margin-bottom: 16px; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.card-title { font-size: var(--font-card-title); font-weight: 600; color: var(--text-title); letter-spacing: 0.3px; }
.card-title i { margin-right: 6px; }
.card-sub-inline { font-size: 12px; color: #8a93a4; }
.accent-purple { color: var(--color-primary-dark); }
.btn-more { padding: 0; color: var(--color-primary); font-weight: 600; }
.btn-more:hover, .btn-more:focus { color: #8497f2; }

/* 秒杀 */
.seckill-title i { color: #f56c6c; }
.seckill-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.seckill-item {
  border-radius: 12px;
  border: 1px solid #ffe3e3;
  background: linear-gradient(180deg, #fff7f7, #fff);
  padding: 10px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.seckill-item:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(245, 108, 108, 0.16); }
.seckill-item.disabled { filter: grayscale(0.6); opacity: 0.75; }
.seckill-thumb { position: relative; height: 110px; border-radius: var(--radius-sm); overflow: hidden; background: #f3f5fa; }
.phase-tag {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 1px 8px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 700;
  color: #fff;
}
.phase-running { background: linear-gradient(135deg, #f56c6c, #e8552f); }
.phase-upcoming { background: linear-gradient(135deg, #e6a23c, #d8882b); }
.phase-ended { background: #909399; }
.seckill-name {
  margin-top: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.seckill-price-row { margin: 4px 0 6px; }
.seckill-price { font-size: 17px; font-weight: 700; color: #f56c6c; margin-right: 6px; }
.seckill-foot {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #8a93a4;
}
.seckill-count { color: #f56c6c; font-weight: 600; font-family: var(--font-mono); }

/* 领券 */
.coupon-row { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.coupon-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--radius-md);
  color: #fff;
  background: var(--gradient-brand);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}
.coupon-mini.disabled { filter: grayscale(0.7); opacity: 0.75; }
.coupon-val { font-size: 22px; font-weight: 700; flex-shrink: 0; }
.coupon-val .cur { font-size: 12px; margin: 0 1px; }
.coupon-info { flex: 1; min-width: 0; }
.coupon-name { font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.coupon-rule { font-size: 11px; opacity: 0.85; margin-top: 3px; }
.claim-btn { background: #fff; color: var(--color-primary-dark); border: none; font-weight: 700; }

/* 榜单双列 */
.rank-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}
.rank-row .rank-card { margin-bottom: 0; }
.rank-ico-sales { color: var(--color-primary); }
.rank-ico-likes { color: #e6a23c; }
.rank-list { min-height: 250px; }
.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 6px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.18s ease, transform 0.18s ease;
}
.rank-item:hover { background: #f5f7ff; transform: translateX(2px); }
.rank-no {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  line-height: 22px;
  border-radius: 6px;
  text-align: center;
  font-size: 12px;
  font-weight: 700;
  color: #8a93a4;
  background: #f0f2f7;
  font-family: var(--font-mono);
}
.rank-no.top { color: #fff; }
.rank-no.top-1 { background: linear-gradient(135deg, #f5b04c, #e8912a); }
.rank-no.top-2 { background: linear-gradient(135deg, #b6bfd0, #98a3b8); }
.rank-no.top-3 { background: linear-gradient(135deg, #d29a72, #b87a4f); }
.rank-thumb { flex-shrink: 0; width: 40px; height: 40px; border-radius: var(--radius-sm); overflow: hidden; background: #f3f5fa; }
.thumb-img { width: 100%; height: 100%; display: block; }
.thumb-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c3cad8;
  font-size: 18px;
}
.rank-main { flex: 1; min-width: 0; }
.rank-name {
  font-size: 14px;
  font-weight: 500;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rank-price { margin-top: 2px; font-size: 12px; color: var(--color-price); font-weight: 600; }
.price-origin { color: #9aa3b2; font-weight: 500; font-size: 0.85em; text-decoration: line-through; margin-left: 4px; }
.rank-metric { flex-shrink: 0; font-size: 13px; font-weight: 700; font-family: var(--font-mono); }
.rank-metric i { margin-right: 4px; }
.rank-metric.sales { color: var(--color-primary); }
.rank-metric.likes { color: #e6a23c; }

/* 新品货架 */
.newest-loading { min-height: 180px; }
.goods-row { margin-top: 4px; }
.goods-card {
  margin-bottom: 16px;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #eef0f4;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.goods-card:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(31, 41, 59, 0.1); }
.goods-card--disabled { cursor: not-allowed; opacity: 0.72; }
.goods-card--disabled:hover { transform: none; box-shadow: none; }
.goods-image-wrap { position: relative; height: 160px; background: #f3f5fa; }
.goods-image { width: 100%; height: 100%; display: block; }
.goods-image-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c3cad8;
  font-size: 30px;
}
.sold-out-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: rgba(31, 41, 59, 0.5);
}
.new-badge {
  position: absolute;
  top: 6px;
  left: 6px;
  padding: 1px 7px;
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
  background: linear-gradient(135deg, #f56c6c, #e8552f);
}
.goods-body { padding: 10px 12px 12px; }
.goods-name {
  font-size: 13px;
  font-weight: 500;
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.goods-foot { margin-top: 8px; display: flex; justify-content: space-between; align-items: baseline; }
.price-text { font-size: 15px; font-weight: 700; color: var(--color-price); }
.goods-stock { font-size: 11px; color: #8a93a4; }

@media (max-width: 992px) {
  .promo-row, .rank-row { grid-template-columns: 1fr; }
  .seckill-row, .coupon-row { grid-template-columns: repeat(2, 1fr); }
  .hero { flex-direction: column; align-items: stretch; gap: 16px; }
  .hero-left, .hero-media { min-width: 0; }
  .hero-search { max-width: none; }
}
@media (max-width: 560px) {
  .seckill-row, .coupon-row { grid-template-columns: 1fr; }
}
@media (prefers-reduced-motion: reduce) {
  .entry, .seckill-item, .goods-card, .rank-item { transition: none; }
  .entry:hover, .seckill-item:hover, .goods-card:hover, .rank-item:hover { transform: none; }
}
</style>

<style>
.customer-home .el-card {
  border: none;
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-card);
}
.customer-home .el-card__header {
  padding: 16px 20px 6px;
  background: #fff;
  border-bottom: none;
}
.customer-home .el-card__body { padding: 12px 20px 18px; }
</style>
