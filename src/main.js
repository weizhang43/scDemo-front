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
import { getUser, getPerms, onSessionEvent } from './utils/auth';

Vue.use(ElementUI, { size: 'small' });
Vue.config.productionTip = false;

onSessionEvent(event => {
  if (event.type === 'logout') {
    store.commit('SYNC_LOGOUT');
    if (router.currentRoute.path !== '/portal') router.replace('/portal');
  } else if (event.type === 'user-updated') {
    store.commit('SYNC_USER', getUser() || {});
  } else if (event.type === 'permissions-updated') {
    store.commit('SYNC_PERMS', getPerms());
  }
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');
