import request from '../utils/request';
import { withMerchantScope } from '../utils/merchant-scope';

/** 管理端：发布券模板 */
export function createCouponTemplate(data) {
  return request({
    url: '/product/coupon/template',
    method: 'post',
    data
  });
}

/** 管理端：券模板分页 */
export function queryCouponTemplate(params) {
  return request({
    url: '/product/coupon/template/pageQuery',
    method: 'get',
    params: withMerchantScope(params)
  });
}

/** 管理端：停用券模板 */
export function disableCouponTemplate(id) {
  return request({
    url: `/product/coupon/template/${id}`,
    method: 'delete'
  });
}

/** 顾客端：领券中心（带余量与已领标记） */
export function couponCenter() {
  return request({
    url: '/product/coupon/center',
    method: 'get'
  });
}

/** 顾客端：领券 */
export function claimCoupon(templateId) {
  return request({
    url: '/product/coupon/claim',
    method: 'post',
    params: { templateId }
  });
}

/** 顾客端：我的券，status 可选 0未使用/1已锁定/2已使用 */
export function myCoupons(status) {
  return request({
    url: '/product/coupon/mine',
    method: 'get',
    params: status === undefined ? {} : { status }
  });
}

/** 顾客端：结算页可用券，couponAmount 为按该订单额算出的抵扣额 */
export function usableCoupons(orderAmount) {
  return request({
    url: '/product/coupon/usable',
    method: 'get',
    params: { orderAmount }
  });
}
