import request from '../utils/request';
import { withMerchantScope } from '../utils/merchant-scope';

// 商品过期预警：三个月内即将过期
export function getExpiringProducts() {
  return request({
    url: '/product/warning/expiring',
    method: 'get',
    params: withMerchantScope()
  });
}

// 商品库存预警：库存低于阈值（默认 100）
export function getLowStockProducts(threshold) {
  return request({
    url: '/product/warning/lowStock',
    method: 'get',
    params: withMerchantScope(threshold ? { threshold } : {})
  });
}

// 订单超时预警：状态为 0 的订单
export function getTimeoutOrders() {
  return request({
    url: '/order/warning/timeout',
    method: 'get',
    params: withMerchantScope()
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

// 工作台概览：今日成交额/单量、待发货、待付款、待处理售后（商家=本店口径，管理员=平台口径）
export function getDashboardOverview() {
  return request({
    url: '/order/statistics/overview',
    method: 'get'
  });
}

// 工作台：近 N 天逐日成交趋势（默认 7 天，无成交日期补 0）
export function getDailySales(days) {
  return request({
    url: '/order/statistics/dailySales',
    method: 'get',
    params: days ? { days } : {}
  });
}

// 管理员驾驶舱：用户总量、按类型构成、今日新增注册数
export function getUserOverview() {
  return request({
    url: '/user/statistics/overview',
    method: 'get'
  });
}
