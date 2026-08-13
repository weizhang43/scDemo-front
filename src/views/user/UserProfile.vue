<template>
  <div class="user-profile">
    <el-tabs v-model="activeTab" class="profile-tabs">
      <el-tab-pane name="info">
        <span slot="label"><i class="el-icon-user" /> 基本资料</span>
        <UserDetail :self="true" />
      </el-tab-pane>
      <el-tab-pane name="address">
        <span slot="label"><i class="el-icon-location-outline" /> 收货地址</span>
        <UserAddress v-if="addressLoaded" :self="true" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import UserDetail from './UserDetail.vue';
import UserAddress from './UserAddress.vue';

export default {
  name: 'UserProfile',
  components: { UserDetail, UserAddress },
  data() {
    return {
      activeTab: 'info',
      addressLoaded: false
    };
  },
  watch: {
    activeTab(val) {
      if (val === 'address') this.addressLoaded = true;
    }
  }
};
</script>

<style>
.user-profile .profile-tabs > .el-tabs__header {
  margin-bottom: 16px;
}
.user-profile .profile-tabs .el-tabs__item {
  font-size: 15px;
  font-weight: 500;
  color: #5a6478;
}
.user-profile .profile-tabs .el-tabs__item.is-active {
  color: var(--color-primary);
}
.user-profile .profile-tabs .el-tabs__active-bar {
  background: var(--gradient-brand);
}
</style>
