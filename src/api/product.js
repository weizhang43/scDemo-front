import request from '../utils/request';

export function queryProduct(params) {
  return request({
    url: '/product/queryProduct',
    method: 'get',
    params
  });
}

export function pageQuery(params) {
  return request({
    url: '/product/pageQuery',
    method: 'get',
    params
  });
}

export function addProduct(data) {
  return request({
    url: '/product/add',
    method: 'post',
    data
  });
}

export function deductStock(products) {
  return request({
    url: '/product/deductStock',
    method: 'post',
    data: products
  });
}

export function getProductById(id) {
  return request({
    url: `/product/${id}`,
    method: 'get'
  });
}

export function likeProduct(id) {
  return request({
    url: `/product/like/${id}`,
    method: 'post'
  });
}

export function updateProduct(id, data) {
  return request({
    url: '/product',
    method: 'put',
    data: { pId: id, ...data }
  });
}

export function getProductList() {
  return request({
    url: '/product/list',
    method: 'get'
  });
}

export function exportProduct(params) {
  return request({
    url: '/product/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}

export function exportProductAsync(params) {
  return request({
    url: '/product/export/async',
    method: 'get',
    params
  });
}

export function getExportStatus(taskId) {
  return request({
    url: `/product/export/status/${taskId}`,
    method: 'get'
  });
}

export function cancelExport(taskId) {
  return request({
    url: `/product/export/cancel/${taskId}`,
    method: 'get'
  });
}

export function getExportDownloadUrl(taskId) {
  return `/product/export/download/${taskId}`;
}

export function downloadExportFile(taskId) {
  return request({
    url: `/product/export/download/${taskId}`,
    method: 'get',
    responseType: 'blob'
  });
}
