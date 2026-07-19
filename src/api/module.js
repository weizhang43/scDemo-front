import request from '../utils/request';

export function getModuleList() {
  return request({
    url: '/user/module/list',
    method: 'get'
  });
}

export function getModuleTree() {
  return request({
    url: '/user/module/tree',
    method: 'get'
  });
}

export function addModule(data) {
  return request({
    url: '/user/module',
    method: 'post',
    data
  });
}

export function updateModule(data) {
  return request({
    url: '/user/module',
    method: 'put',
    data
  });
}

export function deleteModule(id) {
  return request({
    url: `/user/module/${id}`,
    method: 'delete'
  });
}
