import Vue from 'vue';
import Vuex from 'vuex';
import { getToken, setToken, removeToken, getUser, setUser, removeUser } from '../utils/auth';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: getToken() || '',
    userInfo: getUser() || {}
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
    LOGOUT(state) {
      state.token = '';
      state.userInfo = {};
      removeToken();
      removeUser();
    }
  },
  actions: {
    logout({ commit }) {
      commit('LOGOUT');
    }
  }
});
