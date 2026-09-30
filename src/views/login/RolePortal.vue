<template>
  <div class="portal-page">
    <div class="portal-orb portal-orb--one" aria-hidden="true" />
    <div class="portal-orb portal-orb--two" aria-hidden="true" />
    <div class="portal-grid" aria-hidden="true" />

    <header class="portal-header">
      <router-link to="/portal" class="brand-lockup" aria-label="go购购首页">
        <img src="../../assets/logo.png" alt="" class="brand-mark" />
        <span class="brand-copy"><strong>go购购</strong><small>好物随心购</small></span>
      </router-link>
      <nav class="portal-nav" aria-label="公共快捷入口">
        <router-link to="/browse" class="nav-link"><i class="el-icon-shopping-bag-1" aria-hidden="true" />逛商城</router-link>
        <router-link :to="{ path: '/customer', query: { from: 'portal' } }" class="nav-link"><i class="el-icon-service" aria-hidden="true" />联系客服</router-link>
        <router-link to="/personal-work" class="nav-link"><i class="el-icon-notebook-2" aria-hidden="true" />个人空间</router-link>
      </nav>
    </header>

    <main class="portal-main">
      <section class="role-section" aria-labelledby="role-title">
        <div class="section-heading">
          <h1 id="role-title" class="section-title">选择身份进入</h1>
          <span class="section-hint">登录后使用对应功能</span>
        </div>
        <div class="role-list">
          <router-link
            v-for="role in roles"
            :key="role.key"
            :to="`/login/${role.key}`"
            class="role-card"
            :class="`role-card--${role.key}`"
            :style="{ '--accent': role.accent, '--accent-soft': role.accentSoft }"
          >
            <span class="card-top">
              <span class="role-icon"><i :class="role.icon" aria-hidden="true" /></span>
              <i class="el-icon-top-right card-direction" aria-hidden="true" />
            </span>
            <span class="card-identity"><strong>{{ role.label }}</strong><small>{{ role.desc }}</small></span>
            <span class="card-modules">
              <span v-for="module in modules[role.key]" :key="module">{{ module }}</span>
            </span>
            <span class="card-action">以此身份登录 <i class="el-icon-right" aria-hidden="true" /></span>
          </router-link>
        </div>
      </section>

      <div class="portal-register">还没有账号？<router-link to="/register">商家 / 顾客注册 <i class="el-icon-right" aria-hidden="true" /></router-link></div>
    </main>
  </div>
</template>

<script>
import { ROLES } from '../../router/menuConfig';

const modules = {
  admin: ['用户 · 角色', '分类 · 公告', '日志 · 任务'],
  merchant: ['商品 · 秒杀', '订单 · 售后', '优惠券 · 报表'],
  customer: ['逛商品 · 领券', '购物车 · 订单', '售后 · 评价']
};

export default {
  name: 'RolePortal',
  data() { return { modules }; },
  computed: { roles() { return ROLES; } }
};
</script>

<style scoped>
.portal-page { position: relative; min-height: 100vh; overflow: hidden; box-sizing: border-box; padding: 28px 7vw 24px; color: #f8fbff; background: linear-gradient(175deg, #1e3054 0%, #152240 55%, #111b30 100%); background-color: #152240; font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; --ease: cubic-bezier(.25,.8,.35,1); }
.portal-page ::selection { background: rgba(150,232,218,.3); color: #fff; }
.portal-grid { position: absolute; inset: 0; opacity: .28; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 72px 72px; mask-image: linear-gradient(to bottom, #000, transparent 90%); }
.portal-orb { position: absolute; border-radius: 50%; filter: blur(2px); pointer-events: none; }
.portal-orb--one { width: 42vw; height: 42vw; max-width: 620px; max-height: 620px; top: -28%; left: -12%; background: radial-gradient(circle, rgba(39,185,178,.3), transparent 68%); }
.portal-orb--two { width: 48vw; height: 48vw; max-width: 700px; max-height: 700px; right: -22%; bottom: -36%; background: radial-gradient(circle, rgba(119,86,194,.42), transparent 67%); }
.portal-header { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 20px; max-width: 1240px; margin: 0 auto; }
.brand-lockup { display: inline-flex; align-items: center; gap: 11px; color: #f8fbff; text-decoration: none; }
.brand-mark { width: 42px; height: 42px; object-fit: contain; border-radius: 12px; background: #fff; box-shadow: 0 6px 16px rgba(0,0,0,.28); transition: transform .3s var(--ease); }
.brand-lockup:hover .brand-mark { transform: scale(1.05) rotate(-2deg); }
.brand-copy { display: flex; flex-direction: column; gap: 2px; }
.brand-copy strong { font-family: 'Trebuchet MS', 'Microsoft YaHei', sans-serif; font-size: 19px; letter-spacing: .02em; }
.brand-copy small { color: #afc0d4; font-size: 11px; }
.portal-nav { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
.nav-link { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 0 14px; box-sizing: border-box; border: 1px solid rgba(255,255,255,.13); border-radius: 12px; color: #d7e3f1; font-size: 13px; text-decoration: none; background: rgba(255,255,255,.04); backdrop-filter: blur(6px); transition: color .25s var(--ease), border-color .25s var(--ease), background .25s var(--ease), transform .25s var(--ease), box-shadow .25s var(--ease); }
.nav-link i { color: #96e8da; font-size: 16px; transition: transform .25s var(--ease), text-shadow .25s var(--ease); }
.nav-link:hover { color: #f8fbff; border-color: rgba(255,255,255,.36); background: rgba(255,255,255,.1); transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,.28); }
.nav-link:hover i { transform: translateY(-1px); text-shadow: 0 0 12px rgba(150,232,218,.6); }
.portal-page a:focus-visible { outline: 2px solid #96e8da; outline-offset: 4px; }
.portal-main { position: relative; z-index: 1; display: flex; flex-direction: column; justify-content: center; max-width: 1240px; min-height: calc(100vh - 110px); margin: 0 auto; padding: 50px 0 24px; box-sizing: border-box; }
.role-section { position: relative; }
.section-heading { display: flex; align-items: baseline; flex-wrap: wrap; gap: 10px 20px; margin-bottom: 24px; }
.section-title { margin: 0; color: #f8fbff; font-size: 24px; font-weight: 600; letter-spacing: .02em; }
.section-hint { color: #afc0d4; font-size: 13px; }
.role-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.role-card { --role-ink: #cbb9ff; position: relative; display: flex; flex-direction: column; min-width: 0; min-height: 320px; padding: 27px 28px 25px; box-sizing: border-box; border: 1px solid rgba(255,255,255,.19); border-radius: 6px 6px 20px 6px; color: #f8fbff; background: rgba(13,25,44,.49); text-decoration: none; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%); transition: border-color .25s var(--ease), background .25s var(--ease), transform .25s var(--ease), filter .25s var(--ease); }
.role-card::before { content: ''; position: absolute; top: 0; left: 28px; width: 45px; height: 3px; border-radius: 999px; background: linear-gradient(90deg, var(--role-ink), transparent); box-shadow: 0 0 10px var(--role-ink); transform-origin: left center; transition: width .3s var(--ease); }
.role-card::after { content: ''; position: absolute; top: 0; bottom: 0; left: -60%; width: 42%; background: linear-gradient(105deg, transparent, rgba(255,255,255,.08), transparent); transform: skewX(-18deg); transition: left .55s var(--ease); pointer-events: none; }
.role-card--merchant { --role-ink: #ffd094; }
.role-card--customer { --role-ink: #96e8da; }
.role-card:hover { border-color: var(--role-ink); background: rgba(24,38,60,.85); transform: translateY(-4px); filter: drop-shadow(0 14px 26px rgba(0,0,0,.32)); }
.role-card:hover::before { width: 76px; }
.role-card:hover::after { left: 125%; }
.role-card:focus-visible { outline: 2px solid var(--role-ink); outline-offset: 4px; }
.card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 23px; }
.role-icon { display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; border: 1px solid var(--role-ink); border-radius: 14px; color: var(--role-ink); font-size: 24px; background: var(--accent-soft); transition: transform .25s var(--ease), box-shadow .25s var(--ease); }
.role-card:hover .role-icon { transform: scale(1.06); box-shadow: 0 10px 22px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.22); }
.card-direction { color: var(--role-ink); font-size: 18px; opacity: .75; transition: transform .25s var(--ease), opacity .25s var(--ease); }
.role-card:hover .card-direction { transform: translate(3px,-3px); opacity: 1; }
.card-identity { display: flex; flex-direction: column; gap: 5px; }
.card-identity strong { font-size: 27px; font-weight: 600; letter-spacing: -.04em; }
.card-identity small { color: #afc0d4; font-size: 13px; }
.card-modules { display: flex; flex-wrap: wrap; gap: 8px; margin: 23px 0 25px; }
.card-modules span { padding: 7px 10px; border: 1px solid rgba(255,255,255,.12); border-radius: 6px; color: #dce5f0; font-size: 12px; white-space: nowrap; background: rgba(255,255,255,.04); }
.card-action { display: flex; align-items: center; gap: 8px; margin-top: auto; padding-top: 15px; border-top: 1px solid rgba(255,255,255,.14); color: var(--role-ink); font-size: 14px; font-weight: 600; transition: opacity .2s var(--ease); }
.card-action i { transition: transform .25s var(--ease); }
.role-card:hover .card-action i { transform: translateX(4px); }
.portal-register { align-self: flex-end; margin-top: 25px; color: #afc0d4; font-size: 13px; }
.portal-register a { display: inline-flex; align-items: center; gap: 5px; min-height: 44px; margin-left: 5px; color: #ffd094; font-weight: 600; text-decoration: none; }
.portal-register a i { transition: transform .25s var(--ease); }
.portal-register a:hover { text-decoration: underline; text-underline-offset: 4px; }
.portal-register a:hover i { transform: translateX(3px); }
@media (max-width: 900px) {
  .portal-page { padding: 22px 24px; }
  .portal-main { min-height: auto; padding: 80px 0 48px; }
  .role-list { gap: 12px; }
  .role-card { min-height: 335px; padding: 23px 18px; }
  .role-card::before { left: 18px; }
}
@media (max-width: 700px) {
  .portal-header { flex-wrap: wrap; }
  .portal-nav { justify-content: flex-start; width: 100%; }
  .portal-main { padding-top: 60px; }
  .role-list { grid-template-columns: 1fr; gap: 13px; }
  .role-card { min-height: 0; padding: 19px 22px; }
  .role-card::before { left: 22px; }
  .card-top { margin-bottom: 12px; }
  .role-icon { width: 42px; height: 42px; font-size: 20px; }
  .card-identity strong { font-size: 24px; }
  .card-modules { margin: 16px 0; }
}
@media (max-width: 560px) {
  .portal-page { padding: 18px 16px; }
  .brand-copy small { display: none; }
  .portal-nav { gap: 6px; }
  .nav-link { padding: 0 10px; font-size: 12px; }
  .nav-link i { font-size: 14px; }
  .portal-main { padding-top: 60px; }
  .section-title { font-size: 21px; }
  .card-modules span { font-size: 11px; }
  .portal-register { align-self: flex-start; }
}
@media (prefers-reduced-motion: reduce) {
  .portal-page a, .card-action i, .brand-mark, .nav-link, .nav-link i, .role-card, .role-icon, .card-direction, .role-card::after, .portal-register a i { transition: none; }
  .role-card:hover { transform: none; }
}
</style>
