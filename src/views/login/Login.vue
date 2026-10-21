<template>
  <div :class="['login-container', `login-container--${role.key}`]">
    <div class="bg-decorations" aria-hidden="true">
      <span class="page-texture" />
      <span class="page-shape page-shape--coral" />
      <span class="page-shape page-shape--violet" />
      <span class="page-shape page-shape--mint" />
    </div>
    <nav class="top-nav" aria-label="快捷入口">
      <router-link to="/browse" class="customer-entry"><i class="el-icon-shopping-bag-1" aria-hidden="true" />随便逛逛</router-link>
      <router-link to="/personal-work" class="customer-entry"><i class="el-icon-notebook-2" aria-hidden="true" />个人空间</router-link>
      <router-link :to="{ path: '/customer', query: { from: 'login' } }" class="customer-entry"><i class="el-icon-service" aria-hidden="true" />客服</router-link>
    </nav>

    <main class="login-panel">
      <section class="panel-left" aria-label="商城信息">
        <div class="left-kicker">GO / GOU / GOU</div>
        <div class="left-brand">
          <img src="../../assets/logo.png" alt="go购够" class="brand-mark" />
          <div><div class="brand-name">go购够商城</div><div class="brand-slogan">好物随心购，新鲜每一天</div></div>
        </div>
        <div class="left-message">
          <p class="message-label">WELCOME BACK</p>
          <h1>把每一次选择，<br /><em>都变成值得。</em></h1>
          <p>从商品经营到日常购物，在同一个空间里完成你的下一步。</p>
        </div>
        <div v-if="notices.length" class="left-notices">
          <div class="notice-head"><i class="el-icon-bell" aria-hidden="true" />最新公告 <span>LIVE UPDATE</span></div>
          <el-carousel height="120px" :interval="4000" :autoplay="true" :pause-on-hover="true" :loop="true" arrow="never" indicator-position="outside" class="notice-carousel">
            <el-carousel-item v-for="n in notices" :key="n.noticeId" @click.native="openNotice(n)">
              <div class="carousel-slide" :style="slideStyle(n)" role="button" tabindex="0" :aria-label="`查看公告：${n.title}`" @keyup.enter="openNotice(n)">
                <div class="carousel-mask"><div class="carousel-title">{{ n.title }}</div><div class="carousel-time"><i class="el-icon-time" aria-hidden="true" /> {{ n.createTime }}</div></div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
        <div v-else class="notice-empty"><i class="el-icon-info" aria-hidden="true" />暂无新的系统公告</div>
        <div class="left-footer"><span>SC / 2026</span><span>STAY CURIOUS</span></div>
      </section>

      <section class="panel-right" :style="{ '--accent': role.accent, '--accent-soft': role.accentSoft }">
        <router-link to="/portal" class="back-link"><i class="el-icon-arrow-left" aria-hidden="true" />切换身份</router-link>
        <LoginForm :role="role" />
      </section>
    </main>

    <el-dialog :title="currentNotice.title" :visible.sync="detailVisible" width="680px" top="8vh" custom-class="notice-dialog"><div class="notice-detail" v-html="currentNotice.content"></div></el-dialog>
  </div>
</template>

<script>
import { getLoginNotices } from '../../api/notice';
import { roleByKey, ROLES } from '../../router/menuConfig';
import { sanitizeRichText } from '../../utils/sanitize';
import LoginForm from './LoginForm.vue';

export default {
  name: 'Login',
  components: { LoginForm },
  data() {
    return {
      notices: [],
      currentNotice: {},
      detailVisible: false
    };
  },
  computed: {
    role() { return roleByKey(this.$route.params.role) || ROLES[0]; }
  },
  created() {
    if (!roleByKey(this.$route.params.role)) { this.$router.replace('/portal'); return; }
    if (!window.matchMedia('(min-width: 769px)').matches) return;
    getLoginNotices(this.role.uType).then(res => { this.notices = res.dataList || []; }).catch(() => {});
  },
  methods: {
    slideStyle(n) { return n.coverImage ? { backgroundImage: `url(${n.coverImage})` } : { background: 'linear-gradient(135deg,#182a46,#27486b)' }; },
    openNotice(notice) {
      this.currentNotice = { ...notice, content: sanitizeRichText(notice.content) };
      this.detailVisible = true;
    },
    sanitizeNoticeContent(content) {
      return sanitizeRichText(content);
    }
  }
};
</script>

<style scoped>
.login-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 88px 24px 40px;
  box-sizing: border-box;
  overflow: hidden;
  color: #f2f4f8;
  background: linear-gradient(135deg, #26344b 0%, #3a3b59 48%, #285258 100%);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
}
.bg-decorations { position: absolute; inset: 0; pointer-events: none; }.bg-decorations .page-texture { position: absolute; inset: 0; opacity: .5; background-image: radial-gradient(rgba(255,255,255,.085) .7px, transparent .7px); background-size: 8px 8px; -webkit-mask-image: linear-gradient(to bottom, #000, transparent 88%); mask-image: linear-gradient(to bottom, #000, transparent 88%); }
.bg-decorations .page-shape { position: absolute; border-radius: 50%; filter: blur(46px); will-change: transform, opacity; }
.page-shape--coral { width: clamp(300px, 36vw, 560px); height: clamp(300px, 36vw, 560px); top: -10%; right: -6%; background: radial-gradient(circle, rgba(255,135,109,.36), rgba(255,135,109,0) 68%); animation: breathe 16s ease-in-out infinite; }
.page-shape--violet { width: 460px; height: 460px; top: 30%; left: 34%; background: radial-gradient(circle, rgba(118,75,162,.34), rgba(118,75,162,0) 68%); animation: breathe 19s ease-in-out -6s infinite; }
.page-shape--mint { width: 460px; height: 460px; bottom: -12%; left: 6%; background: radial-gradient(circle, rgba(87,218,190,.28), rgba(87,218,190,0) 68%); animation: breathe 22s ease-in-out -11s infinite; }
@keyframes breathe { 0%, 100% { transform: scale(1) translate(0, 0); opacity: .72; } 50% { transform: scale(1.18) translate(-2.5%, 2%); opacity: 1; } }
.top-nav { position: absolute; top: 24px; right: 32px; z-index: 2; display: flex; gap: 8px; }
.customer-entry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 999px;
  color: #fff;
  background: rgba(255, 255, 255, 0.12);
  font-size: 13px;
  text-decoration: none;
  transition: 0.2s;
}
.customer-entry:hover,
.customer-entry:focus-visible {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.65);
  background: rgba(255, 255, 255, 0.24);
  transform: translateY(-1px);
  outline: none;
}
.login-panel {
  position: relative;
  z-index: 1;
  display: flex;
  width: 820px;
  max-width: calc(100vw - 48px);
  min-height: 510px;
  overflow: hidden;
  border: 1px solid transparent;
  border-radius: 20px;
  background: linear-gradient(transparent, transparent) padding-box, linear-gradient(160deg, rgba(255,255,255,.45), rgba(255,255,255,.14) 42%, rgba(255,135,109,.5)) border-box;
  box-shadow: 0 18px 42px rgba(10,14,26,.42), inset 0 1px 0 rgba(255,255,255,.14);
  animation: panel-in 0.45s ease both;
}
@keyframes panel-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.panel-left {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 24px 28px 20px;
  color: #fff;
  background: linear-gradient(155deg, rgba(20,26,42,.88), rgba(15,20,33,.8) 55%, rgba(18,23,38,.85));
  -webkit-backdrop-filter: blur(18px);
  backdrop-filter: blur(18px);
}
.left-kicker, .form-kicker, .message-label { margin: 0; color: #e7a14c; font-size: 10px; font-weight: 700; letter-spacing: 2px; }
.left-kicker { margin-bottom: 18px; color: #aebdca; }
.left-brand { display: flex; align-items: center; gap: 14px; padding-bottom: 16px; border-bottom: 1px solid rgba(255, 255, 255, 0.18); }
.brand-mark { width: 50px; height: 50px; object-fit: contain; border-radius: var(--radius-sm); background: #fff; }
.brand-name { font-size: 19px; font-weight: 700; letter-spacing: 1px; }
.brand-slogan { margin-top: 5px; color: #aebdca; font-size: 12px; }
.left-message { margin: 24px 0 16px; }
.message-label { margin-bottom: 12px; }
.left-message h1 { margin: 0; font-size: 30px; line-height: 1.35; letter-spacing: 1px; font-weight: 600; }
.left-message h1 em { color: var(--accent-signal, #e7a14c); font-style: normal; }
.left-message p:last-child { max-width: 300px; margin: 15px 0 0; color: #aebdca; font-size: 13px; line-height: 1.8; }
.left-notices { margin-top: auto; }
.notice-head { display: flex; gap: 7px; align-items: center; margin-bottom: 10px; font-size: 13px; font-weight: 600; }
.notice-head span { margin-left: auto; color: #aebdca; font-size: 9px; letter-spacing: 1.5px; }
.carousel-slide { height: 100%; display: flex; align-items: flex-end; overflow: hidden; cursor: pointer; background-size: cover; background-position: center; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: var(--radius-sm); }
.carousel-slide:focus-visible { outline: 2px solid var(--accent-signal, #e7a14c); outline-offset: 3px; }
.carousel-mask { width: 100%; padding: 14px 16px; background: linear-gradient(transparent, rgba(10, 22, 38, 0.9)); }
.carousel-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 15px; font-weight: 600; }
.carousel-time { margin-top: 5px; color: #c4ced8; font-size: 11px; }
.notice-empty { margin-top: auto; padding: 18px 0; color: #aebdca; font-size: 12px; }
.left-footer { display: flex; justify-content: space-between; margin-top: 20px; color: #6f8296; font-size: 10px; letter-spacing: 1.5px; }
.panel-right {
  position: relative;
  flex: 0 0 365px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 50px 34px 30px;
  box-sizing: border-box;
  background: rgba(255,253,249,.98);
}
.panel-right::before { position: absolute; top: 0; right: 0; left: 0; height: 4px; background: var(--accent); content: ''; }
.back-link { position: absolute; top: 22px; left: 28px; color: #748091; font-size: 12px; text-decoration: none; }
.back-link:hover, .back-link:focus { color: var(--accent); outline: none; }
.panel-right >>> .role-badge { position: absolute; top: 20px; right: 28px; margin-bottom: 0; }
.panel-right >>> .brand { margin-top: 26px; }
.panel-right >>> .form-privacy { margin-top: 44px; }
.panel-right >>> .auth-submit-btn { background: var(--accent); border-color: var(--accent); }
.panel-right >>> .auth-submit-btn:hover, .panel-right >>> .auth-submit-btn:focus { background: var(--accent); border-color: var(--accent); filter: brightness(1.08); }
.notice-detail { max-height: 62vh; overflow: auto; color: #303133; line-height: 1.75; }
.notice-detail >>> img { max-width: 100%; }
@media (prefers-reduced-motion: reduce) { .login-panel, .customer-entry, .page-shape { animation: none !important; transition: none !important; } }
@media (max-width: 768px) {
  .login-container { padding: 76px 16px 32px; }
  .top-nav { top: 16px; left: 16px; right: 16px; justify-content: flex-end; overflow-x: auto; }
  .customer-entry { flex-shrink: 0; padding: 7px 11px; }
  .login-panel { max-width: 100%; min-height: 0; }
  .panel-left { display: none; }
  .panel-right { flex: 1 1 auto; padding: 58px 24px 30px; }
  .brand-title { font-size: 24px; }
}
@media (max-width: 375px) {
  .top-nav { justify-content: flex-start; }
  .customer-entry { font-size: 12px; }
  .panel-right { padding-right: 20px; padding-left: 20px; }
  .role-badge { right: 20px; }
  .back-link { left: 20px; }
}
</style>

<style>
.login-container .notice-carousel .el-carousel__indicators--outside button { background-color: rgba(255, 255, 255, 0.45); }
.login-container .notice-carousel .el-carousel__indicator.is-active button { background-color: var(--accent-signal, #e7a14c); }
.login-container--admin {
  --accent-signal: #ad91ff;
}
.login-container--admin .panel-left .left-kicker,
.login-container--admin .panel-left .message-label { color: #c2b0ff; }
.login-container--admin .panel-left .left-message h1 em { color: #c2b0ff; }
.login-container--admin .role-badge { color: #684092; background: rgba(118, 75, 162, 0.12); }
.login-container--admin .form-privacy { color: #8990a6; }
.login-container--admin .panel-right .auth-submit-btn { box-shadow: 0 10px 20px rgba(118, 75, 162, 0.2); }
.login-container--admin .panel-right .auth-submit-btn:hover,
.login-container--admin .panel-right .auth-submit-btn:focus { box-shadow: 0 12px 24px rgba(118, 75, 162, 0.3); }
.login-container--merchant {
  --accent-signal: #f3b65d;
}
.login-container--merchant .panel-left .left-kicker,
.login-container--merchant .panel-left .message-label { color: #f3b65d; }
.login-container--merchant .panel-left .left-message h1 em { color: #f3b65d; }
.login-container--merchant .role-badge { color: #bc6908; background: rgba(232, 133, 14, 0.13); }
.login-container--merchant .form-privacy { color: #938d83; }
.login-container--merchant .panel-right .auth-submit-btn { box-shadow: 0 10px 20px rgba(232, 133, 14, 0.2); }
.login-container--merchant .panel-right .auth-submit-btn:hover,
.login-container--merchant .panel-right .auth-submit-btn:focus { box-shadow: 0 12px 24px rgba(232, 133, 14, 0.3); }
.login-container--customer {
  --accent-signal: #72e2d0;
}
.login-container--customer .panel-left .left-kicker,
.login-container--customer .panel-left .message-label { color: #72e2d0; }
.login-container--customer .panel-left .left-message h1 em { color: #70e1d0; }
.login-container--customer .role-badge { color: #087a70; background: rgba(15, 155, 142, 0.12); }
.login-container--customer .form-privacy { color: #849b9e; }
.login-container--customer .panel-right .auth-submit-btn { box-shadow: 0 10px 20px rgba(15, 155, 142, 0.2); }
.login-container--customer .panel-right .auth-submit-btn:hover,
.login-container--customer .panel-right .auth-submit-btn:focus { box-shadow: 0 12px 24px rgba(15, 155, 142, 0.28); }
@media (max-width: 768px) {
  .login-container--admin .panel-right { background: #fcfbff; }
  .login-container--merchant .panel-right { background: #fffdf9; }
  .login-container--customer .panel-right { background: #fbfffe; }
  .login-container--admin .top-nav { background: rgba(27, 24, 67, 0.35); }
  .login-container--merchant .top-nav { background: rgba(38, 50, 55, 0.35); }
  .login-container--customer .top-nav { background: rgba(4, 58, 70, 0.35); }
}
</style>
