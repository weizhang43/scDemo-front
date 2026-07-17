<template>
  <div class="login-container">
    <div class="bg-decorations">
      <span class="blob blob-1" />
      <span class="blob blob-2" />
      <span class="blob blob-3" />
    </div>
    <div class="top-nav">
      <router-link :to="{ path: '/customer', query: { from: 'login' } }" class="customer-entry">
        <i class="el-icon-service" />
        客服
      </router-link>
    </div>
    <div class="login-card">
      <div class="brand">
        <div class="brand-mark">SC</div>
        <h2 class="brand-title">欢迎回来</h2>
        <p class="brand-subtitle">登录你的账户以继续</p>
      </div>
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        class="login-form"
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
            class="submit-btn"
            @click="handleLogin"
          >登录</el-button>
        </el-form-item>
        <div class="login-footer">
          <router-link to="/forgot-password" class="link link--forgot">忘记密码？</router-link>
          <span class="footer-sep">|</span>
          还没有账号？
          <router-link to="/register" class="link">去注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { login } from '../../api/user';

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
      loading: false
    };
  },
  methods: {
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
            this.$router.push('/products');
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
  background: linear-gradient(135deg, #4b6cb7 0%, #192841 100%);
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
.login-card {
  position: relative;
  z-index: 1;
  width: 400px;
  padding: 40px 36px 28px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.4);
}
.brand {
  text-align: center;
  margin-bottom: 28px;
}
.brand-mark {
  width: 56px;
  height: 56px;
  margin: 0 auto 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 700;
  font-size: 22px;
  letter-spacing: 1px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(118, 75, 162, 0.4);
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
  color: #4a5568;
  font-weight: 500;
  padding-bottom: 4px;
}
.login-form .field >>> .el-input__inner {
  border-radius: 10px;
  height: 44px;
  line-height: 44px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.login-form .field >>> .el-input__inner:hover {
  border-color: #cbd5e0;
}
.login-form .field >>> .el-input__inner:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}
.login-form .field >>> .el-input__prefix {
  left: 10px;
  color: #a0aec0;
}
.login-form .field >>> .el-input__inner {
  padding-left: 36px;
}
.action {
  margin-bottom: 8px;
}
.submit-btn {
  width: 100%;
  height: 44px;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 20px rgba(118, 75, 162, 0.35);
  transition: transform 0.15s, box-shadow 0.2s, filter 0.2s;
}
.submit-btn:hover {
  filter: brightness(1.05);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(118, 75, 162, 0.45);
}
.submit-btn:active {
  transform: translateY(0);
}
.login-footer {
  text-align: center;
  font-size: 13px;
  color: #7a8694;
}
.footer-sep {
  margin: 0 8px;
  color: #cbd5e0;
}
.link {
  color: #667eea;
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s;
}
.link:hover {
  color: #764ba2;
  text-decoration: underline;
}
.link--forgot {
  color: #e8850e;
}
.link--forgot:hover {
  color: #cf6d0e;
}
</style>
