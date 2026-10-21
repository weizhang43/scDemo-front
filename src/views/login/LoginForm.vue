<template>
  <div class="login-form-body">
    <div class="role-badge"><i :class="role.icon" aria-hidden="true" />{{ role.label }}</div>
    <div class="brand">
      <p class="form-kicker">SECURE ACCESS / {{ String(role.uType).padStart(2, '0') }}</p>
      <h2 class="brand-title">欢迎回来</h2>
      <p class="brand-subtitle">{{ role.subtitle }}</p>
    </div>
    <el-form ref="form" :model="loginForm" :rules="loginRules" label-position="top" class="login-form auth-form" @submit.native.prevent="handleLogin">
      <el-form-item label="用户名" prop="uName" class="field"><el-input v-model="loginForm.uName" autocomplete="username" placeholder="请输入用户名" prefix-icon="el-icon-user" /></el-form-item>
      <el-form-item label="密码" prop="password" class="field"><el-input v-model="loginForm.password" type="password" autocomplete="current-password" show-password placeholder="请输入密码" prefix-icon="el-icon-lock" /></el-form-item>
      <el-form-item class="action"><el-button native-type="submit" type="primary" :loading="loading" class="auth-submit-btn">{{ loading ? '正在验证…' : '登录' }}</el-button></el-form-item>
      <div class="auth-footer"><router-link to="/forgot-password" class="auth-link link--forgot">忘记密码？</router-link><template v-if="role.canRegister"><span class="footer-sep">|</span>还没有账号？<router-link :to="{ path: '/register', query: { uType: role.uType } }" class="auth-link">去注册</router-link></template></div>
    </el-form>
    <div class="form-privacy"><i class="el-icon-lock" aria-hidden="true" />你的登录信息将被安全保护</div>
  </div>
</template>

<script>
import { login } from '../../api/user';
import { getMyPerms } from '../../api/userRole';
import { landingFor } from '../../router/menuConfig';

export default {
  name: 'LoginForm',
  props: {
    role: { type: Object, required: true }
  },
  data() {
    return {
      loginForm: { uName: '', password: '' },
      loginRules: {
        uName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },
      loading: false
    };
  },
  methods: {
    handleLogin() {
      if (this.loading) return;
      this.$refs.form.validate(valid => {
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
.login-form-body { position: relative; }
.role-badge { display: inline-flex; align-items: center; gap: 6px; margin-bottom: 18px; padding: 6px 12px; border-radius: 999px; color: var(--accent); background: var(--accent-soft); font-size: 12px; font-weight: 700; }
.form-kicker { margin: 0 0 10px; color: var(--accent); font-size: 10px; font-weight: 700; letter-spacing: 2px; }
.brand { margin-bottom: 22px; }
.brand-title { margin: 0 0 7px; color: #20242b; font-size: 26px; letter-spacing: 1px; }
.brand-subtitle { margin: 0; color: #7b8490; font-size: 13px; line-height: 1.6; }
.auth-form .el-form-item { margin-bottom: 20px; }
.action { margin-top: 4px; margin-bottom: 10px !important; }
.footer-sep { margin: 0 8px; color: #d5d8da; }
.link--forgot { color: var(--accent); }
.form-privacy { margin-top: 20px; color: #a1a7ad; text-align: center; font-size: 11px; }
</style>
