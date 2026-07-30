<template>
  <div class="cs-embed">
    <CustomerChat />
  </div>
</template>

<script>
import CustomerChat from './CustomerChat.vue';

export default {
  name: 'CustomerServiceEmbed',
  components: { CustomerChat }
};
</script>

<style scoped>
/* 顶部导航 60px + main 内边距上下各 20px */
.cs-embed {
  height: calc(100vh - 100px);
}
.cs-embed ::v-deep .chat-page {
  height: 100%;
}
/* 已在 Layout 顶部导航中，隐藏页面自带的返回链接 */
.cs-embed ::v-deep .back-link {
  display: none;
}
</style>
