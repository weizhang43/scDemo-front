<template>
  <div class="guest-gallery">
    <div class="guest-topbar">
      <div class="topbar-brand">
        <img src="../../assets/logo.png" alt="go购够" class="brand-mark" />
        <span class="brand-name">go购够商城</span>
        <span class="brand-tag">游客逛逛</span>
      </div>
      <div class="topbar-actions">
        <el-button size="small" class="btn-ghost" @click="$router.push('/login')">登录</el-button>
        <el-button size="small" type="primary" class="btn-solid" @click="$router.push('/register')">注册</el-button>
      </div>
    </div>
    <product-gallery />
  </div>
</template>

<script>
import ProductGallery from './ProductGallery.vue';

export default {
  name: 'GuestGallery',
  components: { ProductGallery }
};
</script>

<style scoped>
.guest-topbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  background: var(--gradient-brand);
  box-shadow: 0 2px 12px rgba(102, 126, 234, 0.35);
}
.topbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
}
.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.4);
  object-fit: contain;
}
.brand-name {
  color: #fff;
  font-size: 17px;
  font-weight: 600;
  letter-spacing: 1px;
}
.brand-tag {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  color: #fff;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
.btn-ghost {
  background: transparent;
  border-color: rgba(255, 255, 255, 0.6);
  color: #fff;
}
.btn-ghost:hover,
.btn-ghost:focus {
  background: rgba(255, 255, 255, 0.15);
  border-color: #fff;
  color: #fff;
}
.btn-solid {
  background: #fff;
  border-color: #fff;
  color: var(--color-primary);
  font-weight: 600;
}
.btn-solid:hover,
.btn-solid:focus {
  background: #f0f2ff;
  border-color: #f0f2ff;
  color: var(--color-primary-dark);
}
</style>
