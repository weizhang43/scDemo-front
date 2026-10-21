import request from '../utils/request';

export function getPointsSummary() {
  return request({ url: '/user/points/summary', method: 'get' });
}

export function getPointsRecords(params) {
  return request({ url: '/user/points/records', method: 'get', params });
}

export function redeemPoints(optionKey) {
  return request({
    url: '/user/points/redeem',
    method: 'post',
    params: { optionKey }
  });
}
