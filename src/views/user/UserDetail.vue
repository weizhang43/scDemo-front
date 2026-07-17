<template>
  <div class="user-detail">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">个人信息</span>
          <span v-if="form.uId" class="header-meta">用户ID #{{ form.uId }}</span>
        </div>
        <el-button type="text" size="small" icon="el-icon-back" class="btn-back" @click="goBack">返回</el-button>
      </div>

      <div class="detail-body">
        <div class="avatar-box">
          <div class="avatar">{{ avatarText }}</div>
          <div class="avatar-info">
            <div class="avatar-name">{{ form.realName || form.uName || '-' }}</div>
            <div class="avatar-sub">{{ form.uName }}</div>
          </div>
        </div>

        <el-form
          ref="profileForm"
          :model="form"
          :rules="rules"
          label-width="100px"
          class="profile-form"
        >
          <el-form-item label="用户名">
            <el-input :value="form.uName" disabled />
          </el-form-item>
          <el-form-item label="真实姓名" prop="realName">
            <el-input v-model="form.realName" placeholder="请输入真实姓名" maxlength="32" clearable />
          </el-form-item>
          <el-form-item label="性别" prop="gender">
            <el-radio-group v-model="form.gender">
              <el-radio :label="1">男</el-radio>
              <el-radio :label="2">女</el-radio>
              <el-radio :label="0">保密</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" placeholder="请输入手机号" maxlength="11" clearable />
          </el-form-item>
          <el-form-item label="生日" prop="birthday">
            <el-date-picker
              v-model="form.birthday"
              type="date"
              placeholder="选择生日"
              value-format="yyyy-MM-dd"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item class="form-actions">
            <el-button type="primary" class="btn-save" icon="el-icon-check" :loading="submitting" @click="handleSave">保存修改</el-button>
            <el-button class="btn-reset" icon="el-icon-refresh-left" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import { getUserDetail, updateUserProfile } from '../../api/user';

export default {
  name: 'UserDetail',
  data() {
    const phoneValidator = (rule, value, callback) => {
      if (!value) {
        callback();
        return;
      }
      if (!/^1[3-9]\d{9}$/.test(value)) {
        callback(new Error('手机号格式不正确'));
      } else {
        callback();
      }
    };
    return {
      loading: false,
      submitting: false,
      original: {},
      form: {
        uId: null,
        uName: '',
        realName: '',
        gender: 0,
        phone: '',
        birthday: ''
      },
      rules: {
        realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
        phone: [{ validator: phoneValidator, trigger: 'blur' }]
      }
    };
  },
  computed: {
    avatarText() {
      const name = this.form.realName || this.form.uName || '';
      if (!name) return '?';
      return name.charAt(0).toUpperCase();
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      const queryId = this.$route.query.id;
      const storeUser = this.$store.state.userInfo || {};
      const id = queryId ? Number(queryId) : storeUser.uId;
      if (!id) {
        this.$message.error('未获取到用户信息，请重新登录');
        this.$router.push('/login');
        return;
      }
      this.loading = true;
      getUserDetail(id)
        .then(res => {
          const u = res.daoResult || {};
          this.form = {
            uId: u.uId,
            uName: u.uName || '',
            realName: u.realName || '',
            gender: typeof u.gender === 'number' ? u.gender : 0,
            phone: u.phone || '',
            birthday: u.birthday || ''
          };
          this.original = { ...this.form };
        })
        .catch(() => {})
        .finally(() => {
          this.loading = false;
        });
    },
    handleSave() {
      this.$refs.profileForm.validate(valid => {
        if (!valid) return;
        this.submitting = true;
        updateUserProfile(this.form)
          .then(res => {
            const u = res.daoResult || {};
            // 同步更新本地 store，保留 uName
            const merged = { ...this.$store.state.userInfo, ...u };
            this.$store.commit('SET_USER', merged);
            this.form = {
              uId: u.uId || this.form.uId,
              uName: u.uName || this.form.uName,
              realName: u.realName || '',
              gender: typeof u.gender === 'number' ? u.gender : 0,
              phone: u.phone || '',
              birthday: u.birthday || ''
            };
            this.original = { ...this.form };
            this.$message.success('保存成功');
          })
          .catch(() => {})
          .finally(() => {
            this.submitting = false;
          });
      });
    },
    handleReset() {
      this.form = { ...this.original };
      this.$refs.profileForm && this.$refs.profileForm.clearValidate();
    },
    goBack() {
      this.$router.back();
    }
  }
};
</script>

<style scoped>
.user-detail {
  min-height: 100vh;
  padding: 24px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}
.user-detail > .el-card {
  width: 100%;
  max-width: 920px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-back {
  color: #5a6478;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.btn-back:hover,
.btn-back:focus {
  color: #667eea;
  background: #f5f7ff;
}
.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #1f2733;
  position: relative;
  padding-left: 12px;
  line-height: 1;
}
.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.header-meta {
  font-size: 13px;
  color: #8a93a4;
  font-weight: 500;
  background: #f3f5fa;
  padding: 3px 10px;
  border-radius: 10px;
  line-height: 1.4;
  font-family: 'Menlo', 'Consolas', monospace;
}
.detail-body {
  display: flex;
  gap: 40px;
  align-items: flex-start;
  padding: 8px 4px 0;
}
.avatar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 220px;
  flex-shrink: 0;
  padding: 28px 16px;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8f9ff 0%, #f3f0fa 100%);
  border: 1px solid #edeaf7;
}
.avatar {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 40px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(118, 75, 162, 0.3);
  border: 3px solid #fff;
}
.avatar-info {
  margin-top: 16px;
  text-align: center;
}
.avatar-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2733;
}
.avatar-sub {
  margin-top: 6px;
  font-size: 13px;
  color: #8a93a4;
  font-family: 'Menlo', 'Consolas', monospace;
  background: #fff;
  padding: 2px 10px;
  border-radius: 10px;
  display: inline-block;
}
.profile-form {
  flex: 1;
  max-width: 560px;
  padding-top: 4px;
}
@media (max-width: 768px) {
  .user-detail {
    padding: 12px;
  }
  .detail-body {
    flex-direction: column;
    gap: 24px;
  }
  .avatar-box {
    width: 100%;
    box-sizing: border-box;
  }
  .profile-form {
    max-width: none;
    width: 100%;
  }
}
.form-actions {
  margin-top: 8px;
}
.form-actions >>> .el-form-item__content {
  margin-left: 0 !important;
  display: flex;
  gap: 12px;
}
.form-actions >>> .el-button + .el-button {
  margin-left: 0;
}
.form-actions >>> .btn-save {
  min-width: 120px;
  border: none;
  border-radius: 8px;
  padding: 10px 22px;
  font-weight: 600;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
  transition: all 0.25s ease;
}
.form-actions >>> .btn-save:hover,
.form-actions >>> .btn-save:focus {
  background: linear-gradient(135deg, #7286f0 0%, #855bb3 100%);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.45);
  transform: translateY(-1px);
}
.form-actions >>> .btn-save:active {
  transform: translateY(0);
  box-shadow: 0 3px 8px rgba(102, 126, 234, 0.3);
}
.form-actions >>> .btn-reset {
  min-width: 96px;
  border-radius: 8px;
  padding: 10px 22px;
  color: #5a6478;
  border-color: #dcdfe6;
  transition: all 0.25s ease;
}
.form-actions >>> .btn-reset:hover,
.form-actions >>> .btn-reset:focus {
  color: #667eea;
  border-color: #b3c0f5;
  background: #f5f7ff;
}
</style>

<style>
.user-detail .el-card {
  border: none;
  border-radius: 14px;
  box-shadow: 0 6px 24px rgba(31, 41, 59, 0.06);
  overflow: hidden;
}
.user-detail .el-card__header {
  padding: 18px 24px;
  background: #fff;
  border-bottom: 1px solid #eef0f4;
}
.user-detail .el-card__body {
  padding: 28px 32px;
}
.user-detail .profile-form .el-form-item {
  margin-bottom: 22px;
}
.user-detail .profile-form .el-form-item__label {
  color: #4a5568;
  font-weight: 500;
}
.user-detail .profile-form .el-input__inner {
  border-radius: 8px;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.user-detail .profile-form .el-input__inner:hover {
  border-color: #b3c0f5;
}
.user-detail .profile-form .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}
.user-detail .profile-form .el-input.is-disabled .el-input__inner {
  background: #f7f8fc;
  border-color: #e8ebf2;
  color: #8a93a4;
}
.user-detail .profile-form .el-radio__input.is-checked .el-radio__inner {
  border-color: #667eea;
  background: #667eea;
}
.user-detail .profile-form .el-radio__input.is-checked + .el-radio__label {
  color: #667eea;
}
</style>
