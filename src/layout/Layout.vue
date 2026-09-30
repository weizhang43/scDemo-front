<template>
  <el-container class="workspace">
    <div v-if="drawerOpen" class="drawer-mask" @click="drawerOpen = false" />
    <aside class="workspace-sidebar" :class="{ 'drawer-open': drawerOpen }">
      <button class="brand" type="button" @click="goHome">
        <img src="../assets/logo.png" alt="" class="brand-icon">
        <span class="brand-name">go购够</span>
      </button>
      <div class="nav-caption">工作空间 <span>导航</span></div>
      <el-menu :default-active="activeMenu" :default-openeds="openGroups" router class="side-nav" @select="drawerOpen = false">
        <template v-for="menu in menus">
          <el-submenu v-if="menu.children" :key="menu.path" :index="menu.path + '-group'">
            <template slot="title"><i :class="menu.icon" /><span>{{ menu.label }}</span></template>
            <el-menu-item v-for="child in menu.children" :key="child.path" :index="child.path">
              <i :class="child.icon" />{{ child.label }}
            </el-menu-item>
          </el-submenu>
          <el-menu-item v-else :key="menu.path" :index="menu.path">
            <i :class="menu.icon" />
            <el-badge v-if="menu.path === '/cart' && cartCount > 0" :value="cartCount" :max="99" class="nav-badge">{{ menu.label }}</el-badge>
            <template v-else>{{ menu.label }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>
    <el-container class="workspace-body" direction="vertical">
      <div class="workspace-topbar">
        <button class="mobile-menu" type="button" aria-label="打开导航菜单" :aria-expanded="String(drawerOpen)" @click="drawerOpen = !drawerOpen"><i class="el-icon-s-fold" /></button>
        <div class="tabs-scroll" role="tablist" aria-label="已打开页面">
          <div v-for="page in openPages" :key="page.key" class="page-tab" :class="{ active: page.key === activeKey }" role="tab" :aria-selected="String(page.key === activeKey)">
            <button type="button" class="tab-link" :title="page.title" :aria-label="page.title" @click="switchPage(page)">{{ Array.from(page.title).length > 4 ? Array.from(page.title).slice(0, 4).join('') + '...' : page.title }}</button>
            <button type="button" class="tab-close" :aria-label="`关闭${page.title}`" @click="closePage(page)"><i class="el-icon-close" /></button>
          </div>
        </div>
        <el-dropdown trigger="click" class="account-dropdown" @command="handleCommand">
          <button class="user-chip" type="button" aria-label="账号菜单">
            <span class="user-avatar"><img v-if="avatarUrl" :src="avatarUrl" alt=""><template v-else>{{ avatarText }}</template></span>
            <span class="user-meta"><small>当前账号</small><strong>{{ username }}</strong></span>
            <i class="el-icon-arrow-down" />
          </button>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile" icon="el-icon-user">个人中心</el-dropdown-item>
            <el-dropdown-item command="logout" icon="el-icon-switch-button" divided>退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
      <el-main ref="main" class="layout-main">
        <keep-alive :include="cacheNames">
          <component :is="activePageComponent" v-if="activePageComponent" :key="activeKey" />
        </keep-alive>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { landingFor, pageKey } from '../router/menuConfig';

const pageComponents = Object.create(null);
let resetPageSequence = 0;

export default {
  name: 'Layout',
  data() {
    return { drawerOpen: false };
  },
  computed: {
    menus() { return this.$store.getters.menus; },
    openPages() { return this.$store.state.openPages; },
    activeKey() { return pageKey(this.$route); },
    activePageComponent() {
      const page = this.openPages.find(item => item.key === this.activeKey);
      if (!page) return null;
      if (!pageComponents[page.cacheName]) {
        pageComponents[page.cacheName] = { name: page.cacheName, render: h => h('router-view') };
      }
      return pageComponents[page.cacheName];
    },
    cacheNames() { return this.openPages.map(page => page.cacheName); },
    openGroups() { return this.menus.filter(menu => menu.children).map(menu => menu.path + '-group'); },
    username() {
      const user = this.$store.state.userInfo || {};
      return user.realName || user.uName || '未登录';
    },
    avatarText() { return this.username === '未登录' ? 'U' : this.username.charAt(0).toUpperCase(); },
    avatarUrl() { return (this.$store.state.userInfo || {}).avatar || ''; },
    cartCount() { return this.$store.state.cartCount; },
    activeMenu() {
      const path = this.$route.path;
      const entries = this.menus.reduce((all, menu) => all.concat(menu.children || menu), []);
      const match = entries.find(item => path === item.path || path.indexOf(item.path + '/') === 0);
      return match ? match.path : path;
    }
  },
  watch: {
    $route() {
      const main = this.$refs.main;
      if (main && main.$el) main.$el.scrollTop = 0;
      this.drawerOpen = false;
    }
  },
  created() {
    this.$store.dispatch('refreshCartCount');
    window.addEventListener('keydown', this.handleKeydown);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.handleKeydown);
  },
  methods: {
    handleKeydown(event) {
      if (event.key === 'Escape') this.drawerOpen = false;
    },
    goHome() { this.$router.push('/home').catch(() => {}); },
    switchPage(page) {
      if (page.key !== this.activeKey) this.$router.push(page.fullPath).catch(() => {});
    },
    closePage(page) {
      const index = this.openPages.findIndex(item => item.key === page.key);
      if (page.key !== this.activeKey) {
        this.$store.commit('CLOSE_PAGE', page.key);
        delete pageComponents[page.cacheName];
        return;
      }
      const next = this.openPages[index + 1] || this.openPages[index - 1];
      const destination = next ? next.fullPath : landingFor(this.$store.getters.userType);
      if (page.key === destination) {
        this.$store.commit('CLOSE_PAGE', page.key);
        delete pageComponents[page.cacheName];
        this.$store.commit('OPEN_PAGE', { ...page, cacheName: `WorkspacePageReset${++resetPageSequence}` });
        return;
      }
      this.$router.push(destination).then(() => {
        this.$store.commit('CLOSE_PAGE', page.key);
        delete pageComponents[page.cacheName];
      }).catch(() => {});
    },
    handleCommand(cmd) {
      if (cmd === 'profile') this.$router.push('/my-profile').catch(() => {});
      if (cmd === 'logout') this.handleLogout();
    },
    handleLogout() {
      this.$confirm('确认退出登录吗？', '提示', {
        confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning'
      }).then(() => {
        this.$store.dispatch('logout');
        Object.keys(pageComponents).forEach(name => delete pageComponents[name]);
        this.$message.success('已退出登录');
        this.$router.push('/login').catch(() => {});
      }).catch(() => {});
    }
  }
};
</script>

<style scoped>
.workspace { --sidebar-bg: #1e3c72; display: flex; height: 100vh; min-width: 0; }
.workspace-sidebar { width: 238px; flex: 0 0 238px; background: linear-gradient(166deg, #1e3c72, #202f59 82%); color: #fff; display: flex; flex-direction: column; box-shadow: 5px 0 24px rgba(27, 46, 82, .12); z-index: 12; }
.brand { height: 98px; flex: 0 0 98px; display: flex; align-items: center; gap: 10px; padding: 0 22px; border: 0; background: transparent; color: white; cursor: pointer; text-align: left; }
.brand-icon { width: 37px; height: 37px; border-radius: 11px; background: white; object-fit: contain; }
.brand-name { font-size: 19px; font-weight: 750; letter-spacing: .04em; white-space: nowrap; }
.nav-caption { margin: 8px 24px 12px; color: #c0cfec; font-size: 11px; letter-spacing: .12em; display: flex; justify-content: space-between; }
.nav-caption span { opacity: .55; }
.side-nav { flex: 1; min-height: 0; overflow: auto; background: transparent; border: 0; padding: 0 12px 16px; scrollbar-width: thin; }
.side-nav >>> .el-menu-item, .side-nav >>> .el-submenu__title { height: 44px; line-height: 44px; margin: 3px 0; border-radius: 10px; color: #d4def2; background: transparent !important; font-weight: 500; }
.side-nav >>> .el-menu-item i, .side-nav >>> .el-submenu__title i { color: #a9bbe0; margin-right: 11px; }
.side-nav >>> .el-menu-item:hover, .side-nav >>> .el-submenu__title:hover { color: #fff; background: rgba(255,255,255,.10) !important; }
.side-nav >>> .el-menu-item.is-active { color: #fff; background: rgba(102,126,234,.38) !important; font-weight: 650; box-shadow: inset 3px 0 #ffd166; }
.side-nav >>> .el-menu-item.is-active i { color: #ffd166; }
.side-nav >>> .el-menu { background: transparent; }
.side-nav >>> .el-submenu .el-menu-item { min-width: 0; padding-left: 47px !important; font-size: 13px; }
.side-nav >>> .el-submenu .el-menu-item i { font-size: 15px; margin-right: 7px; }
.nav-badge >>> .el-badge__content { background: #ffd166; color: #1e3c72; border: none; }
.account-dropdown { flex: 0 0 auto; margin-left: 5px; }
.user-chip { min-width: 148px; display: flex; align-items: center; gap: 9px; padding: 5px 9px 5px 5px; color: #1e3c72; border: 1px solid #cbd7eb; border-radius: 10px; background: rgba(255, 255, 255, .8); cursor: pointer; text-align: left; }
.user-chip:hover { background: #fff; border-color: #a6b8dc; }
.user-avatar { width: 34px; height: 34px; display: grid; place-items: center; flex: 0 0 34px; border-radius: 9px; background: #e9edff; color: #344bb2; font-weight: 700; overflow: hidden; }
.user-avatar img { width: 100%; height: 100%; object-fit: cover; }
.user-meta { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.user-meta small { color: #7183a2; font-size: 11px; }
.user-meta strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.workspace-body { min-width: 0; flex: 1; background: #f5f7fb; }
.workspace-topbar { display: flex; align-items: center; gap: 10px; height: 62px; flex: 0 0 62px; padding: 0 20px; border-bottom: 1px solid #e4e8f2; }
.tabs-scroll { display: flex; align-items: center; gap: 7px; overflow-x: auto; min-width: 0; flex: 1; padding: 8px 1px; scrollbar-width: thin; }
.page-tab { display: flex; align-items: center; flex: 0 0 auto; max-width: 174px; height: 30px; padding: 0 4px 0 10px; border: 1px solid #cbd7eb; border-radius: 8px; background: rgba(255, 255, 255, .72); color: #526581; }
.page-tab.active { background: #fff; border-color: #99ace4; color: #344bb2; box-shadow: inset 0 -2px #667eea; }
.tab-link, .tab-close { border: 0; background: transparent; color: inherit; cursor: pointer; }
.tab-link { max-width: 116px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; font-size: 12px; font-weight: 550; }
.tab-close { width: 20px; height: 20px; display: grid; place-items: center; border-radius: 5px; font-size: 9px; }
.tab-close:hover { background: rgba(102,126,234,.14); }
.layout-main { overflow: auto; min-height: 0; padding: 20px; background: linear-gradient(180deg, #f5f7fb, #eef1f7); }
.mobile-menu { display: none; }
.workspace button:focus-visible { outline: 2px solid #ffd166; outline-offset: 2px; }
@media (max-width: 768px) {
  .workspace-sidebar { position: fixed; top: 0; bottom: 0; left: 0; transform: translateX(-100%); transition: transform .2s ease; }
  .workspace-sidebar.drawer-open { transform: translateX(0); }
  .drawer-mask { position: fixed; inset: 0; z-index: 11; background: rgba(17,32,62,.48); }
  .mobile-menu { display: grid; place-items: center; flex: 0 0 32px; width: 32px; height: 32px; color: #1e3c72; border: 0; background: rgba(255, 255, 255, .72); border-radius: 8px; cursor: pointer; }
  .workspace-topbar { padding: 0 10px; height: 54px; flex-basis: 54px; gap: 5px; }
  .user-chip { min-width: 0; padding: 3px; }
  .user-chip .user-avatar { width: 30px; height: 30px; flex-basis: 30px; }
  .user-meta, .user-chip > i { display: none; }
  .layout-main { padding: 12px; }
}
@media (prefers-reduced-motion: reduce) { .workspace-sidebar { transition: none; } }
</style>
