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

// 顾客首页：我的即将超期订单（下单人取自网关注入的用户名）
export function getMyTimeoutOrders() {
  return request({
    url: '/order/warning/timeout/mine',
    method: 'get'
  });
}

// 顾客首页：销量榜
export function getSalesRank(limit) {
  return request({
    url: '/order/rank/sales',
    method: 'get',
    params: { limit }
  });
}

// 顾客首页：好评榜（按点赞数）
export function getLikeRank(limit) {
  return request({
    url: '/product/rank/likes',
    method: 'get',
    params: { limit }
  });
}

// 顾客首页：上新货物
export function getNewestProducts(limit) {
  return request({
    url: '/product/rank/newest',
    method: 'get',
    params: { limit }
  });
}
