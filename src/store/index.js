import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);
import {
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  removeUser,
  getPerms,
  setPerms,
  removePerms,
  broadcastSessionEvent
} from '../utils/auth';
import { menusForType, normalizeType, U_TYPE_CUSTOMER } from '../router/menuConfig';
import { getCartCount } from '../api/cart';

export default new Vuex.Store({
  state: {
    token: getToken() || '',
    userInfo: getUser() || {},
    cartCount: 0,
    openPages: [],
    perms: getPerms()
  },
  getters: {
    userType(state) {
      return normalizeType((state.userInfo || {}).uType);
    },
    menus(state, getters) {
      return menusForType(getters.userType);
    },
    hasPerm(state) {
      return perm => (state.perms || []).includes(perm);
    }
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token || '';
      setToken(token);
      broadcastSessionEvent(token ? 'login' : 'logout');
    },
    SET_USER(state, user) {
      state.userInfo = user || {};
      setUser(user);
      broadcastSessionEvent(user ? 'user-updated' : 'logout');
    },
    SET_CART_COUNT(state, n) {
      state.cartCount = Number(n) || 0;
    },
    OPEN_PAGE(state, page) {
      const index = state.openPages.findIndex(item => item.key === page.key);
      if (index === -1) {
        state.openPages.push(page);
      } else {
        Vue.set(state.openPages, index, { ...state.openPages[index], fullPath: page.fullPath });
      }
    },
    CLOSE_PAGE(state, key) {
      state.openPages = state.openPages.filter(page => page.key !== key);
    },
    CLEAR_PAGES(state) {
      state.openPages = [];
    },
    SET_PERMS(state, perms) {
      state.perms = Array.isArray(perms) ? perms : [];
      setPerms(state.perms);
      broadcastSessionEvent('permissions-updated');
    },
    SYNC_USER(state, user) {
      state.userInfo = user || {};
    },
    SYNC_LOGOUT(state) {
      state.token = '';
      state.userInfo = {};
      state.cartCount = 0;
      state.openPages = [];
      state.perms = [];
    },
    SYNC_PERMS(state, perms) {
      state.perms = Array.isArray(perms) ? perms : [];
    },
    LOGOUT(state) {
      state.token = '';
      state.userInfo = {};
      state.cartCount = 0;
      state.openPages = [];
      state.perms = [];
      removeToken();
      removeUser();
      removePerms();
      broadcastSessionEvent('logout');
    }
  },
  actions: {
    logout({ commit }) {
      commit('LOGOUT');
    },
    /** 身份守卫放在 action 里：调用方不必判身份，非顾客也不会发出 /count 请求 */
    refreshCartCount({ commit, getters }) {
      if (getters.userType !== U_TYPE_CUSTOMER) {
        commit('SET_CART_COUNT', 0);
        return;
      }
      getCartCount()
        .then(res => commit('SET_CART_COUNT', res.daoResult || 0))
        .catch(() => commit('SET_CART_COUNT', 0));
    }
  }
});
