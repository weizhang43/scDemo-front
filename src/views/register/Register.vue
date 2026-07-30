<template>
  <div class="register-container">
    <div class="bg-decorations">
      <span class="blob blob-1" />
      <span class="blob blob-2" />
      <span class="blob blob-3" />
    </div>
    <div class="register-card">
      <div class="brand">
        <div class="brand-mark">SC</div>
        <h2 class="brand-title">创建账户</h2>
        <p class="brand-subtitle">注册以开始使用商城系统</p>
      </div>
      <el-form
        ref="registerForm"
        :model="registerForm"
        :rules="registerRules"
        label-position="top"
        class="register-form"
        @submit.native.prevent="handleRegister"
      >
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
        <el-form-item label="账户类型" prop="uType" class="field">
          <el-radio-group v-model="registerForm.uType">
            <el-radio-button :label="2">顾客</el-radio-button>
            <el-radio-button :label="1">商家</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="用户姓名" prop="realName" class="field">
          <el-input v-model="registerForm.realName" placeholder="请输入真实姓名" prefix-icon="el-icon-postcard" />
        </el-form-item>
        <el-form-item label="性别" prop="gender" class="field">
          <el-radio-group v-model="registerForm.gender">
            <el-radio-button :label="1">男</el-radio-button>
            <el-radio-button :label="2">女</el-radio-button>
            <el-radio-button :label="0">保密</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="手机号码" prop="phone" class="field">
          <el-input v-model="registerForm.phone" placeholder="请输入手机号码" prefix-icon="el-icon-mobile-phone" maxlength="11" />
        </el-form-item>
        <el-form-item label="出生日期" prop="birthday" class="field">
          <el-date-picker
            v-model="registerForm.birthday"
            type="date"
            value-format="yyyy-MM-dd"
            placeholder="请选择出生日期"
            style="width:100%;"
            prefix-icon="el-icon-date"
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email" class="field">
          <el-input v-model="registerForm.email" placeholder="请输入邮箱" prefix-icon="el-icon-message" />
        </el-form-item>
        <el-form-item label="邮箱验证码" prop="emailCode" class="field">
          <div class="code-row">
            <el-input v-model="registerForm.emailCode" placeholder="请输入邮箱验证码" prefix-icon="el-icon-key" maxlength="6" />
            <el-button :disabled="countdown > 0" :loading="sendingCode" class="code-btn" @click="handleSendCode">
              {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item class="action">
          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            @click="handleRegister"
          >注册</el-button>
        </el-form-item>
        <div class="register-footer">
          已有账号？
          <router-link to="/login" class="link">去登录</router-link>
        </div>
      </el-form>
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
        uType: 2,
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
.register-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #4b6cb7 0%, #192841 100%);
  overflow: hidden;
  padding: 24px 16px;
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
}
.blob-1 {
  width: 320px;
  height: 320px;
  background: #7f9cf0;
  top: -80px;
  right: -60px;
}
.blob-2 {
  width: 380px;
  height: 380px;
  background: #9b6cff;
  bottom: -120px;
  left: -80px;
}
.blob-3 {
  width: 240px;
  height: 240px;
  background: #2dd4bf;
  top: 40%;
  left: 20%;
  opacity: 0.25;
}
.register-card {
  position: relative;
  z-index: 1;
  width: 400px;
  max-height: calc(100vh - 48px);
  overflow-y: auto;
  padding: 36px 36px 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.4);
}
.register-card::-webkit-scrollbar { width: 6px; }
.register-card::-webkit-scrollbar-thumb { background: rgba(118, 75, 162, 0.3); border-radius: 3px; }
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
.register-form .field >>> .el-form-item__label {
  color: #4a5568;
  font-weight: 500;
  padding-bottom: 4px;
  line-height: 1.4;
}
.register-form .field >>> .el-form-item {
  margin-bottom: 14px;
}
.register-form .field >>> .el-input__inner {
  border-radius: 10px;
  height: 40px;
  line-height: 40px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  padding-left: 36px;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.register-form .field >>> .el-input__inner:hover {
  border-color: #cbd5e0;
}
.register-form .field >>> .el-input__inner:focus {
  border-color: #667eea;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}
.register-form .field >>> .el-input__prefix {
  left: 10px;
  color: #a0aec0;
}
.code-row {
  display: flex;
  gap: 10px;
}
.code-row .el-input {
  flex: 1;
}
.code-btn {
  height: 40px;
  border-radius: 10px;
  border: 1px solid #cbd5e0;
  background: #fff;
  color: #4a5568;
  white-space: nowrap;
}
.code-btn:not(:disabled):hover {
  border-color: #667eea;
  color: #667eea;
}
.code-btn.is-disabled {
  background: #f1f5f9;
  color: #a0aec0;
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
.register-footer {
  text-align: center;
  font-size: 13px;
  color: #7a8694;
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
</style>
