<template>
  <component :is="view" />
</template>

<script>
import Home from './Home.vue';
import CustomerHome from './CustomerHome.vue';

export default {
  name: 'HomeEntry',
  computed: {
    view() {
      return this.$store.getters.userType === 2 ? CustomerHome : Home;
    }
  }
};
</script>
