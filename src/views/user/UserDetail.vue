<template>
  <div class="user-detail" :class="{ 'is-embedded': self }">
    <el-card v-loading="loading">
      <div slot="header" class="card-header">
        <div class="header-left">
          <span class="card-title">个人信息</span>
          <span v-if="form.uId" class="header-meta">用户ID #{{ form.uId }}</span>
        </div>
        <el-button v-if="!self" type="text" size="small" icon="el-icon-back" class="btn-back" @click="goBack">返回</el-button>
      </div>

      <div class="detail-body">
        <div class="avatar-box">
          <el-upload
            class="avatar-uploader"
            action="/user/image/upload"
            :show-file-list="false"
            :headers="uploadHeaders"
            accept="image/png,image/jpeg,image/gif,image/webp"
            :before-upload="beforeAvatarUpload"
            :on-success="handleAvatarSuccess"
            :on-error="handleAvatarError"
          >
            <div v-loading="avatarUploading" class="avatar">
              <img v-if="form.avatar" :src="form.avatar" class="avatar-img" alt="头像">
              <span v-else>{{ avatarText }}</span>
              <div class="avatar-mask"><i class="el-icon-camera-solid" /></div>
            </div>
          </el-upload>
          <el-button
            v-if="form.avatar"
            type="text"
            icon="el-icon-delete"
            class="btn-remove-avatar"
            @click="handleRemoveAvatar"
          >移除头像</el-button>
          <div class="avatar-info">
            <div class="avatar-name">{{ form.realName || form.uName || '-' }}</div>
            <div class="avatar-sub">{{ form.uName }}</div>
          </div>
        </div>

        <el-form
          ref="profileForm"
          :model="form"
          :rules="rules"
          label-width="90px"
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
          <el-form-item label="邮箱">
            <el-input :value="form.email" placeholder="暂无邮箱" disabled />
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
import { getUserDetail, updateUserProfile, getMyProfile, updateMyProfile } from '../../api/user';
import { getToken } from '../../utils/auth';

export default {
  name: 'UserDetail',
  props: {
    // 嵌在个人主页里时为 true：身份由后端从 X-User-Id 取，不读路由参数
    self: { type: Boolean, default: false }
  },
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
      avatarUploading: false,
      original: {},
      form: {
        uId: null,
        uName: '',
        realName: '',
        gender: 0,
        phone: '',
        email: '',
        birthday: '',
        avatar: ''
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
    },
    // el-upload 不走 axios，拦截器里的 Authorization 到不了它，得自己塞
    uploadHeaders() {
      const token = getToken();
      return token ? { Authorization: 'Bearer ' + token } : {};
    }
  },
  created() {
    this.fetchData();
  },
  methods: {
    fetchData() {
      let req;
      if (this.self) {
        req = getMyProfile();
      } else {
        const queryId = this.$route.query.id;
        const storeUser = this.$store.state.userInfo || {};
        const id = queryId ? Number(queryId) : storeUser.uId;
        if (!id) {
          this.$message.error('未获取到用户信息，请重新登录');
          this.$router.push('/login');
          return;
        }
        req = getUserDetail(id);
      }
      this.loading = true;
      req
        .then(res => {
          const u = res.daoResult || {};
          this.form = {
            uId: u.uId,
            uName: u.uName || '',
            realName: u.realName || '',
            gender: typeof u.gender === 'number' ? u.gender : 0,
            phone: u.phone || '',
            email: u.email || '',
            birthday: u.birthday || '',
            avatar: u.avatar || ''
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
        const req = this.self ? updateMyProfile(this.form) : updateUserProfile(this.form);
        req
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
              email: u.email || this.form.email,
              birthday: u.birthday || '',
              avatar: u.avatar || ''
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
    beforeAvatarUpload(file) {
      const ok = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.type);
      if (!ok) this.$message.error('仅支持 png/jpg/gif/webp 格式');
      const lt5 = file.size / 1024 / 1024 < 5;
      if (!lt5) this.$message.error('头像不能超过 5MB');
      if (ok && lt5) this.avatarUploading = true;
      return ok && lt5;
    },
    // el-upload 绕过了响应拦截器，这里拿到的是原始信封
    handleAvatarSuccess(res) {
      this.avatarUploading = false;
      if (res && res.code === 200 && res.daoResult) {
        this.persistAvatar(res.daoResult, '头像已更新');
      } else {
        this.$message.error((res && res.msg) || '上传失败');
      }
    },
    handleAvatarError() {
      this.avatarUploading = false;
      this.$message.error('头像上传失败');
    },
    handleRemoveAvatar() {
      // MyBatis-Plus updateById 忽略 null，清空必须传空串
      this.persistAvatar('', '已移除头像');
    },
    /**
     * 头像上传即生效，不等「保存修改」。
     * 提交的是 original 而非 form —— 否则会把用户正在编辑、还没点保存的姓名手机号一起提交上去。
     */
    persistAvatar(url, tip) {
      const payload = { ...this.original, avatar: url };
      const req = this.self ? updateMyProfile(payload) : updateUserProfile(payload);
      this.avatarUploading = true;
      req
        .then(res => {
          const u = res.daoResult || {};
          const saved = u.avatar || '';
          this.form.avatar = saved;
          this.original.avatar = saved;
          const me = this.$store.state.userInfo || {};
          // 管理员代改他人资料时不能覆盖自己的 store
          if (me.uId && u.uId === me.uId) {
            this.$store.commit('SET_USER', { ...me, avatar: saved });
          }
          this.$message.success(tip);
        })
        .catch(() => {})
        .finally(() => {
          this.avatarUploading = false;
        });
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
/* 嵌入个人主页时，整页背景与内边距由外层容器接管 */
.user-detail.is-embedded {
  min-height: 0;
  padding: 0;
  background: none;
}
.user-detail.is-embedded > .el-card {
  max-width: none;
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
.header-meta {
  font-weight: 500;
  background: #f3f5fa;
  padding: 3px 10px;
  border-radius: 10px;
  line-height: 1.4;
  font-family: var(--font-mono);
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
  position: relative;
  overflow: hidden;
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
  cursor: pointer;
}
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.avatar-mask {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(31, 41, 59, 0.5);
  color: #fff;
  font-size: 24px;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.avatar:hover .avatar-mask {
  opacity: 1;
}
.btn-remove-avatar {
  margin-top: 10px;
  padding: 0;
  color: #8a93a4;
  font-size: 13px;
}
.btn-remove-avatar:hover,
.btn-remove-avatar:focus {
  color: #f56c6c;
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
  font-family: var(--font-mono);
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
