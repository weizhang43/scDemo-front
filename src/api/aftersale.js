import request from '../utils/request';

export function applyAfterSale(payload) {
  return request({
    url: '/order/aftersale/apply',
    method: 'post',
    data: payload
  });
}

export function cancelAfterSale(id) {
  return request({
    url: `/order/aftersale/cancel/${id}`,
    method: 'post'
  });
}

/** 商家审核：approve=true 同意（发起退款+回补库存），false 拒绝（须填 rejectReason） */
export function auditAfterSale(id, approve, rejectReason) {
  return request({
    url: '/order/aftersale/audit',
    method: 'post',
    params: { id, approve, rejectReason }
  });
}

export function myAfterSaleList(params) {
  return request({
    url: '/order/aftersale/mine',
    method: 'get',
    params
  });
}

export function queryAfterSale(params) {
  return request({
    url: '/order/aftersale/list',
    method: 'get',
    params
  });
}

/** 某订单的售后工单（按钮态用），无工单时 daoResult 为 null */
export function getAfterSaleByOrder(oId) {
  return request({
    url: `/order/aftersale/order/${oId}`,
    method: 'get'
  });
}
