<template>
  <div class="portal-container">
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
      <router-link :to="{ path: '/customer', query: { from: 'portal' } }" class="customer-entry">
        <i class="el-icon-service" />
        客服
      </router-link>
      <router-link to="/personal-work" class="customer-entry">
        <i class="el-icon-notebook-2" />
        个人空间
      </router-link>
      <router-link to="/knowledge" class="customer-entry">
        <i class="el-icon-collection-tag" />
        知识速记
      </router-link>
      <router-link to="/jobs" class="customer-entry">
        <i class="el-icon-alarm-clock" />
        定时任务
      </router-link>
    </div>

    <div class="portal-body">
      <div class="portal-brand">
        <img src="../../assets/logo.png" alt="go购够" class="brand-mark" />
        <div class="brand-text">
          <div class="brand-name">go购够商城</div>
          <div class="brand-slogan">好物随心购，新鲜每一天</div>
        </div>
      </div>

<!--      <h1 class="portal-title">选择你的身份，进入对应登录入口</h1>-->

      <div class="role-cards">
        <div
          v-for="role in roles"
          :key="role.key"
          class="role-card"
          :style="{ '--accent': role.accent, '--accent-soft': role.accentSoft }"
          @click="goLogin(role)"
        >
          <div class="role-icon">
            <i :class="role.icon" />
          </div>
          <div class="role-label">{{ role.label }}</div>
          <div class="role-desc">{{ role.desc }}</div>
          <div class="role-enter">
            进入登录
            <i class="el-icon-right" />
          </div>
        </div>
      </div>

      <div class="portal-footer">
        还没有账号？
        <router-link to="/register" class="portal-link">去注册</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ROLES } from '../../router/menuConfig';

export default {
  name: 'RolePortal',
  data() {
    return {
      roles: ROLES
    };
  },
  methods: {
    goLogin(role) {
      this.$router.push(`/login/${role.key}`);
    }
  }
};
</script>

<style scoped>
.portal-container {
  position: relative;
  min-height: 100vh;
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
.top-nav {
  position: absolute;
  top: 20px;
  right: 28px;
  z-index: 2;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  max-width: calc(100vw - 48px);
}
.customer-entry {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  border-radius: 999px;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.5px;
  text-decoration: none;
  background: transparent;
  border: 1px solid transparent;
  white-space: nowrap;
  transition: background 0.2s, border-color 0.2s, transform 0.15s;
}
.customer-entry i { font-size: 15px; }
.customer-entry:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}
.portal-body {
  position: relative;
  z-index: 1;
  width: 960px;
  max-width: calc(100vw - 48px);
  padding: 40px 0;
  text-align: center;
  color: #fff;
}
.portal-brand {
  display: inline-flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 88px;
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
.brand-text {
  text-align: left;
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
.portal-title {
  margin: 0 0 36px;
  font-size: 26px;
  font-weight: 600;
  letter-spacing: 1px;
}
.role-cards {
  display: flex;
  justify-content: center;
  gap: 28px;
}
.role-card {
  flex: 1 1 0;
  max-width: 280px;
  padding: 36px 26px 28px;
  border-radius: var(--radius-lg);
  background: transparent;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.45);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
}
.role-card:hover {
  transform: translateY(-8px);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.32);
}
.role-icon {
  width: 68px;
  height: 68px;
  margin: 0 auto 18px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #fff;
  background: var(--accent);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.22);
}
.role-label {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}
.role-desc {
  margin-top: 8px;
  min-height: 40px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  line-height: 1.6;
}
.role-enter {
  margin-top: 18px;
  padding: 10px 0;
  border-radius: 999px;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  background: var(--accent);
  transition: filter 0.2s;
}
.role-card:hover .role-enter {
  filter: brightness(1.1);
}
.portal-footer {
  margin-top: 34px;
  font-size: 14px;
  opacity: 0.9;
}
.portal-link {
  color: #fff;
  font-weight: 600;
  text-decoration: underline;
}
@media (max-width: 768px) {
  .role-cards {
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }
  .role-card {
    max-width: none;
    width: 100%;
  }
  .top-nav {
    position: static;
    justify-content: center;
    margin-bottom: 12px;
    padding: 6px;
    flex-wrap: wrap;
  }
}
</style>
