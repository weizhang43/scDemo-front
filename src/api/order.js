import request from '../utils/request';

export function queryOrder(params) {
  return request({
    url: '/order/queryOrder',
    method: 'get',
    params
  });
}

export function orderStatusCount(params) {
  return request({
    url: '/order/statusCount',
    method: 'get',
    params
  });
}

export function placeOrderV2(payload) {
  return request({
    url: '/order/placeOrderV2',
    method: 'post',
    data: payload
  });
}

/** 秒杀下单：立即返回 PENDING，需轮询 seckillResult 拿终态 */
export function seckill(payload) {
  return request({
    url: '/order/seckill',
    method: 'post',
    data: payload
  });
}

/** 轮询秒杀结果：PENDING / SUCCESS / FAILED / NONE */
export function seckillResult(uId, activityId) {
  return request({
    url: '/order/seckill/result',
    method: 'get',
    params: { uId, activityId }
  });
}

export function getOrderById(id) {
  return request({
    url: `/order/${id}`,
    method: 'get'
  });
}

export function updateOrderStatus(id, orderStatus) {
  return request({
    url: '/order/updateStatus',
    method: 'post',
    params: { id, orderStatus }
  });
}

/** 商家发货：填写快递公司与单号，订单 1(已支付)→3(已发货) */
export function shipOrder(id, shippingCompany, trackingNo) {
  return request({
    url: '/order/ship',
    method: 'post',
    params: { id, shippingCompany, trackingNo }
  });
}

export function deleteOrder(id) {
  return request({
    url: `/order/${id}`,
    method: 'delete'
  });
}

export function exportOrder(params) {
  return request({
    url: '/order/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}
