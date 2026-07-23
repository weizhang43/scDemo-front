import request from '../utils/request';

export function getOperationLogPage(params) {
  return request({
    url: '/user/operationLog/page',
    method: 'get',
    params
  });
}

export function exportOperationLog(params) {
  return request({
    url: '/user/operationLog/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}
