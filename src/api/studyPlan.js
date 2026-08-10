import request from '../utils/request';

// 分页查询学习计划
export function getPlanPage(params) {
  return request({
    url: '/user/studyPlan/page',
    method: 'get',
    params
  });
}

export function getPlanDetail(planId) {
  return request({
    url: `/user/studyPlan/${planId}`,
    method: 'get'
  });
}

// 发布计划，同一计划日期只能发布一条
export function addPlan(data) {
  return request({
    url: '/user/studyPlan',
    method: 'post',
    data
  });
}

export function updatePlan(data) {
  return request({
    url: '/user/studyPlan',
    method: 'put',
    data
  });
}

export function deletePlan(planId) {
  return request({
    url: `/user/studyPlan/${planId}`,
    method: 'delete'
  });
}

// 标记计划为已完成
export function completePlan(planId) {
  return request({
    url: '/user/studyPlan/complete',
    method: 'post',
    params: { planId }
  });
}
