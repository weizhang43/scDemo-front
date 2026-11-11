import request from '../utils/request';

export function getRegionTree() {
  return request({ url: '/user/region/tree', method: 'get' });
}

export function getRegionChildren(parentId) {
  return request({ url: '/user/region/children', method: 'get', params: { parentId } });
}

export function addRegion(data) {
  return request({ url: '/user/region', method: 'post', data });
}

export function updateRegion(id, data) {
  return request({ url: `/user/region/${id}`, method: 'put', data });
}

export function deleteRegion(id) {
  return request({ url: `/user/region/${id}`, method: 'delete' });
}

export function initRegion() {
  return request({ url: '/user/region/init', method: 'post' });
}