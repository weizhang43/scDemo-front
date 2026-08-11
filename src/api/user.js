import request from '../utils/request';

export function register(data) {
  return request({
    url: '/user/register',
    method: 'post',
    data
  });
}

export function login(data) {
  const params = new URLSearchParams();
  params.append('uName', data.uName);
  params.append('password', data.password);
  if (data.uType !== undefined && data.uType !== null) {
    params.append('uType', data.uType);
  }
  return request({
    url: '/user/login',
    method: 'post',
    data: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

export function sendSmsCode(phone) {
  const params = new URLSearchParams();
  params.append('phone', phone);
  return request({
    url: '/user/sendSmsCode',
    method: 'post',
    data: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

export function sendEmailCode(email) {
  const params = new URLSearchParams();
  params.append('email', email);
  return request({
    url: '/user/sendEmailCode',
    method: 'post',
    data: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

export function resetPassword(data) {
  const params = new URLSearchParams();
  params.append('phone', data.phone);
  params.append('code', data.code);
  params.append('newPassword', data.newPassword);
  return request({
    url: '/user/resetPassword',
    method: 'post',
    data: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

export function getUserList(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  });
}

export function getUserDetail(id) {
  return request({
    url: `/user/detail/${id}`,
    method: 'get'
  });
}

export function updateUserProfile(data) {
  return request({
    url: '/user/profile',
    method: 'put',
    data
  });
}

// 当前登录用户自助：身份由后端从 X-User-Id 取，不传 uId
export function getMyProfile() {
  return request({
    url: '/user/me/profile',
    method: 'get'
  });
}

export function updateMyProfile(data) {
  return request({
    url: '/user/me/profile',
    method: 'put',
    data
  });
}

export function exportUser(params) {
  return request({
    url: '/user/export',
    method: 'get',
    params,
    responseType: 'blob'
  });
}

export function parseImageText(file, clientType) {
  const form = new FormData();
  form.append('file', file);
  form.append('clientType', clientType);
  return request({
    url: '/user/parseImage',
    method: 'post',
    data: form,
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export function generateImage(message, clientType) {
  return request({
    url: '/user/generateImage',
    method: 'get',
    params: { message, clientType },
    timeout: 60000
  });
}
