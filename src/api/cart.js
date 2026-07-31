import request from '../utils/request';

/** 加入购物车。uId 由后端从 X-User-Id 取，前端不传 */
export function addToCart(data) {
  return request({
    url: '/order/cart/add',
    method: 'post',
    data
  });
}

/** 购物车列表，价格与库存由后端实时回源，effectivePrice 即下单要回传的 expectedPrice */
export function getCartList() {
  return request({
    url: '/order/cart/list',
    method: 'get'
  });
}

export function updateCartQuantity(data) {
  return request({
    url: '/order/cart/quantity',
    method: 'put',
    data
  });
}

export function deleteCartItem(pId) {
  return request({
    url: `/order/cart/${pId}`,
    method: 'delete'
  });
}

/** 批量删除（结算成功后清车）。按商品ID删除，幂等，重试无害 */
export function batchDeleteCart(pIds) {
  return request({
    url: '/order/cart/batchDelete',
    method: 'post',
    data: { pIds }
  });
}

/** 购物车条目数（商品种类数），导航角标用 */
export function getCartCount() {
  return request({
    url: '/order/cart/count',
    method: 'get'
  });
}
