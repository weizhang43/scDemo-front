import request from '../utils/request';

export function getAddressList(uId) {
  return request({
    url: '/user/address/list',
    method: 'get',
    params: { uId }
  });
}

export function addAddress(data) {
  return request({
    url: '/user/address',
    method: 'post',
    data
  });
}

export function updateAddress(data) {
  return request({
    url: '/user/address',
    method: 'put',
    data
  });
}

export function deleteAddress(aId) {
  return request({
    url: `/user/address/${aId}`,
    method: 'delete'
  });
}

export function setDefaultAddress(aId, uId) {
  const params = new URLSearchParams();
  params.append('aId', aId);
  params.append('uId', uId);
  return request({
    url: '/user/address/default',
    method: 'post',
    data: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

// ===== 当前登录用户自助：uId 由后端从 X-User-Id 取，前端不传 =====

export function getMyAddressList() {
  return request({
    url: '/user/me/address/list',
    method: 'get'
  });
}

export function addMyAddress(data) {
  return request({
    url: '/user/me/address',
    method: 'post',
    data
  });
}

export function updateMyAddress(data) {
  return request({
    url: '/user/me/address',
    method: 'put',
    data
  });
}

export function deleteMyAddress(aId) {
  return request({
    url: `/user/me/address/${aId}`,
    method: 'delete'
  });
}

export function setMyDefaultAddress(aId) {
  const params = new URLSearchParams();
  params.append('aId', aId);
  return request({
    url: '/user/me/address/default',
    method: 'post',
    data: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}
