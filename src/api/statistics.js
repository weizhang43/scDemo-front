import request from '../utils/request';

export function getProductTypeCount() {
  return request({
    url: '/product/statistics/typeCount',
    method: 'get'
  });
}

export function getTypeSales() {
  return request({
    url: '/order/statistics/typeSales',
    method: 'get'
  });
}

export function getMonthlySales() {
  return request({
    url: '/order/statistics/monthlySales',
    method: 'get'
  });
}
