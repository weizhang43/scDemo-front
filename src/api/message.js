import request from '../utils/request';

export function getMessagePage(params) {
  return request({ url: '/user/message/page', method: 'get', params });
}

export function getUnreadCount() {
  return request({ url: '/user/message/unread-count', method: 'get' });
}

export function markRead(id) {
  return request({ url: `/user/message/${id}/read`, method: 'post' });
}

export function markAllRead() {
  return request({ url: '/user/message/read-all', method: 'post' });
}
