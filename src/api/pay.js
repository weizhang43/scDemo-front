import request from '../utils/request';

/** 创建支付单：返回 payNo / transactionId / cashierUrl */
export function createPay(oId, channel) {
  return request({
    url: '/order/pay/create',
    method: 'post',
    data: { oId, channel }
  });
}

/** 轮询支付单状态：0 待支付 1 成功 2 失败 3 已关闭 4 待退款 5 已退款 */
export function getPayStatus(payNo) {
  return request({
    url: `/order/pay/status/${payNo}`,
    method: 'get'
  });
}

/** 收银台：读取网关交易单（金额/摘要/状态） */
export function getCashierTxn(transactionId) {
  return request({
    url: `/pay/txn/${transactionId}`,
    method: 'get'
  });
}

/** 收银台：模拟支付结果 SUCCESS / FAIL，触发网关异步回调 */
export function simulatePay(transactionId, result) {
  return request({
    url: '/pay/simulate',
    method: 'post',
    data: { transactionId, result }
  });
}
