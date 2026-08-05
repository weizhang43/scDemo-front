<template>
  <div class="seckill-zone">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">限时秒杀</span>
          <span class="header-meta">共 {{ list.length }} 场</span>
        </div>
        <div class="header-actions">
          <el-button type="text" icon="el-icon-refresh" @click="fetchData">刷新</el-button>
        </div>
      </div>

      <el-row v-if="list.length" :gutter="16">
        <el-col v-for="item in list" :key="item.id" :xs="24" :sm="12" :md="8">
          <div class="seckill-card" :class="{ 'seckill-card--disabled': !isRunning(item) || item.remainStock <= 0 }">
            <div class="seckill-image-wrap">
              <el-image v-if="item.imageUrl" :src="item.imageUrl" fit="cover" class="seckill-image">
                <div slot="error" class="seckill-image-fallback"><i class="el-icon-picture-outline" /></div>
              </el-image>
              <div v-else class="seckill-image-fallback"><i class="el-icon-picture-outline" /></div>
              <div v-if="maskTextOf(item)" class="sold-out-mask">{{ maskTextOf(item) }}</div>
              <div class="phase-badge" :class="'phase-badge--' + phaseOf(item).key">{{ phaseOf(item).text }}</div>
            </div>

            <div class="seckill-body">
              <div class="seckill-name" :title="item.pName">{{ item.pName }}</div>
              <div class="seckill-price-row">
                <span class="seckill-price">¥ {{ item.seckillPrice }}</span>
                <span class="price-origin">¥ {{ item.price }}</span>
              </div>
              <el-progress
                :percentage="quotaPercent(item)"
                :show-text="false"
                :stroke-width="8"
                color="#f56c6c"
                class="quota-bar"
              />
              <div class="quota-text">
                <span>剩余 <b>{{ item.remainStock }}</b> / {{ item.seckillStock }} 份</span>
                <span class="countdown">{{ countdownOf(item) }}</span>
              </div>
              <el-button
                type="danger"
                size="small"
                class="grab-btn"
                :loading="grabbingId === item.id"
                :disabled="!isRunning(item) || item.remainStock <= 0"
                @click="openGrab(item)"
              >{{ grabButtonText(item) }}</el-button>
            </div>
          </div>
        </el-col>
      </el-row>

      <el-empty v-else-if="!loading" description="暂无秒杀活动" />
    </el-card>

    <!-- 抢购确认 -->
    <el-dialog title="确认抢购" :visible.sync="grabVisible" width="480px" :close-on-click-modal="false">
      <el-form label-width="90px">
        <el-form-item label="商品">
          <span class="dialog-name">{{ current && current.pName }}</span>
        </el-form-item>
        <el-form-item label="秒杀价">
          <span class="seckill-price">¥ {{ current && current.seckillPrice }}</span>
          <span class="dialog-hint">每人限购 1 件</span>
        </el-form-item>
        <el-form-item label="收货地址">
          <el-select v-model="addressId" placeholder="请选择收货地址" :disabled="!addressList.length" style="width:100%;">
            <el-option
              v-for="addr in addressList"
              :key="addr.aId"
              :label="formatAddressLabel(addr)"
              :value="addr.aId"
            />
          </el-select>
          <el-button v-if="!addressList.length" type="text" @click="goAddress">暂无收货地址，去添加</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="grabVisible = false">取消</el-button>
        <el-button type="danger" :loading="grabbing" @click="submitGrab">立即抢购</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { activeSeckillList } from '../../api/seckill';
import { seckill, seckillResult } from '../../api/order';
import { getAddressList } from '../../api/address';

/** 结果轮询：秒杀是异步落库，PENDING 期间最多等这么久 */
const POLL_INTERVAL = 1000;
const POLL_MAX_TIMES = 15;

export default {
  name: 'SeckillZone',
  data() {
    return {
      list: [],
      loading: false,
      // 每秒自增，驱动倒计时与阶段判断重新计算
      now: Date.now(),
      tickTimer: null,
      addressList: [],
      addressId: null,
      grabVisible: false,
      grabbing: false,
      grabbingId: null,
      current: null,
      pollTimer: null,
      pollTimes: 0
    };
  },
  created() {
    this.fetchData();
    this.loadAddresses();
    this.tickTimer = setInterval(() => { this.now = Date.now(); }, 1000);
  },
  beforeDestroy() {
    if (this.tickTimer) clearInterval(this.tickTimer);
    this.stopPolling();
  },
  methods: {
    fetchData() {
      this.loading = true;
      activeSeckillList()
        .then(res => {
          this.list = res.dataList || [];
        })
        .catch(() => {})
        .finally(() => { this.loading = false; });
    },
    loadAddresses() {
      const user = this.$store.state.userInfo || {};
      if (!user.uId) return;
      getAddressList(user.uId)
        .then(res => {
          const list = res.dataList || [];
          this.addressList = Array.isArray(list) ? list : [];
          const def = this.addressList.find(a => a.isDefault === 1);
          this.addressId = def ? def.aId : (this.addressList[0] && this.addressList[0].aId) || null;
        })
        .catch(() => { this.addressList = []; });
    },
    formatAddressLabel(addr) {
      if (!addr) return '';
      const region = [addr.province, addr.city, addr.district].filter(v => v).join('');
      return `${addr.consignee} ${addr.phone} ${region}${addr.detail || ''}${addr.isDefault === 1 ? '（默认）' : ''}`;
    },
    /** 后端返回 'yyyy-MM-dd HH:mm:ss'，替换成 '/' 兼容 Safari 解析 */
    parseTime(s) {
      return new Date(String(s || '').replace(/-/g, '/')).getTime();
    },
    phaseOf(item) {
      if (this.now < this.parseTime(item.startTime)) return { key: 'upcoming', text: '未开始' };
      if (this.now > this.parseTime(item.endTime)) return { key: 'ended', text: '已结束' };
      return { key: 'running', text: '进行中' };
    },
    isRunning(item) {
      return this.phaseOf(item).key === 'running';
    },
    maskTextOf(item) {
      const phase = this.phaseOf(item).key;
      if (phase === 'ended') return '已结束';
      if (phase === 'running' && item.remainStock <= 0) return '已抢完';
      return '';
    },
    quotaPercent(item) {
      const total = Number(item.seckillStock) || 0;
      if (!total) return 0;
      const remain = Math.max(Number(item.remainStock) || 0, 0);
      return Math.round(remain / total * 100);
    },
    countdownOf(item) {
      const phase = this.phaseOf(item).key;
      if (phase === 'ended') return '活动已结束';
      const target = phase === 'upcoming' ? this.parseTime(item.startTime) : this.parseTime(item.endTime);
      const prefix = phase === 'upcoming' ? '距开始 ' : '距结束 ';
      let sec = Math.max(Math.floor((target - this.now) / 1000), 0);
      const d = Math.floor(sec / 86400);
      sec -= d * 86400;
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      const pad = n => String(n).padStart(2, '0');
      return prefix + (d > 0 ? `${d} 天 ` : '') + `${pad(h)}:${pad(m)}:${pad(s)}`;
    },
    grabButtonText(item) {
      const phase = this.phaseOf(item).key;
      if (phase === 'upcoming') return '即将开始';
      if (phase === 'ended') return '已结束';
      return item.remainStock <= 0 ? '已抢完' : '立即抢购';
    },
    openGrab(item) {
      this.current = item;
      this.grabVisible = true;
      if (!this.addressList.length) this.loadAddresses();
    },
    submitGrab() {
      if (!this.addressId) {
        this.$message.warning('请选择收货地址');
        return;
      }
      const user = this.$store.state.userInfo || {};
      this.grabbing = true;
      this.grabbingId = this.current.id;
      seckill({
        uId: user.uId,
        activityId: this.current.id,
        addressId: this.addressId,
        addPerson: user.uName || user.realName || 'anonymous'
      })
        .then(res => {
          const vo = res.daoResult || {};
          if (vo.status === 'FAILED') {
            this.$message.error(vo.msg || '抢购失败');
            this.finishGrab();
            return;
          }
          this.grabVisible = false;
          this.$message.info('已抢到名额，正在生成订单…');
          this.startPolling(user.uId, this.current.id);
        })
        .catch(() => { this.finishGrab(); });
    },
    /** 秒杀是「预扣 → 入队 → 异步落库」，终态只能靠轮询 */
    startPolling(uId, activityId) {
      this.stopPolling();
      this.pollTimes = 0;
      this.pollTimer = setInterval(() => {
        this.pollTimes += 1;
        if (this.pollTimes > POLL_MAX_TIMES) {
          this.stopPolling();
          this.finishGrab();
          this.$message.warning('订单处理中，请稍后到订单列表查看');
          return;
        }
        seckillResult(uId, activityId)
          .then(res => {
            const vo = res.daoResult;
            if (!vo || vo.status === 'PENDING') return;
            this.stopPolling();
            this.finishGrab();
            if (vo.status === 'SUCCESS') {
              this.$message.success('秒杀成功，订单已生成');
            } else if (vo.status === 'FAILED') {
              this.$message.error(vo.msg || '秒杀失败');
            }
            this.fetchData();
          })
          .catch(() => {
            this.stopPolling();
            this.finishGrab();
          });
      }, POLL_INTERVAL);
    },
    stopPolling() {
      if (this.pollTimer) {
        clearInterval(this.pollTimer);
        this.pollTimer = null;
      }
    },
    finishGrab() {
      this.grabbing = false;
      this.grabbingId = null;
    },
    goAddress() {
      const user = this.$store.state.userInfo || {};
      this.$router.push(`/user/${user.uId}/address`);
    }
  }
};
</script>

<style scoped>
.seckill-zone {
  min-height: 100vh;
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
}
.seckill-card {
  background: #fff;
  border: 1px solid #eef0f4;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 16px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.seckill-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(31, 41, 59, 0.1);
}
.seckill-card--disabled {
  opacity: 0.72;
}
.seckill-card--disabled:hover {
  transform: none;
  box-shadow: none;
}
.seckill-image-wrap {
  position: relative;
  width: 100%;
  height: 180px;
  background: #f7f8fb;
}
.seckill-image {
  width: 100%;
  height: 100%;
  display: block;
}
.seckill-image-fallback {
  width: 100%;
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c3c9d4;
  font-size: 34px;
}
.sold-out-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 41, 59, 0.45);
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
}
.phase-badge {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.phase-badge--running {
  background: linear-gradient(135deg, #f56c6c 0%, #cf1322 100%);
}
.phase-badge--ended {
  background: #9aa3b2;
}
.seckill-body {
  padding: 12px 14px 14px;
}
.seckill-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2733;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.seckill-price-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 8px 0 10px;
}
.seckill-price {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-price);
  font-variant-numeric: tabular-nums;
}
.price-origin {
  font-size: 13px;
  color: #9aa3b2;
  text-decoration: line-through;
  font-variant-numeric: tabular-nums;
}
.quota-bar {
  margin-bottom: 6px;
}
.quota-text {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #8a93a4;
  margin-bottom: 12px;
}
.quota-text b {
  color: #cf1322;
}
.countdown {
  font-variant-numeric: tabular-nums;
}
.grab-btn {
  width: 100%;
  border-radius: 8px;
}
.dialog-name {
  font-weight: 600;
  color: #1f2733;
}
.dialog-hint {
  margin-left: 10px;
  font-size: 12px;
  color: #8a93a4;
}
@media (max-width: 768px) {
  .seckill-zone {
    padding: 12px;
  }
}
</style>

<style>
.seckill-zone .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.seckill-zone .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.seckill-zone .el-card__body {
  padding: 20px 24px;
}
.seckill-zone .seckill-image .el-image__inner {
  object-fit: cover;
}
</style>
