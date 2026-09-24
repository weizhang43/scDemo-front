<template>
  <div class="portal-page">
    <div class="portal-orb portal-orb--one" aria-hidden="true" />
    <div class="portal-orb portal-orb--two" aria-hidden="true" />
    <div class="portal-grid" aria-hidden="true" />

    <header class="portal-header">
      <router-link to="/portal" class="brand-lockup">
        <img src="../../assets/logo.png" alt="go购购" class="brand-mark" />
        <span class="brand-copy"><strong>go购购</strong><small>好物随心购，新鲜每一天</small></span>
      </router-link>
      <nav class="portal-nav" aria-label="快捷入口">
        <router-link to="/browse" class="nav-link"><i class="el-icon-shopping-bag-1" />逛商城</router-link>
        <router-link :to="{ path: '/customer', query: { from: 'portal' } }" class="nav-link"><i class="el-icon-service" />联系客服</router-link>
        <router-link to="/personal-work" class="nav-link"><i class="el-icon-notebook-2" />个人空间</router-link>
      </nav>
    </header>

    <main class="portal-main">
      <section class="portal-intro">
        <div class="eyebrow"><span />GO / GOU / GOU</div>
        <h1>从今天开始，<br /><em>把好生活带回家。</em></h1>
        <p class="intro-copy">一个入口，连接平台管理、店铺经营与日常购物。选择你的身份，进入专属工作台。</p>
        <div class="intro-stats">
          <div><strong>3</strong><span>种身份入口</span></div>
          <div><strong>24h</strong><span>在线服务</span></div>
          <div><strong>100%</strong><span>安全登录</span></div>
        </div>
        <router-link to="/browse" class="shop-entry"><i class="el-icon-arrow-right" />先逛逛商城</router-link>
      </section>

      <section class="role-panel" aria-labelledby="role-title">
        <div class="panel-heading">
          <div><span class="panel-kicker">WELCOME BACK</span><h2 id="role-title">选择登录身份</h2></div>
          <span class="panel-step">01 / 01</span>
        </div>
        <div class="role-list">
          <button
            v-for="(role, index) in roles"
            :key="role.key"
            type="button"
            class="role-card"
            :style="{ '--accent': role.accent, '--accent-soft': role.accentSoft }"
            @click="goLogin(role)"
          >
            <span class="role-index">0{{ index + 1 }}</span>
            <span class="role-icon"><i :class="role.icon" /></span>
            <span class="role-content"><strong>{{ role.label }}</strong><small>{{ role.desc }}</small></span>
            <i class="el-icon-arrow-right role-arrow" aria-hidden="true" />
          </button>
        </div>
        <div class="panel-footer"><span>还没有账号？</span><router-link to="/register">立即注册</router-link><span class="footer-note"><i class="el-icon-lock" /> 安全认证</span></div>
      </section>
    </main>

    <footer class="portal-footer"><span>SC · 2026</span><span>STAY CURIOUS, KEEP MOVING</span></footer>
  </div>
</template>

<script>
import { ROLES } from '../../router/menuConfig';

export default {
  name: 'RolePortal',
  computed: { roles() { return ROLES; } },
  methods: { goLogin(role) { this.$router.push(`/login/${role.key}`); } }
};
</script>

<style scoped>
.portal-page { position: relative; min-height: 100vh; overflow: hidden; box-sizing: border-box; padding: 28px 7vw 24px; color: #f8fbff; background: #101b30; }
.portal-grid { position: absolute; inset: 0; opacity: .28; pointer-events: none; background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.035) 1px, transparent 1px); background-size: 72px 72px; mask-image: linear-gradient(to bottom, #000, transparent 90%); }
.portal-orb { position: absolute; border-radius: 50%; filter: blur(2px); pointer-events: none; }
.portal-orb--one { width: 42vw; height: 42vw; max-width: 620px; max-height: 620px; top: -28%; left: -12%; background: radial-gradient(circle, rgba(39,185,178,.3), transparent 68%); }
.portal-orb--two { width: 48vw; height: 48vw; max-width: 700px; max-height: 700px; right: -22%; bottom: -36%; background: radial-gradient(circle, rgba(119,86,194,.42), transparent 67%); }
.portal-header { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; max-width: 1240px; margin: 0 auto; }
.brand-lockup { display: inline-flex; align-items: center; gap: 12px; color: #fff; text-decoration: none; }
.brand-mark { width: 42px; height: 42px; object-fit: contain; border-radius: 12px; background: #fff; }
.brand-copy { display: flex; flex-direction: column; gap: 3px; }
.brand-copy strong { font-size: 18px; letter-spacing: .08em; }
.brand-copy small { color: #9eabbf; font-size: 11px; }
.portal-nav { display: flex; gap: 6px; }
.nav-link { display: inline-flex; align-items: center; gap: 7px; padding: 9px 13px; border: 1px solid transparent; border-radius: 999px; color: #b8c2d1; font-size: 13px; text-decoration: none; transition: .2s ease; }
.nav-link:hover, .nav-link:focus-visible { color: #fff; border-color: rgba(255,255,255,.18); background: rgba(255,255,255,.08); outline: none; }
.portal-main { position: relative; z-index: 1; display: grid; grid-template-columns: minmax(0, 1fr) minmax(400px, 520px); gap: clamp(56px, 9vw, 150px); align-items: center; max-width: 1240px; min-height: calc(100vh - 150px); margin: 0 auto; }
.portal-intro { padding: 36px 0; }
.eyebrow, .panel-kicker { display: flex; align-items: center; gap: 9px; color: #73d7cc; font-size: 11px; font-weight: 700; letter-spacing: .18em; }
.eyebrow span { width: 22px; height: 2px; background: #73d7cc; }
.portal-intro h1 { margin: 25px 0 20px; font-size: clamp(40px, 5vw, 70px); line-height: 1.1; letter-spacing: -.04em; font-weight: 600; }
.portal-intro h1 em { color: #f3bd69; font-style: normal; }
.intro-copy { max-width: 430px; margin: 0; color: #a9b5c6; font-size: 15px; line-height: 1.9; }
.intro-stats { display: flex; gap: 34px; margin: 42px 0 38px; }
.intro-stats div { display: flex; flex-direction: column; gap: 5px; }
.intro-stats strong { color: #f8fbff; font-size: 22px; font-weight: 600; }
.intro-stats span { color: #8695aa; font-size: 11px; }
.shop-entry { display: inline-flex; align-items: center; gap: 8px; color: #f3bd69; font-size: 13px; font-weight: 600; text-decoration: none; }
.shop-entry:hover { color: #fff; }
.role-panel { box-sizing: border-box; padding: 30px; border: 1px solid rgba(255,255,255,.16); border-radius: 24px; background: rgba(255,255,255,.075); box-shadow: 0 30px 90px rgba(0,0,0,.24); backdrop-filter: blur(22px); }
.panel-heading { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
.panel-kicker { color: #8594a9; font-size: 10px; }
.panel-heading h2 { margin: 8px 0 0; color: #fff; font-size: 25px; font-weight: 600; letter-spacing: -.02em; }
.panel-step { color: #77879d; font-size: 11px; letter-spacing: .1em; }
.role-list { display: flex; flex-direction: column; gap: 10px; }
.role-card { position: relative; display: flex; align-items: center; width: 100%; padding: 15px 16px; box-sizing: border-box; border: 1px solid rgba(255,255,255,.12); border-radius: 15px; color: #fff; text-align: left; background: rgba(10,20,38,.32); cursor: pointer; transition: .22s ease; }
.role-card:hover, .role-card:focus-visible { transform: translateX(5px); border-color: var(--accent); background: var(--accent-soft); outline: none; }
.role-index { width: 27px; color: #718096; font-size: 10px; }
.role-icon { display: inline-flex; align-items: center; justify-content: center; width: 42px; height: 42px; margin-right: 14px; border-radius: 12px; color: #fff; font-size: 19px; background: var(--accent); box-shadow: 0 8px 18px rgba(0,0,0,.17); }
.role-content { display: flex; flex-direction: column; gap: 5px; }
.role-content strong { font-size: 15px; font-weight: 600; }
.role-content small { color: #9eabbd; font-size: 12px; }
.role-arrow { margin-left: auto; color: #8290a3; font-size: 16px; transition: .2s; }
.role-card:hover .role-arrow { color: #fff; transform: translateX(3px); }
.panel-footer { display: flex; align-items: center; gap: 5px; margin-top: 20px; color: #8593a5; font-size: 12px; }
.panel-footer a { color: #f3bd69; text-decoration: none; }
.panel-footer a:hover { text-decoration: underline; }
.footer-note { display: inline-flex; align-items: center; gap: 4px; margin-left: auto; color: #728197; font-size: 11px; }
.portal-footer { position: relative; z-index: 1; display: flex; justify-content: space-between; max-width: 1240px; margin: 0 auto; color: #65748a; font-size: 10px; letter-spacing: .16em; }
@media (max-width: 900px) { .portal-page { padding: 22px 24px; } .portal-main { grid-template-columns: 1fr; gap: 20px; min-height: auto; padding: 70px 0 60px; } .portal-intro { padding: 0; } .portal-intro h1 { margin-top: 18px; font-size: 48px; } .intro-stats { margin: 28px 0; } .role-panel { max-width: 620px; } }
@media (max-width: 560px) { .portal-page { padding: 18px 16px; } .portal-nav .nav-link { padding: 7px; font-size: 0; } .portal-nav .nav-link i { font-size: 16px; } .brand-copy small { display: none; } .portal-main { padding-top: 52px; } .portal-intro h1 { font-size: 40px; } .intro-copy { font-size: 14px; } .intro-stats { gap: 20px; } .role-panel { padding: 20px 16px; border-radius: 18px; } .portal-footer { font-size: 9px; } }
</style>
