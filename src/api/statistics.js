import request from '../utils/request';
import { withMerchantScope } from '../utils/merchant-scope';

export function getProductTypeCount(params) {
  return request({
    url: '/product/statistics/typeCount',
    method: 'get',
    params: withMerchantScope(params)
  });
}

export function getTypeSales(params) {
  return request({
    url: '/order/statistics/typeSales',
    method: 'get',
    params: withMerchantScope(params)
  });
}

export function getMonthlySales(params) {
  return request({
    url: '/order/statistics/monthlySales',
    method: 'get',
    params: withMerchantScope(params)
  });
}
