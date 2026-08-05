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
          <el-menu-item v-for="m in menus" :key="m.path" :index="m.path">
            <i :class="m.icon" />
            <el-badge v-if="m.path === '/cart' && cartCount > 0" :value="cartCount" :max="99" class="nav-badge">{{ m.label }}</el-badge>
            <template v-else>{{ m.label }}</template>
          </el-menu-item>
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
    <el-main ref="main" class="layout-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'Layout',
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
    cartCount() {
      return this.$store.state.cartCount;
    },
    activeMenu() {
      // 带二级目录的节点（如 /stats/*）在子页面时仍高亮顶栏父项
      const path = this.$route.path;
      const top = this.menus.find(m => path === m.path || path.indexOf(m.path + '/') === 0);
      return top ? top.path : path;
    }
  },
  watch: {
    /**
     * 切页面时回到顶部。
     * 滚动的是 el-main（它自带 overflow: auto），不是 window，
     * 所以 router 的 scrollBehavior 够不着，只能自己把容器的 scrollTop 归零。
     */
    $route() {
      const main = this.$refs.main;
      const el = main && main.$el;
      if (el) {
        el.scrollTop = 0;
      }
    }
  },
  created() {
    this.$store.dispatch('refreshCartCount');
  },
  methods: {
    goHome() {
      this.$router.push('/home').catch(() => {});
    },
    goProfile() {
      this.$router.push('/my-profile').catch(() => {});
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
  border-radius: 10px;
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
/* 顶栏是深蓝紫渐变，Element 默认的红角标在这里会被读成报错，改用顶栏已有的琥珀强调色 */
.nav-badge >>> .el-badge__content {
  background-color: #ffd166;
  color: #1f2733;
  border: none;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.35);
}
.nav-badge >>> .el-badge__content.is-fixed {
  top: 10px;
  right: 2px;
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
.layout-main {
  background: linear-gradient(180deg, #f5f7fb 0%, #eef1f7 100%);
  padding: 20px;
}
</style>
