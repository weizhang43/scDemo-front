import request from '../utils/request';

export function getRoleList() {
  return request({
    url: '/user/role/list',
    method: 'get'
  });
}

export function addRole(data) {
  return request({
    url: '/user/role',
    method: 'post',
    data
  });
}

export function updateRole(data) {
  return request({
    url: '/user/role',
    method: 'put',
    data
  });
}

export function deleteRole(id) {
  return request({
    url: `/user/role/${id}`,
    method: 'delete'
  });
}

export function getRoleModuleIds(roleId) {
  return request({
    url: '/user/role/moduleIds',
    method: 'get',
    params: { roleId }
  });
}

export function assignRoleModules(roleId, moduleIds) {
  return request({
    url: '/user/role/assignModules',
    method: 'post',
    params: { roleId },
    data: moduleIds
  });
}
