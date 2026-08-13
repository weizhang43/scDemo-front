<template>
  <el-container class="layout-container">
    <el-header class="layout-header">
      <div class="header-inner">
        <div class="logo" @click="goHome">
          <img src="../assets/logo.png" alt="go购够" class="logo-icon" />
          <span class="logo-text">go购够</span>
        </div>
        <el-menu
          :default-active="activeMenu"
          mode="horizontal"
          router
          class="nav-menu"
        >
          <el-menu-item v-for="m in menus" :key="m.path" :index="m.path"><i :class="m.icon" />{{ m.label }}</el-menu-item>
        </el-menu>
        <div class="header-right">
          <el-dropdown trigger="hover" @command="handleCommand">
            <div class="user-chip">
              <div class="user-avatar">
                <img v-if="avatarUrl" :src="avatarUrl" class="user-avatar-img" alt="">
                <template v-else>{{ avatarText }}</template>
              </div>
              <div class="user-meta">
                <span class="user-greeting" v-if="username !== '未登录'">欢迎你</span>
                <span class="user-name">{{ username }}</span>
                <i class="el-icon-arrow-down user-caret" />
              </div>
            </div>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="profile" icon="el-icon-user">个人中心</el-dropdown-item>
              <el-dropdown-item command="logout" icon="el-icon-switch-button" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </div>
    </el-header>
    <el-container class="body-container">
      <el-aside width="200px" class="side-menu">
        <div class="side-title">用户管理</div>
        <el-menu
          :default-active="activeMenu"
          router
          class="side-nav"
        >
          <el-menu-item index="/system/users"><i class="el-icon-user" />用户列表</el-menu-item>
          <el-menu-item index="/system/roles"><i class="el-icon-s-check" />角色列表</el-menu-item>
          <el-menu-item index="/system/modules"><i class="el-icon-set-up" />权限列表</el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'SystemLayout',
  computed: {
    menus() {
      return this.$store.getters.menus;
    },
    username() {
      const user = this.$store.state.userInfo || {};
      return user.realName || user.uName || '未登录';
    },
    avatarText() {
      const name = this.username;
      if (!name || name === '未登录') return 'U';
      return name.charAt(0).toUpperCase();
    },
    avatarUrl() {
      return (this.$store.state.userInfo || {}).avatar || '';
    },
    activeMenu() {
      return this.$route.path;
    }
  },
  methods: {
    goHome() {
      this.$router.push('/home').catch(() => {});
    },
    goProfile() {
      this.$router.push('/profile').catch(() => {});
    },
    handleCommand(cmd) {
      if (cmd === 'profile') {
        this.goProfile();
      } else if (cmd === 'logout') {
        this.handleLogout();
      }
    },
    handleLogout() {
      this.$confirm('确认退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.$store.dispatch('logout');
          this.$message.success('已退出登录');
          this.$router.push('/login');
        })
        .catch(() => {});
    }
  }
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.layout-header {
  padding: 0;
  background: var(--gradient-topbar);
  color: #fff;
  box-shadow: 0 2px 12px rgba(30, 60, 114, 0.25);
  position: relative;
  z-index: 10;
}
.header-inner {
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 24px;
}
.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-right: 36px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.logo:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}
.logo-icon {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  background: #fff;
  object-fit: contain;
}
.logo-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  background: linear-gradient(90deg, #ffffff, #ffe9a8);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.nav-menu {
  flex: 1;
  background-color: transparent;
  border-bottom: none;
}
.nav-menu >>> .el-menu-item {
  color: rgba(255, 255, 255, 0.85);
  height: 60px;
  line-height: 60px;
  font-weight: 500;
  border-bottom: 3px solid transparent;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
}
.nav-menu >>> .el-menu-item i {
  color: inherit;
  margin-right: 4px;
}
.nav-menu >>> .el-menu-item:hover {
  background-color: rgba(255, 255, 255, 0.12) !important;
  color: #fff !important;
}
.nav-menu >>> .el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.16) !important;
  color: #fff !important;
  border-bottom-color: #ffd166;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 5px 10px 5px 5px;
  border-radius: 22px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: background-color 0.2s ease, transform 0.15s ease;
}
.user-chip:hover {
  background: rgba(255, 255, 255, 0.24);
  transform: translateY(-1px);
}
.user-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffd166, #ef476f);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.user-meta {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.user-greeting {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}
.user-name {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
}
.user-caret {
  color: rgba(255, 255, 255, 0.7);
  margin-left: 4px;
  font-size: 12px;
}

/* 二级左侧菜单 */
.body-container {
  height: calc(100vh - 60px);
}
.side-menu {
  background: #fff;
  border-right: 1px solid #e4e7ed;
  box-shadow: 1px 0 6px rgba(0, 0, 0, 0.04);
}
.side-title {
  height: 50px;
  line-height: 50px;
  text-align: center;
  font-size: 15px;
  font-weight: 600;
  color: #2a5298;
  border-bottom: 1px solid #eef0f5;
  letter-spacing: 1px;
}
.side-nav {
  border-right: none;
}
.side-nav >>> .el-menu-item {
  height: 48px;
  line-height: 48px;
  border-left: 3px solid transparent;
}
.side-nav >>> .el-menu-item:hover {
  background-color: #f3f6fb;
  color: #2a5298;
}
.side-nav >>> .el-menu-item.is-active {
  background-color: #eaf1ff;
  color: #2a5298;
  font-weight: 600;
  border-left-color: #2a5298;
}
.layout-main {
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  padding: 20px;
  overflow: auto;
}
@media (max-width: 768px) {
  .layout-main {
    padding: 12px;
  }
}
</style>
