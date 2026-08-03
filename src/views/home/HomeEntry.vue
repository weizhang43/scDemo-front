<template>
  <component :is="view" />
</template>

<script>
import Home from './Home.vue';
import CustomerHome from './CustomerHome.vue';
import AdminHome from './AdminHome.vue';

export default {
  name: 'HomeEntry',
  computed: {
    view() {
      const t = this.$store.getters.userType;
      if (t === 2) return CustomerHome;
      if (t === 3) return AdminHome;
      return Home;
    }
  }
};
</script>
