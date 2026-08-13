import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import './styles/variables.css';
import './styles/element-theme.css';
import './styles/auth.css';
import './styles/list-page.css';
import './styles/detail-page.css';
import './styles/work-page.css';
import App from './App.vue';
import router from './router';
import store from './store';

Vue.use(ElementUI, { size: 'small' });
Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
