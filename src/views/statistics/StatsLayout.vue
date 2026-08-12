<template>
  <el-container class="stats-layout">
    <el-aside width="200px" class="side-menu">
      <div class="side-title">统计报表</div>
      <el-menu
        :default-active="$route.path"
        router
        class="side-nav"
      >
        <el-menu-item v-for="c in items" :key="c.path" :index="c.path">
          <i :class="c.icon" />
          <span>{{ c.label }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="stats-main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
import { MENUS } from '../../router/menuConfig';

export default {
  name: 'StatsLayout',
  computed: {
    items() {
      const stats = MENUS.find(m => m.path === '/stats');
      return (stats && stats.children) || [];
    }
  }
};
</script>

<style scoped>
.stats-layout {
  height: 100%;
  align-items: stretch;
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
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
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
  transition: background-color 0.2s, color 0.2s;
}
.side-nav >>> .el-menu-item:hover {
  background-color: #f5f6fd;
  color: var(--color-primary);
}
.side-nav >>> .el-menu-item.is-active {
  background: linear-gradient(90deg, #eef0ff, rgba(238, 240, 255, 0.3));
  color: var(--color-primary);
  font-weight: 600;
  border-left-color: var(--color-primary);
}
.side-nav >>> .el-menu-item.is-active i {
  color: var(--color-primary-dark);
}
.stats-main {
  padding: 0 16px 16px;
  overflow: visible;
}
</style>
