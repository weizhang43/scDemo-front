import request from '../utils/request';

/** 秒杀活动分页列表，pId 非空时只看某个商品 */
export function seckillPageQuery(params) {
  return request({
    url: '/product/seckill/pageQuery',
    method: 'get',
    params
  });
}

/** 顾客侧：进行中 + 即将开始的秒杀活动，带剩余名额 */
export function activeSeckillList() {
  return request({
    url: '/product/seckill/active',
    method: 'get'
  });
}

export function getSeckillDetail(id) {
  return request({
    url: `/product/seckill/detail/${id}`,
    method: 'get'
  });
}

/** 发布秒杀活动：{ pId, seckillPrice, seckillStock, startTime, endTime } */
export function createSeckill(data) {
  return request({
    url: '/product/seckill',
    method: 'post',
    data
  });
}

/** 取消秒杀活动（置为已取消，不删行） */
export function cancelSeckill(id) {
  return request({
    url: `/product/seckill/${id}`,
    method: 'delete'
  });
}
