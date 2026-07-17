<template>
  <div class="fp-container">
    <div class="bg-decorations">
      <span class="blob blob-1" />
      <span class="blob blob-2" />
      <span class="blob blob-3" />
    </div>
    <div class="fp-card">
      <div class="brand">
        <div class="brand-mark">SC</div>
        <h2 class="brand-title">找回密码</h2>
        <p class="brand-subtitle">通过注册手机号验证后重置密码</p>
      </div>
      <el-steps :active="step" finish-status="success" align-center class="fp-steps">
        <el-step title="验证手机" />
        <el-step title="重置密码" />
        <el-step title="完成" />
      </el-steps>
      <el-form
        ref="form"
        :model="form"
        :rules="rules"
        label-position="top"
        class="fp-form"
        @submit.native.prevent
      >
        <!-- 步骤 1：验证手机号 -->
        <div v-if="step === 0">
          <el-form-item label="手机号码" prop="phone" class="field">
            <el-input v-model="form.phone" placeholder="请输入注册手机号" prefix-icon="el-icon-mobile-phone" maxlength="11" />
          </el-form-item>
          <el-form-item label="验证码" prop="code" class="field">
            <div class="code-row">
              <el-input v-model="form.code" placeholder="请输入短信验证码" prefix-icon="el-icon-message" maxlength="6" />
              <el-button :disabled="countdown > 0" :loading="sendingCode" class="code-btn" @click="handleSendCode">
                {{ countdown > 0 ? `${countdown}s 后重发` : '获取验证码' }}
              </el-button>
            </div>
          </el-form-item>
          <el-form-item class="action">
            <el-button type="primary" :loading="verifying" class="submit-btn" @click="handleVerifyCode">下一步</el-button>
          </el-form-item>
        </div>

        <!-- 步骤 2：重置密码 -->
        <div v-else-if="step === 1">
          <el-form-item label="新密码" prop="newPassword" class="field">
            <el-input v-model="form.newPassword" type="password" show-password placeholder="请输入新密码" prefix-icon="el-icon-lock" />
          </el-form-item>
          <el-form-item label="确认新密码" prop="confirmPassword" class="field">
            <el-input v-model="form.confirmPassword" type="password" show-password placeholder="请再次输入新密码" prefix-icon="el-icon-lock" />
          </el-form-item>
          <el-form-item class="action">
            <el-button type="primary" :loading="resetting" class="submit-btn" @click="handleReset">确认重置</el-button>
          </el-form-item>
        </div>

        <!-- 步骤 3：完成 -->
        <div v-else class="success-block">
          <i class="el-icon-circle-check success-icon"></i>
          <p class="success-text">密码重置成功，请使用新密码登录</p>
          <el-button type="primary" class="submit-btn" @click="goLogin">去登录</el-button>
        </div>

        <div class="fp-footer">
          <router-link to="/login" class="link">返回登录</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script>
import { sendSmsCode, resetPassword } from '../../api/user';

export default {
  name: 'ForgotPassword',
  data() {
    const validatePhone = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入手机号'));
      } else if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('请输入正确的手机号'));
      } else {
        callback();
      }
    };
    const validateConfirm = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入新密码'));
      } else if (value !== this.form.newPassword) {
        callback(new Error('两次输入的密码不一致'));
      } else {
        callback();
      }
    };
    return {
      step: 0,
      form: {
        phone: '',
        code: '',
        newPassword: '',
        confirmPassword: ''
      },
      rules: {
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        code: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 6, max: 6, message: '验证码为 6 位数字', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 64, message: '密码长度 6-64 字符', trigger: 'blur' }
        ],
        confirmPassword: [{ required: true, validator: validateConfirm, trigger: 'blur' }]
      },
      sendingCode: false,
      verifying: false,
      resetting: false,
      countdown: 0,
      timer: null
    };
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
  },
  methods: {
    handleSendCode() {
      this.$refs.form.validateField('phone', errMsg => {
        if (errMsg) return;
        this.sendingCode = true;
        sendSmsCode(this.form.phone)
          .then(() => {
            this.$message.success('验证码已发送，请查看后端控制台日志（模拟短信）');
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
    handleVerifyCode() {
      this.$refs.form.validateField(['phone', 'code'], errMsgs => {
        if (errMsgs && errMsgs.some(m => m)) return;
        this.verifying = true;
        // 不直接调后端校验，而是等用户填好新密码一起提交；这里仅做本地必填校验
        this.verifying = false;
        this.step = 1;
      });
    },
    handleReset() {
      this.$refs.form.validateField(['newPassword', 'confirmPassword'], errMsgs => {
        if (errMsgs && errMsgs.some(m => m)) return;
        this.resetting = true;
        resetPassword({
          phone: this.form.phone,
          code: this.form.code,
          newPassword: this.form.newPassword
        })
          .then(() => {
            this.step = 2;
          })
          .catch(() => {})
          .finally(() => {
            this.resetting = false;
          });
      });
    },
    goLogin() {
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.fp-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #4b6cb7 0%, #192841 100%);
  overflow: hidden;
  padding: 40px 16px;
}
.bg-decorations { position: absolute; inset: 0; pointer-events: none; }
.blob { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.5; }
.blob-1 { width: 320px; height: 320px; background: #7f9cf0; top: -80px; left: -60px; }
.blob-2 { width: 380px; height: 380px; background: #9b6cff; bottom: -120px; right: -80px; }
.blob-3 { width: 240px; height: 240px; background: #2dd4bf; top: 40%; right: 20%; opacity: 0.25; }
.fp-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 40px 36px 28px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(20px);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.4);
}
.brand { text-align: center; margin-bottom: 20px; }
.brand-mark {
  width: 56px; height: 56px; margin: 0 auto 14px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff; font-weight: 700; font-size: 22px; letter-spacing: 1px;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 8px 20px rgba(118, 75, 162, 0.4);
}
.brand-title { margin: 0 0 6px; color: #1f2733; font-size: 22px; font-weight: 600; }
.brand-subtitle { margin: 0; color: #7a8694; font-size: 13px; }
.fp-steps { margin-bottom: 26px; }
.fp-form .field >>> .el-form-item__label { color: #4a5568; font-weight: 500; padding-bottom: 4px; }
.fp-form .field >>> .el-input__inner {
  border-radius: 10px; height: 44px; line-height: 44px;
  border: 1px solid #e2e8f0; background: #f8fafc; padding-left: 36px;
  transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
}
.fp-form .field >>> .el-input__inner:hover { border-color: #cbd5e0; }
.fp-form .field >>> .el-input__inner:focus {
  border-color: #667eea; background: #fff;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}
.fp-form .field >>> .el-input__prefix { left: 10px; color: #a0aec0; }
.code-row { display: flex; gap: 10px; }
.code-row .el-input { flex: 1; }
.code-btn {
  height: 44px; border-radius: 10px;
  border: 1px solid #cbd5e0; background: #fff; color: #4a5568;
  white-space: nowrap;
}
.code-btn:not(:disabled):hover { border-color: #667eea; color: #667eea; }
.code-btn.is-disabled { background: #f1f5f9; color: #a0aec0; }
.action { margin-bottom: 8px; }
.submit-btn {
  width: 100%; height: 44px; border: none; border-radius: 10px;
  font-size: 15px; font-weight: 600; letter-spacing: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 8px 20px rgba(118, 75, 162, 0.35);
  transition: transform 0.15s, box-shadow 0.2s, filter 0.2s;
}
.submit-btn:hover { filter: brightness(1.05); transform: translateY(-1px); box-shadow: 0 12px 24px rgba(118, 75, 162, 0.45); }
.submit-btn:active { transform: translateY(0); }
.success-block { text-align: center; padding: 16px 0 8px; }
.success-icon { font-size: 56px; color: #67c23a; }
.success-text { color: #4a5568; font-size: 14px; margin: 12px 0 22px; }
.fp-footer { text-align: center; font-size: 13px; margin-top: 8px; }
.link { color: #667eea; font-weight: 500; text-decoration: none; }
.link:hover { color: #764ba2; text-decoration: underline; }
</style>
