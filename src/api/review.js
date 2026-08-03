import request from '../utils/request';

/** 发表评价：{ oId, pId, rating, content }，身份走请求头，不传 uId */
export function submitReview(data) {
  return request({
    url: '/order/review',
    method: 'post',
    data
  });
}

/** 某商品的评价列表，daoResult = { avgRating, total, records } */
export function getProductReviews(pId, params) {
  return request({
    url: `/order/review/product/${pId}`,
    method: 'get',
    params
  });
}

/** 我的历史评价 */
export function getMyReviews(params) {
  return request({
    url: '/order/review/mine',
    method: 'get',
    params
  });
}

/** 某订单已评过的商品 pId 列表 */
export function getOrderReviewedPIds(oId) {
  return request({
    url: `/order/review/order/${oId}`,
    method: 'get'
  });
}
