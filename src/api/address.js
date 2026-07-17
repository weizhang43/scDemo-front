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
