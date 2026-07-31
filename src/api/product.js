import request from '../utils/request';

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

/** 上架 / 下架商品，status 1-上架 0-下架 */
export function setShelfStatus(id, status) {
  return request({
    url: `/product/shelf/${id}`,
    method: 'put',
    params: { status }
  });
}

/** 折扣活动分页列表，pId 非空时只看某个商品 */
export function promotionPageQuery(params) {
  return request({
    url: '/product/promotion/pageQuery',
    method: 'get',
    params
  });
}

/** 创建折扣活动：{ pId, discount, startTime, endTime } */
export function createPromotion(data) {
  return request({
    url: '/product/promotion',
    method: 'post',
    data
  });
}

/** 取消折扣活动 */
export function cancelPromotion(id) {
  return request({
    url: `/product/promotion/${id}`,
    method: 'delete'
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

export function uploadProductImage(file) {
  const form = new FormData();
  form.append('file', file);
  return request({
    url: '/product/image/upload',
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000
  });
}
