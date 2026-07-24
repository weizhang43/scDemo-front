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

export function placeOrder(products, addPerson) {
  return request({
    url: '/order/placeOrder',
    method: 'post',
    params: { addPerson },
    data: products
  });
}

export function placeOrderV2(payload) {
  return request({
    url: '/order/placeOrderV2',
    method: 'post',
    data: payload
  });
}

export function seckill(payload) {
  return request({
    url: '/order/seckill',
    method: 'post',
    data: payload
  });
}

export function getSeckillResult(uId, pId) {
  return request({
    url: '/order/seckill/result',
    method: 'get',
    params: { uId, pId }
  });
}

export function getOrderById(id) {
  return request({
    url: `/order/${id}`,
    method: 'get'
  });
}

export function getOrderList() {
  return request({
    url: '/order/list',
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
