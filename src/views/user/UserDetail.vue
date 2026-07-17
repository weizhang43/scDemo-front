<template>
  <div class="user-detail">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">个人信息</span>
          <span v-if="form.uId" class="header-meta">用户ID #{{ form.uId }}</span>
        </div>
        <el-button type="text" icon="el-icon-back" @click="goBack">返回</el-button>
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
            <el-button type="primary" :loading="submitting" @click="handleSave">保存修改</el-button>
            <el-button @click="handleReset">重置</el-button>
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
  padding: 20px;
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  box-sizing: border-box;
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
  gap: 36px;
  align-items: flex-start;
  padding: 8px 4px 0;
}
.avatar-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 200px;
  flex-shrink: 0;
}
.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-size: 38px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(118, 75, 162, 0.3);
}
.avatar-info {
  margin-top: 14px;
  text-align: center;
}
.avatar-name {
  font-size: 18px;
  font-weight: 600;
  color: #1f2733;
}
.avatar-sub {
  margin-top: 4px;
  font-size: 13px;
  color: #8a93a4;
  font-family: 'Menlo', 'Consolas', monospace;
}
.profile-form {
  flex: 1;
  max-width: 560px;
}
.form-actions {
  margin-top: 8px;
}
.form-actions >>> .el-form-item__content {
  margin-left: 0 !important;
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
  padding: 24px;
}
.user-detail .profile-form .el-form-item__label {
  color: #4a5568;
  font-weight: 500;
}
.user-detail .profile-form .el-input__inner {
  border-radius: 8px;
}
.user-detail .profile-form .el-input__inner:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
}
</style>
