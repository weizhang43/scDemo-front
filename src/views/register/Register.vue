<template>
  <div class="register-container">
    <div class="bg-decorations">
      <span class="blob blob-1" />
      <span class="blob blob-2" />
      <span class="blob blob-3" />
    </div>
    <div class="register-panel">
      <div class="panel-left">
        <div class="left-brand">
          <img src="../../assets/logo.png" alt="go购够" class="brand-mark" />
          <div class="brand-text">
            <div class="brand-name">go购够商城</div>
            <div class="brand-slogan">好物随心购，新鲜每一天</div>
          </div>
        </div>
        <div class="left-features">
          <div class="feature-item">
            <i class="el-icon-shopping-bag-1" />
            <div class="feature-text">
              <div class="feature-title">海量商品</div>
              <div class="feature-desc">好物云集，一站购齐</div>
            </div>
          </div>
          <div class="feature-item">
            <i class="el-icon-present" />
            <div class="feature-text">
              <div class="feature-title">超值优惠</div>
              <div class="feature-desc">限时秒杀，天天特惠</div>
            </div>
          </div>
          <div class="feature-item">
            <i class="el-icon-box" />
            <div class="feature-text">
              <div class="feature-title">安心售后</div>
              <div class="feature-desc">极速配送，售后无忧</div>
            </div>
          </div>
        </div>
        <div class="left-quote">
          <i class="el-icon-magic-stick" />
          注册即享会员专属权益
        </div>
      </div>
      <div class="panel-right">
        <router-link to="/login" class="login-link">
          已有账号？
          <span>去登录</span>
        </router-link>
        <div class="brand">
          <h2 class="brand-title">创建账户</h2>
          <p class="brand-subtitle">注册以开始使用商城系统</p>
        </div>
        <el-form
          ref="registerForm"
          :model="registerForm"
          :rules="registerRules"
          label-position="top"
          class="register-form auth-form"
          @submit.native.prevent="handleRegister"
        >
          <div class="register-scroll">
            <div class="section-label"><i class="el-icon-user" /> 基本信息</div>
          <div class="form-grid">
            <el-form-item label="用户名" prop="uName" class="field">
              <el-input v-model="registerForm.uName" placeholder="请输入用户名" prefix-icon="el-icon-user" />
            </el-form-item>
            <el-form-item label="密码" prop="password" class="field">
              <el-input
                v-model="registerForm.password"
                type="password"
                show-password
                placeholder="请输入密码"
                prefix-icon="el-icon-lock"
              />
            </el-form-item>
            <el-form-item label="确认密码" prop="confirmPassword" class="field">
              <el-input
                v-model="registerForm.confirmPassword"
                type="password"
                show-password
                placeholder="请再次输入密码"
                prefix-icon="el-icon-lock"
              />
            </el-form-item>
            <el-form-item label="用户姓名" prop="realName" class="field">
              <el-input v-model="registerForm.realName" placeholder="请输入真实姓名" prefix-icon="el-icon-postcard" />
            </el-form-item>
            <el-form-item label="手机号码" prop="phone" class="field">
              <el-input v-model="registerForm.phone" placeholder="请输入手机号码" prefix-icon="el-icon-mobile-phone" maxlength="11" />
            </el-form-item>
            <el-form-item label="邮箱" prop="email" class="field">
              <el-input v-model="registerForm.email" placeholder="请输入邮箱" prefix-icon="el-icon-message" />
            </el-form-item>
          </div>
          <div class="full-row">
            <el-form-item label="出生日期" prop="birthday" class="field date-field">
              <el-date-picker
                v-model="registerForm.birthday"
                type="date"
                value-format="yyyy-MM-dd"
                placeholder="请选择出生日期"
                style="width:100%;"
              />
            </el-form-item>
            <el-form-item label="邮箱验证码" prop="emailCode" class="field code-field">
              <div class="code-row">
                <el-input v-model="registerForm.emailCode" placeholder="请输入邮箱验证码" prefix-icon="el-icon-key" maxlength="6" />
                <el-button :disabled="countdown > 0" :loading="sendingCode" class="code-btn" @click="handleSendCode">
                  {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
                </el-button>
              </div>
            </el-form-item>
          </div>
          <div class="section-divider" />
          <div class="section-label"><i class="el-icon-setting" /> 账户设置</div>
          <div class="radio-row">
            <el-form-item label="账户类型" prop="uType" class="field">
              <el-radio-group v-model="registerForm.uType" class="custom-radio-group">
                <el-radio-button :label="2"><i class="el-icon-shopping-bag-2" /> 顾客</el-radio-button>
                <el-radio-button :label="1"><i class="el-icon-s-shop" /> 商家</el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="性别" prop="gender" class="field">
              <el-radio-group v-model="registerForm.gender" class="custom-radio-group">
                <el-radio-button :label="1"><i class="el-icon-male" /> 男</el-radio-button>
                <el-radio-button :label="2"><i class="el-icon-female" /> 女</el-radio-button>
                <el-radio-button :label="0"><i class="el-icon-lock" /> 保密</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </div>
          </div>
          <el-form-item class="action">
            <el-button
              type="primary"
              :loading="loading"
              class="auth-submit-btn register-btn"
              @click="handleRegister"
            >创建账户</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script>
import { register, sendEmailCode } from '../../api/user';

export default {
  name: 'Register',
  data() {
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback();
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号码'));
      } else {
        callback();
      }
    };
    const validateEmail = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入邮箱'));
      } else if (!/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value)) {
        callback(new Error('请输入正确的邮箱'));
      } else {
        callback();
      }
    };
    return {
      registerForm: {
        uName: '',
        password: '',
        confirmPassword: '',
        uType: Number(this.$route.query.uType) === 1 ? 1 : 2,
        realName: '',
        gender: 1,
        phone: '',
        birthday: '',
        email: '',
        emailCode: ''
      },
      registerRules: {
        uName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 2, max: 32, message: '用户名长度 2-32 字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 64, message: '密码长度 6-64 字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ],
        realName: [
          { required: true, message: '请输入用户姓名', trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: validatePhone, trigger: 'blur' }
        ],
        birthday: [
          { required: true, message: '请选择出生日期', trigger: 'change' }
        ],
        email: [
          { required: true, validator: validateEmail, trigger: 'blur' }
        ],
        emailCode: [
          { required: true, message: '请输入邮箱验证码', trigger: 'blur' },
          { min: 6, max: 6, message: '验证码为 6 位数字', trigger: 'blur' }
        ]
      },
      loading: false,
      sendingCode: false,
      countdown: 0,
      timer: null
    };
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    handleSendCode() {
      this.$refs.registerForm.validateField('email', errMsg => {
        if (errMsg) return;
        this.sendingCode = true;
        sendEmailCode(this.registerForm.email)
          .then(() => {
            this.$message.success('验证码已发送至邮箱，3 分钟内有效');
            this.countdown = 60;
            this.timer = setInterval(() => {
              this.countdown -= 1;
              if (this.countdown <= 0) {
                clearInterval(this.timer);
                this.timer = null;
              }
            }, 1000);
          })
          .catch(() => {})
          .finally(() => {
            this.sendingCode = false;
          });
      });
    },
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (!valid) return;
        this.loading = true;
        register({
          uName: this.registerForm.uName,
          password: this.registerForm.password,
          uType: this.registerForm.uType,
          realName: this.registerForm.realName,
          gender: this.registerForm.gender,
          phone: this.registerForm.phone,
          birthday: this.registerForm.birthday,
          email: this.registerForm.email,
          emailCode: this.registerForm.emailCode
        })
          .then(() => {
            this.$message.success('注册成功，请登录');
            this.$router.push('/login');
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
/deep/ .auth-form .el-input__inner{
  height: 35px !important;
  line-height: 35px !important;
}
.register-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 24px;
  box-sizing: border-box;
  background: var(--gradient-topbar);
  overflow: hidden;
}
.bg-decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  opacity: 0.5;
  animation: blob-float 14s ease-in-out infinite alternate;
}
@keyframes blob-float {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(24px, -18px) scale(1.08); }
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
  animation-duration: 18s;
}
.register-panel {
  position: relative;
  z-index: 1;
  display: flex;
  width: 960px;
  max-width: calc(100vw - 48px);
  max-height: calc(100vh - 80px);
  min-height: 580px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(15, 23, 42, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.4);
  animation: panel-in 0.5s ease both;
}
@keyframes panel-in {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.panel-left {
  position: relative;
  flex: 1 1 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 44px 40px;
  background: linear-gradient(160deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: #fff;
  overflow: hidden;
}
.panel-left::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 18% 8%, rgba(255, 255, 255, 0.16), transparent 55%);
  pointer-events: none;
}
.panel-left::after {
  content: '';
  position: absolute;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.14);
  right: -90px;
  bottom: -90px;
  box-shadow: 0 0 0 40px rgba(255, 255, 255, 0.04);
  pointer-events: none;
}
.left-brand {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 34px;
  padding-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.18);
}
.brand-mark {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: var(--radius-card);
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.35);
  object-fit: contain;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.brand-name {
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
}
.brand-slogan {
  margin-top: 4px;
  font-size: 13px;
  opacity: 0.82;
}
.left-features {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 22px;
}
.feature-item {
  display: flex;
  align-items: center;
  gap: 14px;
}
.feature-item i {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.25);
  font-size: 18px;
}
.feature-title {
  font-size: 15px;
  font-weight: 600;
}
.feature-desc {
  margin-top: 3px;
  font-size: 12px;
  opacity: 0.78;
}
.left-quote {
  position: relative;
  margin-top: 34px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  border-radius: var(--radius-md);
  background: rgba(255, 255, 255, 0.14);
  border: 1px dashed rgba(255, 255, 255, 0.35);
  font-size: 13px;
  font-weight: 500;
}
.left-quote i {
  font-size: 15px;
}
.panel-right {
  position: relative;
  flex: 0 0 560px;
  padding: 34px 44px 30px;
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.login-link {
  position: absolute;
  top: 18px;
  right: 26px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s;
}
.login-link span {
  color: var(--color-primary);
  font-weight: 600;
}
.login-link:hover span {
  text-decoration: underline;
}
.brand {
  text-align: center;
  margin: 6px 0 22px;
  flex-shrink: 0;
}
.brand-title {
  margin: 0 0 6px;
  color: var(--text-title);
  font-size: 22px;
  font-weight: 600;
  letter-spacing: 1px;
}
.brand-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: 13px;
}
.register-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.register-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
}
.register-form >>> .el-form-item {
  margin-bottom: 0;
}
.register-form >>> .el-form-item__label {
  font-size: 12px;
  line-height: 22px;
  padding-bottom: 2px !important;
}
.section-label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color-light);
  color: var(--text-regular);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}
.section-label i {
  color: var(--color-primary);
  font-size: 14px;
}
.section-divider {
  height: 1px;
  background: var(--border-color-light);
  margin: 16px 0;
  flex-shrink: 0;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
  flex-shrink: 0;
}
.full-row {
  display: flex;
  gap: 24px;
  margin-top: 12px;
  flex-shrink: 0;
}
.full-row .date-field,
.full-row .code-field {
  flex: 1;
}
.radio-row {
  display: flex;
  gap: 24px;
  flex-shrink: 0;
}
.radio-row .field {
  flex: 1;
  margin-bottom: 0;
}
.custom-radio-group >>> .el-radio-button__inner {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 18px;
  font-size: 13px;
}
.custom-radio-group >>> .el-radio-button__inner i {
  font-size: 13px;
}
.code-row {
  display: flex;
  gap: 10px;
}
.code-row .el-input {
  flex: 1;
}
.code-btn {
  flex: 0 0 116px;
  height: 35px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  border: 1px solid rgba(102, 126, 234, 0.45);
  background: rgba(102, 126, 234, 0.08);
  color: var(--color-primary);
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.2s;
}
.code-btn:not(:disabled):hover {
  border-color: var(--color-primary);
  background: rgba(102, 126, 234, 0.14);
  color: var(--color-primary-dark);
  transform: translateY(-1px);
}
.code-btn:not(:disabled):active {
  transform: translateY(0);
}
.code-btn.is-disabled {
  border-color: #e2e8f0;
  background: #f8fafc;
  color: #a0aec0;
}
.action {
  position: sticky;
  bottom: 0;
  z-index: 1;
  margin-top: auto;
  padding: 20px 0 4px;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.94);
}
.register-form .auth-submit-btn {
  width: 100%;
  height: 42px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  border-radius: var(--radius-md);
}
@media (max-width: 900px) {
  .register-container {
    padding: 16px;
  }
  .register-panel {
    max-width: calc(100vw - 32px);
    max-height: calc(100vh - 32px);
    min-height: 0;
  }
  .panel-left {
    display: none;
  }
  .panel-right {
    flex: 1 1 auto;
    padding: 32px 22px 24px;
  }
}
@media (max-width: 520px) {
  .form-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  .full-row {
    flex-direction: column;
    gap: 12px;
  }
  .radio-row {
    flex-direction: column;
    gap: 12px;
  }
}
</style>
