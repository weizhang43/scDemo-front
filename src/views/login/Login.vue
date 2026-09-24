<template>
  <div :class="['login-container', `login-container--${role.key}`]">
    <div class="bg-decorations" aria-hidden="true">
      <span class="grid-line grid-line--one" />
      <span class="grid-line grid-line--two" />
      <span class="signal signal--one" />
      <span class="signal signal--two" />
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
          <el-carousel height="154px" :interval="4000" :autoplay="true" :pause-on-hover="true" :loop="true" arrow="never" indicator-position="outside" class="notice-carousel">
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
        <div class="role-badge"><i :class="role.icon" aria-hidden="true" />{{ role.label }}</div>
        <div class="brand"><p class="form-kicker">SECURE ACCESS / {{ String(role.uType).padStart(2, '0') }}</p><h2 class="brand-title">欢迎回来</h2><p class="brand-subtitle">{{ role.subtitle }}</p></div>
        <el-form ref="loginForm" :model="loginForm" :rules="loginRules" label-position="top" class="login-form auth-form" @submit.native.prevent="handleLogin">
          <el-form-item label="用户名" prop="uName" class="field"><el-input v-model="loginForm.uName" autocomplete="username" placeholder="请输入用户名" prefix-icon="el-icon-user" /></el-form-item>
          <el-form-item label="密码" prop="password" class="field"><el-input v-model="loginForm.password" type="password" autocomplete="current-password" show-password placeholder="请输入密码" prefix-icon="el-icon-lock" /></el-form-item>
          <div class="user-type-row">
            <div class="user-type-label"><span>用户类型</span><small>选择你的登录身份</small></div>
            <div class="user-type-options" role="tablist" aria-label="用户类型">
              <button v-for="item in roles" :key="item.key" type="button" class="user-type-option" :class="{ 'is-active': item.key === role.key }" :style="{ '--type-accent': item.accent, '--type-soft': item.accentSoft }" role="tab" :aria-selected="item.key === role.key" @click="selectRole(item)">
                <i :class="item.icon" aria-hidden="true" /><span>{{ item.label }}</span>
              </button>
            </div>
          </div>
          <el-form-item class="action"><el-button native-type="submit" type="primary" :loading="loading" class="auth-submit-btn">{{ loading ? '正在验证…' : '登录' }}</el-button></el-form-item>
          <div class="auth-footer"><router-link to="/forgot-password" class="auth-link link--forgot">忘记密码？</router-link><template v-if="role.canRegister"><span class="footer-sep">|</span>还没有账号？<router-link :to="{ path: '/register', query: { uType: role.uType } }" class="auth-link">去注册</router-link></template></div>
        </el-form>
        <div class="form-privacy"><i class="el-icon-lock" aria-hidden="true" />你的登录信息将被安全保护</div>
      </section>
    </main>

    <el-dialog :title="currentNotice.title" :visible.sync="detailVisible" width="680px" top="8vh" custom-class="notice-dialog"><div class="notice-detail" v-html="currentNotice.content"></div></el-dialog>
  </div>
</template>

<script>
import { login } from '../../api/user';
import { getMyPerms } from '../../api/userRole';
import { getPublishedNotices } from '../../api/notice';
import { landingFor, roleByKey, ROLES } from '../../router/menuConfig';

export default {
  name: 'Login',
  data() {
    return {
      loginForm: { uName: '', password: '' },
      loginRules: { uName: [{ required: true, message: '请输入用户名', trigger: 'blur' }], password: [{ required: true, message: '请输入密码', trigger: 'blur' }] },
      loading: false,
      notices: [],
      currentNotice: {},
      detailVisible: false
    };
  },
  computed: {
    roles() { return ROLES; },
    role() { return roleByKey(this.$route.params.role) || ROLES[0]; }
  },
  created() {
    if (!roleByKey(this.$route.params.role)) { this.$router.replace('/portal'); return; }
    if (!window.matchMedia('(min-width: 769px)').matches) return;
    getPublishedNotices().then(res => { this.notices = res.dataList || []; }).catch(() => {});
  },
  methods: {
    selectRole(role) {
      if (role.key !== this.role.key) this.$router.push(`/login/${role.key}`);
    },
    slideStyle(n) { return n.coverImage ? { backgroundImage: `url(${n.coverImage})` } : { background: 'linear-gradient(135deg,#182a46,#27486b)' }; },
    openNotice(notice) {
      this.currentNotice = { ...notice, content: this.sanitizeNoticeContent(notice.content) };
      this.detailVisible = true;
    },
    sanitizeNoticeContent(content) {
      if (!content) return '';
      const parsedDocument = new DOMParser().parseFromString(String(content), 'text/html');
      parsedDocument.querySelectorAll('script,style,iframe,object,embed,form,base,meta,link,svg,math,template').forEach(node => node.remove());
      parsedDocument.body.querySelectorAll('*').forEach(node => {
        Array.from(node.attributes).forEach(attribute => {
          const name = attribute.name.toLowerCase();
          const value = attribute.value.trim().toLowerCase();
          const isUrl = ['href', 'src', 'action', 'xlink:href'].indexOf(name) !== -1;
          const isAllowedUrl = /^(https?:\/\/|\/|\.?\.\/)/.test(value);
          if (name.indexOf('on') === 0 || name === 'style' || name === 'srcdoc' || (isUrl && !isAllowedUrl)) {
            node.removeAttribute(attribute.name);
          }
        });
      });
      return parsedDocument.body.innerHTML;
    },
    handleLogin() {
      if (this.loading) return;
      this.$refs.loginForm.validate(valid => {
        if (!valid || this.loading) return;
        this.loading = true;
        login({ ...this.loginForm, uType: this.role.uType }).then(res => {
          const result = res.daoResult || {};
          this.$store.commit('SET_TOKEN', result.token);
          this.$store.commit('SET_USER', result.user || {});
          getMyPerms()
            .then(permRes => this.$store.commit('SET_PERMS', permRes.dataList || []))
            .catch(() => this.$store.commit('SET_PERMS', []))
            .then(() => {
              this.$message.success('登录成功');
              this.$router.push(landingFor((result.user || {}).uType));
            });
        }).catch(() => {}).finally(() => { this.loading = false; });
      });
    }
  }
};
</script>

<style scoped>
.login-container {
  --page-bg: linear-gradient(135deg, #10182f 0%, #1c2d52 52%, #493779 100%);
  --page-glow: rgba(142, 102, 224, 0.32);
  --line-color: rgba(173, 145, 255, 0.72);
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 88px 24px 40px;
  box-sizing: border-box;
  overflow: hidden;
  background: var(--page-bg);
}
.bg-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(circle at 12% 0%, var(--page-glow), transparent 32%),
    radial-gradient(circle at 88% 100%, rgba(255, 255, 255, 0.12), transparent 36%);
}
.grid-line {
  position: absolute;
  width: 42vw;
  height: 1px;
  background: var(--line-color);
  transform: rotate(-28deg);
  opacity: 0.7;
}
.grid-line--one { top: 18%; left: -10%; }
.grid-line--two { right: -8%; bottom: 14%; transform: rotate(28deg); }
.signal {
  position: absolute;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-signal, #e8850e);
  box-shadow: 0 0 0 7px var(--signal-soft, rgba(232, 133, 14, 0.12));
}
.signal--one { top: 30%; left: 12%; }
.signal--two { right: 16%; bottom: 26%; background: var(--accent-signal-alt, #0f9b8e); box-shadow: 0 0 0 7px var(--signal-soft-alt, rgba(15, 155, 142, 0.12)); }
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
  width: 920px;
  max-width: calc(100vw - 48px);
  min-height: 560px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.46);
  border-radius: var(--radius-lg);
  box-shadow: 0 28px 80px rgba(8, 15, 36, 0.3);
  animation: panel-in 0.45s ease both;
}
.login-panel::after {
  position: absolute;
  inset: 0;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: inherit;
  content: '';
  pointer-events: none;
}
@keyframes panel-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
.panel-left {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 30px 34px 24px;
  color: #fff;
  background: linear-gradient(160deg, rgba(11, 27, 54, 0.96), rgba(25, 45, 75, 0.98));
}
.left-kicker, .form-kicker, .message-label { margin: 0; color: #e7a14c; font-size: 10px; font-weight: 700; letter-spacing: 2px; }
.left-kicker { margin-bottom: 26px; color: #aebdca; }
.left-brand { display: flex; align-items: center; gap: 14px; padding-bottom: 22px; border-bottom: 1px solid rgba(255, 255, 255, 0.18); }
.brand-mark { width: 50px; height: 50px; object-fit: contain; border-radius: var(--radius-sm); background: #fff; }
.brand-name { font-size: 19px; font-weight: 700; letter-spacing: 1px; }
.brand-slogan { margin-top: 5px; color: #aebdca; font-size: 12px; }
.left-message { margin: 42px 0 28px; }
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
  flex: 0 0 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 56px 42px 34px;
  box-sizing: border-box;
  background: rgba(255, 253, 249, 0.98);
}
.panel-right::before { position: absolute; top: 0; right: 0; left: 0; height: 4px; background: var(--accent); content: ''; }
.back-link { position: absolute; top: 22px; left: 28px; color: #748091; font-size: 12px; text-decoration: none; }
.back-link:hover, .back-link:focus { color: var(--accent); outline: none; }
.role-badge { position: absolute; top: 20px; right: 28px; padding: 6px 12px; border-radius: 999px; color: var(--accent); background: var(--accent-soft); font-size: 12px; font-weight: 700; }
.brand { margin-bottom: 30px; }
.form-kicker { color: var(--accent); margin-bottom: 10px; }
.brand-title { margin: 0 0 7px; color: #20242b; font-size: 26px; letter-spacing: 1px; }
.brand-subtitle { margin: 0; color: #7b8490; font-size: 13px; line-height: 1.6; }
.auth-form .el-form-item { margin-bottom: 20px; }
.user-type-row { margin: -2px 0 4px; }
.user-type-label { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 9px; color: #4a5568; font-size: 13px; font-weight: 600; }
.user-type-label small { color: #a0a8b1; font-size: 10px; font-weight: 400; }
.user-type-options { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
.user-type-option { display: inline-flex; align-items: center; justify-content: center; gap: 5px; min-width: 0; padding: 9px 5px; border: 1px solid #e1e4e7; border-radius: 8px; color: #7b8490; background: #fff; font-size: 12px; cursor: pointer; transition: .18s ease; }
.user-type-option:hover, .user-type-option:focus-visible { border-color: var(--type-accent); color: var(--type-accent); outline: none; }
.user-type-option.is-active { border-color: var(--type-accent); color: var(--type-accent); background: var(--type-soft); box-shadow: 0 0 0 2px var(--type-soft); font-weight: 600; }
.user-type-option i { font-size: 14px; }
.action { margin-top: 18px; margin-bottom: 10px !important; }
.panel-right >>> .auth-submit-btn { background: var(--accent); border-color: var(--accent); }
.panel-right >>> .auth-submit-btn:hover, .panel-right >>> .auth-submit-btn:focus { background: var(--accent); border-color: var(--accent); filter: brightness(1.08); }
.footer-sep { margin: 0 8px; color: #d5d8da; }
.link--forgot { color: var(--accent); }
.form-privacy { margin-top: 30px; color: #a1a7ad; text-align: center; font-size: 11px; }
.notice-detail { max-height: 62vh; overflow: auto; color: #303133; line-height: 1.75; }
.notice-detail >>> img { max-width: 100%; }
@media (prefers-reduced-motion: reduce) { .login-panel, .customer-entry { animation: none; transition: none; } }
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
  --page-bg: linear-gradient(135deg, #10182f 0%, #1b2c55 50%, #493779 100%);
  --page-glow: rgba(142, 102, 224, 0.34);
  --line-color: rgba(173, 145, 255, 0.72);
  --accent-signal: #ad91ff;
  --accent-signal-alt: #e7a14c;
  --signal-soft: rgba(173, 145, 255, 0.14);
  --signal-soft-alt: rgba(231, 161, 76, 0.13);
}
.login-container--admin .panel-left { background: linear-gradient(155deg, #121c3b 0%, #2a2856 100%); }
.login-container--admin .panel-left .left-kicker,
.login-container--admin .panel-left .message-label { color: #c2b0ff; }
.login-container--admin .panel-left .left-message h1 em { color: #c2b0ff; }
.login-container--admin .panel-right { --accent: #764ba2; --accent-soft: rgba(118, 75, 162, 0.13); }
.login-container--admin .role-badge { color: #684092; background: rgba(118, 75, 162, 0.12); }
.login-container--admin .form-privacy { color: #8990a6; }
.login-container--admin .panel-right .auth-submit-btn { box-shadow: 0 10px 20px rgba(118, 75, 162, 0.2); }
.login-container--admin .panel-right .auth-submit-btn:hover,
.login-container--admin .panel-right .auth-submit-btn:focus { box-shadow: 0 12px 24px rgba(118, 75, 162, 0.3); }
.login-container--merchant {
  --page-bg: linear-gradient(135deg, #142238 0%, #1f405c 50%, #80512d 100%);
  --page-glow: rgba(232, 133, 14, 0.28);
  --line-color: rgba(244, 181, 93, 0.72);
  --accent-signal: #f3b65d;
  --accent-signal-alt: #83c9d3;
  --signal-soft: rgba(243, 182, 93, 0.15);
  --signal-soft-alt: rgba(131, 201, 211, 0.13);
}
.login-container--merchant .panel-left { background: linear-gradient(155deg, #15263d 0%, #29465a 100%); }
.login-container--merchant .panel-left .left-kicker,
.login-container--merchant .panel-left .message-label { color: #f3b65d; }
.login-container--merchant .panel-left .left-message h1 em { color: #f3b65d; }
.login-container--merchant .panel-right { --accent: #e8850e; --accent-soft: rgba(232, 133, 14, 0.13); }
.login-container--merchant .role-badge { color: #bc6908; background: rgba(232, 133, 14, 0.13); }
.login-container--merchant .form-privacy { color: #938d83; }
.login-container--merchant .panel-right .auth-submit-btn { box-shadow: 0 10px 20px rgba(232, 133, 14, 0.2); }
.login-container--merchant .panel-right .auth-submit-btn:hover,
.login-container--merchant .panel-right .auth-submit-btn:focus { box-shadow: 0 12px 24px rgba(232, 133, 14, 0.3); }
.login-container--customer {
  --page-bg: linear-gradient(135deg, #083b4a 0%, #0d6570 48%, #159a91 100%);
  --page-glow: rgba(93, 231, 207, 0.24);
  --line-color: rgba(114, 226, 208, 0.72);
  --accent-signal: #72e2d0;
  --accent-signal-alt: #83c9d3;
  --signal-soft: rgba(114, 226, 208, 0.15);
  --signal-soft-alt: rgba(131, 201, 211, 0.13);
}
.login-container--customer .panel-left { background: linear-gradient(155deg, #073342 0%, #0b5360 100%); }
.login-container--customer .panel-left .left-kicker,
.login-container--customer .panel-left .message-label { color: #72e2d0; }
.login-container--customer .panel-left .left-message h1 em { color: #70e1d0; }
.login-container--customer .panel-right { --accent: #0f9b8e; --accent-soft: rgba(15, 155, 142, 0.13); }
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
