<template>
  <div class="portal-page">
    <div class="page-texture" aria-hidden="true" />
    <div class="page-shape page-shape--coral" aria-hidden="true" />
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
        <router-link to="/personal-work" class="nav-link"><i class="el-icon-notebook-2" aria-hidden="true" /><span>个人空间</span></router-link>
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
          <span>登录后使用对应功能</span>
        </div>
        <div class="role-list">
          <router-link
            v-for="(role, index) in roles"
            :key="role.key"
            :to="`/login/${role.key}`"
            class="role-card"
            :class="`role-card--${role.key}`"
            :style="{ '--accent': role.accent, '--accent-soft': role.accentSoft }"
          >
            <span class="card-index">{{ String(index + 1).padStart(2, '0') }}</span>
            <span class="role-icon"><i :class="role.icon" aria-hidden="true" /></span>
            <span class="card-identity"><strong>{{ role.label }}</strong><small>{{ role.desc }}</small></span>
            <span class="card-modules"><span v-for="module in modules[role.key]" :key="module">{{ module }}</span></span>
            <span class="card-action">{{ actions[role.key] }}<i class="el-icon-right" aria-hidden="true" /></span>
          </router-link>
        </div>
      </section>
    </main>

    <footer class="portal-footer">
      <div class="portal-register"><span>还没有账号？</span><router-link to="/register">商家 / 顾客注册 <i class="el-icon-right" aria-hidden="true" /></router-link></div>
      <span class="portal-signature">GO GOU GOU · SC / 2026</span>
    </footer>
  </div>
</template>

<script>
import { ROLES } from '../../router/menuConfig';

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

export default {
  name: 'RolePortal',
  data() { return { modules, actions }; },
  computed: { roles() { return ROLES; } }
};
</script>

<style scoped>
.portal-page {
  --ink: #273044;
  --muted: #777b80;
  --coral: #ff876d;
  --paper: #f7f3ea;
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
.page-shape { position: absolute; border-radius: 50%; pointer-events: none; }
.page-shape--coral { width: clamp(280px, 34vw, 540px); height: clamp(280px, 34vw, 540px); top: 8%; right: -15%; background: rgba(255,135,109,.16); filter: blur(2px); }
.page-shape--mint { width: 300px; height: 300px; bottom: -210px; left: 7%; border: 1px solid rgba(87,218,190,.22); box-shadow: inset 0 0 0 55px rgba(87,218,190,.055); }
.portal-header { position: relative; z-index: 2; display: flex; align-items: center; justify-content: space-between; gap: 24px; width: 100%; max-width: 1380px; margin: 0 auto; padding-bottom: 22px; border-bottom: 1px solid rgba(255,255,255,.15); }
.brand-lockup { display: inline-flex; align-items: center; gap: 11px; color: #fffaf5; text-decoration: none; }
.brand-mark { width: 42px; height: 42px; object-fit: contain; border-radius: 11px; background: #fff; box-shadow: 0 8px 20px rgba(74,65,52,.12); transition: transform .3s var(--ease), box-shadow .3s var(--ease); }
.brand-lockup:hover .brand-mark { transform: translateY(-2px) rotate(-2deg); box-shadow: 0 12px 24px rgba(74,65,52,.17); }
.brand-copy { display: flex; flex-direction: column; gap: 2px; }
.brand-name { font-size: 19px; font-weight: 700; letter-spacing: .02em; }
.brand-name em { color: var(--coral); font-family: 'Trebuchet MS', sans-serif; font-size: 23px; font-style: normal; }
.brand-copy small { color: #aaaebe; font-size: 10px; letter-spacing: .18em; }
.portal-nav { display: flex; align-items: center; justify-content: flex-end; gap: 7px; }
.nav-link { position: relative; display: inline-flex; align-items: center; gap: 7px; min-height: 42px; padding: 0 13px; border-radius: 10px; color: #cbd0dd; font-size: 13px; text-decoration: none; transition: color .22s var(--ease), background .22s var(--ease), transform .22s var(--ease); }
.nav-link i { color: #aeb5c5; font-size: 16px; transition: color .22s var(--ease), transform .22s var(--ease); }
.nav-link:hover { color: #fff; background: rgba(255,255,255,.1); transform: translateY(-1px); }
.nav-link:hover i { color: var(--coral); transform: translateY(-1px); }
.portal-page a:focus-visible { outline: 2px solid var(--coral); outline-offset: 4px; }
.portal-main { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(260px, .72fr) minmax(600px, 1.65fr); align-items: center; gap: clamp(36px, 5vw, 84px); width: 100%; max-width: 1380px; min-height: calc(100vh - 160px); margin: 0 auto; padding: 48px 0 38px; box-sizing: border-box; }
.portal-intro { max-width: 470px; padding-bottom: 8px; }
.intro-kicker, .section-eyebrow { margin: 0; color: var(--coral); font-size: 10px; font-weight: 700; letter-spacing: .22em; }
.portal-intro h1 { margin: 18px 0 19px; color: #fffaf5; font-family: 'Songti SC', 'STSong', Georgia, serif; font-size: clamp(36px, 3.8vw, 56px); font-weight: 600; line-height: 1.3; letter-spacing: -.04em; overflow-wrap: anywhere; }
.portal-intro h1 em { color: #fffaf5; font-style: normal; background: linear-gradient(transparent 74%, rgba(255,135,109,.3) 74%, rgba(255,135,109,.3) 94%, transparent 94%); -webkit-box-decoration-break: clone; box-decoration-break: clone; }
.intro-copy { max-width: 410px; margin: 0; color: #c3c8d4; font-size: 14px; line-height: 1.9; }
.intro-meta { display: flex; flex-wrap: wrap; gap: 12px 18px; margin-top: 31px; color: #adb4c3; font-size: 11px; }
.intro-meta span { display: inline-flex; align-items: center; gap: 6px; }
.intro-meta i { color: var(--coral); font-size: 14px; }
.role-section { min-width: 0; }
.section-heading { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 19px; }
.section-heading h2 { margin: 7px 0 0; font-size: 23px; font-weight: 600; letter-spacing: .02em; }
.section-heading > span { color: #aeb5c3; font-size: 12px; }
.role-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(12px, 1.4vw, 20px); }
.role-card { position: relative; display: flex; flex-direction: column; min-width: 0; min-height: 350px; overflow: hidden; padding: 22px clamp(18px, 1.8vw, 26px) 24px; box-sizing: border-box; border: 1px solid rgba(39,48,68,.12); border-radius: 16px; color: var(--ink); background: rgba(255,255,255,.72); box-shadow: 0 14px 35px rgba(74,65,52,.075); text-decoration: none; transition: transform .3s var(--ease), border-color .3s var(--ease), box-shadow .3s var(--ease), background .3s var(--ease); }
.role-card::before { position: absolute; inset: 0 0 auto; height: 3px; background: var(--accent); content: ''; opacity: .78; transform: scaleX(.23); transform-origin: left; transition: transform .35s var(--ease), opacity .35s var(--ease); }
.role-card::after { position: absolute; right: -55px; bottom: -75px; width: 160px; height: 160px; border-radius: 50%; background: var(--accent-soft); content: ''; transition: transform .4s var(--ease); }
.role-card:hover { border-color: var(--accent); background: rgba(255,255,255,.93); box-shadow: 0 22px 48px rgba(74,65,52,.13); transform: translateY(-7px); }
.role-card--admin { border-color: rgba(118,75,162,.2); background: linear-gradient(150deg, rgba(255,253,255,.98) 0%, rgba(239,232,248,.96) 100%); box-shadow: 0 14px 35px rgba(83,55,115,.11); }
.role-card--merchant { border-color: rgba(232,133,14,.22); background: linear-gradient(150deg, rgba(255,254,250,.98) 0%, rgba(255,238,211,.96) 100%); box-shadow: 0 14px 35px rgba(137,84,26,.11); }
.role-card--customer { border-color: rgba(15,155,142,.2); background: linear-gradient(150deg, rgba(252,255,254,.98) 0%, rgba(222,244,240,.96) 100%); box-shadow: 0 14px 35px rgba(25,103,96,.11); }
.role-card--admin:hover { background: linear-gradient(150deg, #fff 0%, #eee4f8 100%); box-shadow: 0 22px 48px rgba(83,55,115,.18); }
.role-card--merchant:hover { background: linear-gradient(150deg, #fff 0%, #ffebca 100%); box-shadow: 0 22px 48px rgba(137,84,26,.18); }
.role-card--customer:hover { background: linear-gradient(150deg, #fff 0%, #d8f1ed 100%); box-shadow: 0 22px 48px rgba(25,103,96,.18); }
.role-card:hover::before { opacity: 1; transform: scaleX(1); }
.role-card:hover::after { transform: scale(1.22); }
.role-card:focus-visible { outline-color: var(--accent); }
.card-index { align-self: flex-end; color: #aaa69d; font-family: 'Trebuchet MS', sans-serif; font-size: 11px; letter-spacing: .14em; }
.role-icon { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; margin: 28px 0 23px; border-radius: 13px; color: var(--accent); font-size: 23px; background: var(--accent-soft); transition: transform .3s var(--ease), box-shadow .3s var(--ease); }
.role-card:hover .role-icon { box-shadow: 0 10px 24px var(--accent-soft); transform: translateY(-2px) rotate(-3deg); }
.card-identity { display: flex; flex-direction: column; gap: 7px; }
.card-identity strong { font-family: 'Songti SC', 'STSong', Georgia, serif; font-size: 26px; font-weight: 600; letter-spacing: .03em; }
.card-identity small { min-height: 34px; color: var(--muted); font-size: 12px; line-height: 1.55; }
.card-modules { display: flex; flex-wrap: wrap; gap: 6px; margin: 20px 0; }
.card-modules span { padding: 5px 8px; border: 1px solid rgba(39,48,68,.095); border-radius: 6px; color: #696e78; font-size: 10px; white-space: nowrap; background: rgba(247,243,234,.72); }
.card-action { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: auto; padding-top: 17px; border-top: 1px solid rgba(39,48,68,.1); color: var(--accent); font-size: 12px; font-weight: 700; }
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
  .portal-main { gap: 38px; padding: 44px 0 38px; }
  .portal-intro h1 { font-size: clamp(34px, 9vw, 48px); }
  .role-list { grid-template-columns: 1fr; }
  .role-card { min-height: 0; padding: 20px 22px; }
  .role-card::after { right: -70px; bottom: -95px; }
  .role-icon { margin: 14px 0 17px; }
  .card-identity small { min-height: 0; }
  .card-modules { margin: 16px 0; }
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
  .portal-page *, .portal-page *::before, .portal-page *::after { scroll-behavior: auto !important; transition: none !important; }
  .role-card:hover, .nav-link:hover { transform: none; }
}
</style>
