import request from '../utils/request';

// 商品过期预警：三个月内即将过期
export function getExpiringProducts() {
  return request({
    url: '/product/warning/expiring',
    method: 'get'
  });
}

// 商品库存预警：库存低于阈值（默认 100）
export function getLowStockProducts(threshold) {
  return request({
    url: '/product/warning/lowStock',
    method: 'get',
    params: threshold ? { threshold } : {}
  });
}

// 订单超时预警：状态为 0 的订单
export function getTimeoutOrders() {
  return request({
    url: '/order/warning/timeout',
    method: 'get'
  });
}
