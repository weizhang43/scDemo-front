import request from '../utils/request';

export function getCategoryTree() {
  return request({
    url: '/product/category/tree',
    method: 'get'
  });
}

export function addCategory(data) {
  return request({
    url: '/product/category',
    method: 'post',
    data
  });
}

export function updateCategory(data) {
  return request({
    url: '/product/category',
    method: 'put',
    data
  });
}

export function deleteCategory(id) {
  return request({
    url: `/product/category/${id}`,
    method: 'delete'
  });
}
