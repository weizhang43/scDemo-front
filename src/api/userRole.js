import request from '../utils/request';

export function getUserRoleIds(userId) {
  return request({
    url: '/user/userRole/roleIds',
    method: 'get',
    params: { userId }
  });
}

export function assignUserRoles(userId, roleIds) {
  return request({
    url: '/user/userRole/assignRoles',
    method: 'post',
    params: { userId },
    data: roleIds
  });
}
