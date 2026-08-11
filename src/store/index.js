import Vue from 'vue';
import Vuex from 'vuex';
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/auth';
import { menusForType, normalizeType, U_TYPE_CUSTOMER } from '../router/menuConfig';
import { getCartCount } from '../api/cart';

Vue.use(Vuex);

const PERMS_KEY = 'sc_perms';

function getPerms() {
  try {
    return JSON.parse(localStorage.getItem(PERMS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

export default new Vuex.Store({
  state: {
    token: getToken() || '',
    userInfo: getUser() || {},
    cartCount: 0,
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
      state.token = token;
      if (token) {
        setToken(token);
      } else {
        removeToken();
      }
    },
    SET_USER(state, user) {
      state.userInfo = user || {};
      if (user) {
        setUser(user);
      } else {
        removeUser();
      }
    },
    SET_CART_COUNT(state, n) {
      state.cartCount = Number(n) || 0;
    },
    SET_PERMS(state, perms) {
      state.perms = perms || [];
      localStorage.setItem(PERMS_KEY, JSON.stringify(state.perms));
    },
    LOGOUT(state) {
      state.token = '';
      state.userInfo = {};
      // 不归零的话，同一标签页里顾客登出后商家登入会继承一个陈旧角标
      state.cartCount = 0;
      state.perms = [];
      removeToken();
      removeUser();
      localStorage.removeItem(PERMS_KEY);
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
