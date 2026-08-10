<template>
  <div class="login-container">
    <div class="bg-decorations">
      <span class="blob blob-1" />
      <span class="blob blob-2" />
      <span class="blob blob-3" />
    </div>
    <div class="top-nav">
      <router-link to="/browse" class="customer-entry">
        <i class="el-icon-shopping-bag-1" />
        随便逛逛
      </router-link>
      <router-link :to="{ path: '/customer', query: { from: 'login' } }" class="customer-entry">
        <i class="el-icon-service" />
        客服
      </router-link>
      <router-link to="/personal-work" class="customer-entry">
        <i class="el-icon-notebook-2" />
        个人工作
      </router-link>
    </div>
    <div class="login-panel">
      <div class="panel-left">
        <div class="left-brand">
          <img src="../../assets/logo.png" alt="go购够" class="brand-mark" />
          <div class="brand-text">
            <div class="brand-name">go购够商城</div>
            <div class="brand-slogan">好物随心购，新鲜每一天</div>
          </div>
        </div>
        <div v-if="notices.length" class="left-notices">
          <div class="notice-head"><i class="el-icon-bell" /> 系统公告</div>
          <el-carousel
            height="200px"
            :interval="4000"
            :autoplay="true"
            :pause-on-hover="true"
            :loop="true"
            arrow="never"
            indicator-position="outside"
            class="notice-carousel"
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
        </div>
      </div>
      <div class="panel-right">
        <div class="brand">
          <h2 class="brand-title">欢迎回来</h2>
          <p class="brand-subtitle">登录你的账户以继续</p>
        </div>
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          label-position="top"
          class="login-form auth-form"
          @submit.native.prevent="handleLogin"
        >
          <el-form-item label="用户名" prop="uName" class="field">
            <el-input v-model="loginForm.uName" placeholder="请输入用户名" prefix-icon="el-icon-user" @keyup.enter.native="handleLogin" />
          </el-form-item>
          <el-form-item label="密码" prop="password" class="field">
            <el-input
              v-model="loginForm.password"
              type="password"
              show-password
              placeholder="请输入密码"
              prefix-icon="el-icon-lock"
              @keyup.enter.native="handleLogin"
            />
          </el-form-item>
          <el-form-item class="action">
            <el-button
              type="primary"
              :loading="loading"
              class="auth-submit-btn"
              @click="handleLogin"
            >登录</el-button>
          </el-form-item>
          <div class="auth-footer">
            <router-link to="/forgot-password" class="auth-link link--forgot">忘记密码？</router-link>
            <span class="footer-sep">|</span>
            还没有账号？
            <router-link to="/register" class="auth-link">去注册</router-link>
          </div>
        </el-form>
      </div>
    </div>

    <el-dialog :title="current.title" :visible.sync="detailVisible" width="680px" top="8vh" custom-class="notice-dialog">
      <div class="notice-detail" v-html="current.content"></div>
    </el-dialog>
  </div>
</template>

<script>
import { login } from '../../api/user';
import { getPublishedNotices } from '../../api/notice';
import { landingFor } from '../../router/menuConfig';

export default {
  name: 'Login',
  data() {
    return {
      loginForm: {
        uName: '',
        password: ''
      },
      loginRules: {
        uName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loading: false,
      notices: [],
      current: {},
      detailVisible: false
    };
  },
  created() {
    getPublishedNotices()
      .then(res => { this.notices = res.dataList || []; })
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
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (!valid) return;
        this.loading = true;
        login(this.loginForm)
          .then(res => {
            const result = res.daoResult || {};
            const token = result.token;
            const user = result.user || {};
            this.$store.commit('SET_TOKEN', token);
            this.$store.commit('SET_USER', user);
            this.$message.success('登录成功');
            this.$router.push(landingFor(user.uType));
          })
          .catch(() => {})
          .finally(() => {
            this.loading = false;
          });
      });
    }
  }
};
</script>

<style scoped>
.login-container {
  position: relative;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--gradient-topbar);
  overflow: hidden;
}
.bg-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.top-nav {
  position: absolute;
  top: 24px;
  right: 32px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
}
.customer-entry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border-radius: 999px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(8px);
  transition: background 0.2s, transform 0.15s;
}
.customer-entry:hover {
  background: rgba(255, 255, 255, 0.28);
  transform: translateY(-1px);
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
}
.blob-1 {
  width: 320px;
  height: 320px;
  background: #7f9cf0;
  top: -80px;
  left: -60px;
}
.blob-2 {
  width: 380px;
  height: 380px;
  background: #9b6cff;
  bottom: -120px;
  right: -80px;
}
.blob-3 {
  width: 240px;
  height: 240px;
  background: #2dd4bf;
  top: 40%;
  right: 20%;
  opacity: 0.25;
}
.login-panel {
  position: relative;
  z-index: 1;
  display: flex;
  width: 900px;
  max-width: calc(100vw - 48px);
  min-height: 520px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.4);
}
.panel-left {
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  padding: 36px 32px 28px;
  background: linear-gradient(160deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}
.left-brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 26px;
}
.brand-mark {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.brand-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}
.brand-slogan {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.8;
}
.left-notices {
  flex: 1;
  min-height: 0;
}
.notice-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.92;
}
.carousel-slide {
  height: 100%;
  background-size: cover;
  background-position: center;
  cursor: pointer;
  border-radius: 10px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
}
.carousel-mask {
  width: 100%;
  padding: 14px 18px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
  color: #fff;
}
.carousel-title {
  font-size: 16px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.carousel-time {
  font-size: 12px;
  opacity: 0.85;
  margin-top: 5px;
}
.panel-right {
  flex: 0 0 400px;
  padding: 48px 36px 32px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.brand {
  text-align: center;
  margin-bottom: 28px;
}
.brand-title {
  margin: 0 0 6px;
  color: #1f2733;
  font-size: 22px;
  font-weight: 600;
}
.brand-subtitle {
  margin: 0;
  color: #7a8694;
  font-size: 13px;
}
.login-form .field >>> .el-form-item__label {
  padding-bottom: 4px;
}
.action {
  margin-bottom: 8px;
}
.footer-sep {
  margin: 0 8px;
  color: #cbd5e0;
}
.link--forgot {
  color: #e8850e;
}
.link--forgot:hover {
  color: #cf6d0e;
}
.notice-detail {
  max-height: 62vh;
  overflow: auto;
  line-height: 1.75;
  color: #303133;
}
.notice-detail >>> img {
  max-width: 100%;
  border-radius: 4px;
}
@media (max-width: 768px) {
  .panel-left {
    display: none;
  }
  .panel-right {
    flex: 1 1 auto;
  }
}
</style>

<style>
.login-container .notice-carousel .el-carousel__indicators--outside button {
  background-color: rgba(255, 255, 255, 0.6);
}
.login-container .notice-carousel .el-carousel__indicator.is-active button {
  background-color: #fff;
}
</style>
