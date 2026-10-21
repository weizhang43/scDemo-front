<template>
  <div class="portal-page">
    <div class="page-texture" aria-hidden="true" />
    <div class="page-shape page-shape--coral" aria-hidden="true" />
    <div class="page-shape page-shape--violet" aria-hidden="true" />
    <div class="page-shape page-shape--mint" aria-hidden="true" />

    <header class="portal-header">
      <router-link to="/portal" class="brand-lockup" aria-label="go购购首页">
        <img src="../../assets/logo.png" alt="" class="brand-mark" />
        <span class="brand-copy">
          <span class="brand-name"><em>go</em>购购</span>
          <small>好物随心购</small>
        </span>
      </router-link>
      <nav class="portal-nav" aria-label="公共快捷入口">
        <router-link to="/browse" class="nav-link"><i class="el-icon-shopping-bag-1" aria-hidden="true" /><span>逛商城</span></router-link>
        <router-link :to="{ path: '/customer', query: { from: 'portal' } }" class="nav-link"><i class="el-icon-service" aria-hidden="true" /><span>联系客服</span></router-link>
        <span class="nav-divider" aria-hidden="true" />
        <router-link to="/personal-work" class="nav-link"><i class="el-icon-notebook-2" aria-hidden="true" /><span>个人空间</span></router-link>
        <router-link to="/knowledge" class="nav-link"><i class="el-icon-collection-tag" aria-hidden="true" /><span>知识速记</span></router-link>
      </nav>
    </header>

    <main class="portal-main">
      <section class="portal-intro" aria-labelledby="portal-title">
        <p class="intro-kicker">WELCOME TO GO GOU GOU</p>
        <h1 id="portal-title">每一种身份，<br /><em>都有自己的精彩入口。</em></h1>
        <p class="intro-copy">从平台管理到店铺经营，再到发现心仪好物，在这里选择你的身份，开启专属体验。</p>
        <div class="intro-meta" aria-label="平台特点">
          <span><i class="el-icon-lock" aria-hidden="true" />专属权限</span>
          <span><i class="el-icon-mouse" aria-hidden="true" />快速进入</span>
          <span><i class="el-icon-mobile-phone" aria-hidden="true" />多端适配</span>
        </div>
      </section>

      <section class="role-section" aria-labelledby="role-title">
        <div class="section-heading">
          <div><p class="section-eyebrow">CHOOSE YOUR ROLE</p><h2 id="role-title">选择身份进入</h2></div>
          <span>选择身份，登录进入</span>
        </div>
        <div class="role-list">
          <a
            v-for="(role, index) in roles"
            :key="role.key"
            role="button"
            tabindex="0"
            class="role-card"
            :style="{ '--accent': role.accent, '--accent-ink': accentInks[role.key], '--i': index }"
            @click="openLogin(role)"
            @keyup.enter="openLogin(role)"
          >
            <span class="card-top">
              <span class="card-eyebrow">{{ role.key.toUpperCase() }}</span>
              <span class="role-icon"><i :class="role.icon" aria-hidden="true" /></span>
            </span>
            <strong class="card-name">{{ role.label }}</strong>
            <small class="card-desc">{{ role.desc }}</small>
            <span class="card-modules"><span v-for="module in modules[role.key]" :key="module">{{ module }}</span></span>
            <span class="card-action">{{ actions[role.key] }}<i class="el-icon-right" aria-hidden="true" /></span>
          </a>
        </div>
      </section>
    </main>

    <el-dialog
      :visible.sync="loginVisible"
      width="520px"
      top="12vh"
      custom-class="portal-login-dialog"
      @closed="activeRole = null"
    >
      <LoginForm v-if="activeRole" :role="activeRole" />
    </el-dialog>

    <footer class="portal-footer">
      <div class="portal-register"><span>还没有账号？</span><router-link to="/register">商家 / 顾客注册 <i class="el-icon-right" aria-hidden="true" /></router-link></div>
      <span class="portal-signature">GO GOU GOU · SC / 2026</span>
    </footer>
  </div>
</template>

<script>
import { ROLES } from '../../router/menuConfig';
import LoginForm from './LoginForm.vue';

const modules = {
  admin: ['用户与角色', '公告与日志'],
  merchant: ['商品与秒杀', '订单与报表'],
  customer: ['商城与领券', '订单与评价']
};

const actions = {
  admin: '进入管理后台',
  merchant: '开始经营',
  customer: '去逛商城'
};

// 深色玻璃卡上直接用 menuConfig 的 accent 对比度不够，配一版亮色
const accentInks = {
  admin: '#b79ae8',
  merchant: '#f7a94d',
  customer: '#3ec9ba'
};

export default {
  name: 'RolePortal',
  components: { LoginForm },
  data() { return { modules, actions, accentInks, loginVisible: false, activeRole: null }; },
  computed: { roles() { return ROLES; } },
  methods: {
    openLogin(role) {
      this.activeRole = role;
      this.loginVisible = true;
    }
  }
};
</script>

<style scoped>
.portal-page {
  --coral: #ff876d;
  --paper: #f7f3ea;
  --line: rgba(255,255,255,.18);
  --ease: cubic-bezier(.22, .75, .28, 1);
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow: hidden;
  box-sizing: border-box;
  padding: 28px clamp(24px, 5.5vw, 84px) 22px;
  color: #f7f4ef;
  background: linear-gradient(135deg, #26344b 0%, #3a3b59 48%, #285258 100%);
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}
.portal-page ::selection { color: #fff; background: rgba(237, 104, 74, .75); }
.page-texture { position: absolute; inset: 0; pointer-events: none; opacity: .55; background-image: radial-gradient(rgba(255,255,255,.085) .7px, transparent .7px); background-size: 8px 8px; mask-image: linear-gradient(to bottom, #000, transparent 88%); }
.page-shape { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(46px); will-change: transform, opacity; }
.page-shape--coral { width: clamp(300px, 36vw, 560px); height: clamp(300px, 36vw, 560px); top: 6%; right: -12%; background: radial-gradient(circle, rgba(255,135,109,.34), rgba(255,135,109,0) 68%); animation: breathe 16s ease-in-out infinite; }
.page-shape--violet { width: 420px; height: 420px; top: 30%; left: 24%; background: radial-gradient(circle, rgba(118,75,162,.3), rgba(118,75,162,0) 68%); animation: breathe 19s ease-in-out -6s infinite; }
.page-shape--mint { width: 460px; height: 460px; bottom: -240px; left: 4%; background: radial-gradient(circle, rgba(87,218,190,.26), rgba(87,218,190,0) 68%); animation: breathe 22s ease-in-out -11s infinite; }
@keyframes breathe { 0%, 100% { transform: scale(1) translate(0, 0); opacity: .72; } 50% { transform: scale(1.18) translate(-2.5%, 2%); opacity: 1; } }
.portal-header { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 24px; width: 100%; max-width: 1380px; margin: 0 auto; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
.brand-lockup { display: inline-flex; align-items: center; gap: 11px; color: #fffaf5; text-decoration: none; }
.brand-mark { width: 42px; height: 42px; object-fit: contain; border-radius: 11px; background: #fff; box-shadow: 0 8px 20px rgba(74,65,52,.12); transition: transform .3s var(--ease), box-shadow .3s var(--ease); }
.brand-lockup:hover .brand-mark { transform: translateY(-2px) rotate(-2deg); box-shadow: 0 12px 24px rgba(74,65,52,.17); }
.brand-copy { display: flex; flex-direction: column; gap: 2px; }
.brand-name { font-size: 19px; font-weight: 700; letter-spacing: .02em; }
.brand-name em { color: var(--coral); font-family: 'Trebuchet MS', sans-serif; font-size: 23px; font-style: normal; }
.brand-copy small { color: #aaaebe; font-size: 10px; letter-spacing: .18em; }
.portal-nav { display: flex; align-items: center; justify-content: flex-end; gap: 8px; }
.nav-link { position: relative; display: inline-flex; align-items: center; gap: 7px; min-height: 42px; padding: 0 14px; border: 1px solid transparent; border-radius: 10px; color: #cbd0dd; font-size: 13px; text-decoration: none; transition: color .22s var(--ease), background .22s var(--ease), border-color .22s var(--ease), transform .22s var(--ease); }
.nav-divider { flex: 0 0 auto; width: 1px; height: 18px; margin: 0 3px; background: rgba(255,255,255,.16); }
.nav-link i { color: #aeb5c5; font-size: 16px; transition: color .22s var(--ease), transform .22s var(--ease); }
.nav-link:hover { color: #fff; border-color: rgba(255,255,255,.08); background: rgba(255,255,255,.1); transform: translateY(-1px); }
.nav-link:hover i { color: var(--coral); transform: translateY(-1px); }
.portal-page a:focus-visible { outline: 2px solid var(--coral); outline-offset: 4px; }
.portal-main { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(260px, .72fr) minmax(600px, 1.65fr); align-items: center; gap: clamp(36px, 5vw, 84px); width: 100%; max-width: 1380px; min-height: calc(100vh - 160px); margin: 0 auto; padding: 48px 0 38px; box-sizing: border-box; }
.portal-intro { max-width: 470px; padding-bottom: 8px; }
.intro-kicker, .section-eyebrow { margin: 0; color: var(--coral); font-size: 10px; font-weight: 700; letter-spacing: .22em; }
.portal-intro h1 { margin: 18px 0 19px; color: #fffaf5; font-family: 'Songti SC', 'STSong', Georgia, serif; font-size: clamp(36px, 3.8vw, 56px); font-weight: 600; line-height: 1.3; letter-spacing: -.04em; overflow-wrap: anywhere; }
.portal-intro h1 em { color: #fffaf5; font-style: normal; background: linear-gradient(transparent 74%, rgba(255,135,109,.3) 74%, rgba(255,135,109,.3) 94%, transparent 94%); -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.intro-copy { max-width: 410px; margin: 0; color: #c3c8d4; font-size: 14px; line-height: 1.9; }
.intro-meta { display: flex; flex-wrap: wrap; gap: 12px 18px; margin-top: 31px; color: #adb4c3; font-size: 11px; }
.intro-meta span { display: inline-flex; align-items: center; gap: 6px; padding: 5px 9px; border: 1px solid rgba(255,255,255,.08); border-radius: 999px; background: rgba(255,255,255,.035); }
.intro-meta i { color: var(--coral); font-size: 14px; }
.role-section { min-width: 0; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 19px; padding-bottom: 11px; border-bottom: 1px solid rgba(255,255,255,.1); }
.section-heading h2 { margin: 7px 0 0; font-size: 23px; font-weight: 600; letter-spacing: .02em; }
.section-heading > span { color: #aeb5c3; font-size: 12px; }
.role-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(14px, 1.6vw, 22px); }
.role-card { position: relative; display: flex; flex-direction: column; min-width: 0; min-height: 352px; padding: 20px clamp(18px, 1.8vw, 24px) 22px; box-sizing: border-box; border: 1px solid transparent; border-radius: 20px; color: #f2f4f8; cursor: pointer; background: linear-gradient(155deg, rgba(26,33,52,.72), rgba(20,26,42,.62) 55%, rgba(23,30,49,.68)) padding-box, linear-gradient(160deg, rgba(255,255,255,.42), rgba(255,255,255,.14) 42%, var(--accent)) border-box; box-shadow: 0 18px 42px rgba(10,14,26,.42), inset 0 1px 0 rgba(255,255,255,.14); -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px); text-decoration: none; transition: transform .32s var(--ease), box-shadow .32s var(--ease), background .32s var(--ease); animation: card-in .65s var(--ease) backwards; animation-delay: calc(var(--i) * .12s); }
@keyframes card-in { from { opacity: 0; transform: translateY(26px); } }
.role-card:hover { transform: translateY(-6px); background: linear-gradient(155deg, rgba(32,40,63,.76), rgba(25,32,51,.66) 55%, rgba(29,36,57,.72)) padding-box, linear-gradient(160deg, rgba(255,255,255,.55), rgba(255,255,255,.2) 42%, var(--accent)) border-box; box-shadow: 0 24px 46px rgba(6,10,20,.5), 0 18px 40px -18px var(--accent), inset 0 1px 0 rgba(255,255,255,.18); }
.role-card:focus-visible { outline-color: var(--accent-ink); }
.card-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.card-eyebrow { color: rgba(235,238,246,.62); font-family: 'Trebuchet MS', sans-serif; font-size: 11px; letter-spacing: .2em; }
.role-icon { display: inline-flex; align-items: center; justify-content: center; width: 46px; height: 46px; border: 1px solid rgba(255,255,255,.18); border-radius: 13px; color: var(--accent-ink); font-size: 22px; background: rgba(255,255,255,.1); box-shadow: inset 0 1px 0 rgba(255,255,255,.16); transition: transform .3s var(--ease), box-shadow .3s var(--ease); }
.role-card:hover .role-icon { transform: translateY(-2px) rotate(-4deg); box-shadow: 0 10px 22px -8px var(--accent), inset 0 1px 0 rgba(255,255,255,.22); }
.card-name { margin: 20px 0 0; color: #fffaf5; font-family: 'Songti SC', 'STSong', Georgia, serif; font-size: 27px; font-weight: 600; letter-spacing: .04em; }
.card-desc { min-height: 38px; margin: 8px 0 0; color: rgba(220,226,238,.8); font-size: 12px; line-height: 1.65; }
.card-modules { display: flex; flex-wrap: wrap; gap: 6px; margin: 14px 0 16px; }
.card-modules span { padding: 5px 9px; border: 1px solid rgba(255,255,255,.14); border-radius: 999px; color: rgba(226,231,240,.75); font-size: 10px; white-space: nowrap; background: rgba(255,255,255,.07); }
.card-action { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 16px; border-top: 1px solid rgba(255,255,255,.12); color: var(--accent-ink); font-size: 12px; font-weight: 700; transition: border-color .25s var(--ease); }
.role-card:hover .card-action { border-color: rgba(255,255,255,.24); }
.card-action i { font-size: 15px; transition: transform .25s var(--ease); }
.role-card:hover .card-action i { transform: translateX(5px); }
.portal-footer { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 20px; width: 100%; max-width: 1380px; margin: 0 auto; color: #aeb5c3; font-size: 11px; }
.portal-register { display: flex; align-items: center; gap: 5px; }
.portal-register a { display: inline-flex; align-items: center; gap: 5px; min-height: 36px; color: var(--coral); font-weight: 700; text-decoration: none; }
.portal-register a:hover { text-decoration: underline; text-underline-offset: 4px; }
.portal-register a i { transition: transform .25s var(--ease); }
.portal-register a:hover i { transform: translateX(3px); }
.portal-signature { letter-spacing: .12em; }

@media (max-width: 1240px) {
  .portal-main { grid-template-columns: 1fr; align-items: start; gap: 42px; min-height: auto; padding: 55px 0 45px; }
  .portal-intro { max-width: 760px; }
  .portal-intro h1 { max-width: 720px; }
  .intro-copy { max-width: 620px; }
  .role-card { min-height: 320px; }
}
@media (max-width: 760px) {
  .portal-page { padding: 20px 20px 18px; }
  .portal-header { align-items: flex-start; flex-wrap: wrap; padding-bottom: 17px; }
  .portal-nav { width: 100%; justify-content: flex-start; gap: 2px; overflow-x: auto; }
  .nav-link { flex: 0 0 auto; padding: 0 10px; }
  .nav-divider { display: none; }
  .portal-main { gap: 38px; padding: 44px 0 38px; }
  .portal-intro h1 { font-size: clamp(34px, 9vw, 48px); }
  .role-list { grid-template-columns: 1fr; }
  .role-card { min-height: 0; padding: 18px 20px; }
  .role-card:hover { transform: none; }
  .card-desc { min-height: 0; }
  .portal-footer { align-items: flex-start; flex-direction: column; gap: 6px; }
}
@media (max-width: 420px) {
  .portal-page { padding-right: 16px; padding-left: 16px; }
  .brand-copy small { display: none; }
  .intro-meta { gap: 10px 14px; }
  .section-heading { align-items: flex-start; flex-direction: column; gap: 7px; }
  .portal-register { align-items: flex-start; flex-direction: column; }
}
@media (prefers-reduced-motion: reduce) {
  .portal-page *, .portal-page *::before, .portal-page *::after { scroll-behavior: auto !important; transition: none !important; animation: none !important; }
  .role-card:hover, .nav-link:hover { transform: none; }
}
</style>

<style>
.portal-login-dialog {
  --accent: #a5b4fc;
  --accent-soft: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255,255,255,.22);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, #344259 0%, #484a6a 48%, #366169 100%);
  box-shadow: 0 24px 60px rgba(20, 35, 80, 0.5);
}
.portal-login-dialog .el-dialog__header { padding: 14px 20px 0; }
.portal-login-dialog .el-dialog__headerbtn { top: 16px; right: 16px; }
.portal-login-dialog .el-dialog__headerbtn .el-dialog__close { color: rgba(255,255,255,.7); }
.portal-login-dialog .el-dialog__headerbtn:hover .el-dialog__close { color: #fff; }
.portal-login-dialog .el-dialog__body { padding: 8px 34px 30px; }
.portal-login-dialog .role-badge { color: #dbe3ff; background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.22); }
.portal-login-dialog .form-kicker { color: #c7d2fe; }
.portal-login-dialog .brand-title { color: #fff; }
.portal-login-dialog .brand-subtitle { color: rgba(226,232,244,.85); }
.portal-login-dialog .auth-form .el-form-item__label { color: rgba(235,240,250,.92); }
.portal-login-dialog .auth-form .el-input__inner { border: 1px solid rgba(255,255,255,.35); background: rgba(255,255,255,.12); color: #fff; }
.portal-login-dialog .auth-form .el-input__inner::placeholder { color: rgba(226,232,244,.55); }
.portal-login-dialog .auth-form .el-input__inner:hover { border-color: rgba(255,255,255,.55); }
.portal-login-dialog .auth-form .el-input__inner:focus { border-color: #a5b4fc; background: rgba(255,255,255,.16); box-shadow: 0 0 0 3px rgba(165,180,252,.25); }
.portal-login-dialog .auth-form .el-input__prefix { color: rgba(226,232,244,.7); }
.portal-login-dialog .auth-footer { color: rgba(226,232,244,.8); }
.portal-login-dialog .auth-footer .footer-sep { color: rgba(255,255,255,.35); }
.portal-login-dialog .auth-footer .auth-link { color: #c7d2fe; }
.portal-login-dialog .auth-footer .auth-link:hover, .portal-login-dialog .auth-footer .auth-link:focus { color: #dbe3fe; }
.portal-login-dialog .auth-form .auth-submit-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: none; }
.portal-login-dialog .auth-form .auth-submit-btn:hover,
.portal-login-dialog .auth-form .auth-submit-btn:focus { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); filter: brightness(1.1); }
.portal-login-dialog .form-privacy { color: rgba(214,222,240,.68); }
@media (max-width: 768px) {
  .portal-login-dialog { width: calc(100vw - 32px) !important; }
  .portal-login-dialog .el-dialog__body { padding: 8px 24px 24px; }
}
</style>
