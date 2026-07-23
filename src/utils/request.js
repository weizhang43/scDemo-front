import axios from 'axios';
import { Message } from 'element-ui';
import { getToken, clearAll } from './auth';
import router from '../router';

const service = axios.create({
  baseURL: '',
  timeout: 30000
});

service.interceptors.request.use(
  config => {
    const token = getToken();
    if (token) {
      config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
  },
  error => Promise.reject(error)
);

service.interceptors.response.use(
  response => {
    if (response.config && response.config.responseType === 'blob') {
      const disposition = response.headers && response.headers['content-disposition'];
      let filename = '';
      if (disposition) {
        const match = disposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/i);
        if (match) {
          try { filename = decodeURIComponent(match[1].replace(/^"|"$/g, '')); } catch (e) { filename = match[1]; }
        }
      }
      return { blob: response.data, filename };
    }
    const res = response.data;
    if (res && typeof res === 'object' && 'code' in res) {
      if (res.code === 200) {
        return res;
      }
      Message.error(res.msg || '请求失败');
      return Promise.reject(new Error(res.msg || '请求失败'));
    }
    return res;
  },
  error => {
    const status = error.response && error.response.status;
    const msg = error.response && error.response.data && error.response.data.msg;
    if (status === 401) {
      clearAll();
      Message.error(msg || '登录已过期，请重新登录');
      router.push('/login');
    } else {
      Message.error(msg || error.message || '网络错误');
    }
    return Promise.reject(error);
  }
);

export default service;
