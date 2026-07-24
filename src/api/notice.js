import request from '../utils/request';

// 管理端分页查询
export function getNoticePage(params) {
  return request({
    url: '/user/notice/page',
    method: 'get',
    params
  });
}

// 首页轮播：已发布通知
export function getPublishedNotices() {
  return request({
    url: '/user/notice/list',
    method: 'get'
  });
}

export function getNoticeDetail(noticeId) {
  return request({
    url: `/user/notice/${noticeId}`,
    method: 'get'
  });
}

export function addNotice(data) {
  return request({
    url: '/user/notice',
    method: 'post',
    data
  });
}

export function updateNotice(data) {
  return request({
    url: '/user/notice',
    method: 'put',
    data
  });
}

export function deleteNotice(noticeId) {
  return request({
    url: `/user/notice/${noticeId}`,
    method: 'delete'
  });
}

export function changeNoticeStatus(noticeId, status) {
  return request({
    url: '/user/notice/status',
    method: 'post',
    params: { noticeId, status }
  });
}
