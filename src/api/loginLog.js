import request from '../utils/request';

export function getLoginLogPage(params) {
  return request({ url: '/user/loginLog/page', method: 'get', params });
}