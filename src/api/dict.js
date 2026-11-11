import request from '../utils/request';

// 字典类型
export function getDictTypePage(params) {
  return request({ url: '/user/dict/type/page', method: 'get', params });
}
export function addDictType(data) {
  return request({ url: '/user/dict/type', method: 'post', data });
}
export function updateDictType(data) {
  return request({ url: '/user/dict/type', method: 'put', data });
}
export function deleteDictType(id) {
  return request({ url: `/user/dict/type/${id}`, method: 'delete' });
}

// 字典数据
export function getDictDataList(dictType) {
  return request({ url: '/user/dict/data/list', method: 'get', params: { dictType } });
}
export function getDictDataBatch(types) {
  return request({ url: '/user/dict/data/batch', method: 'get', params: { types } });
}
export function addDictData(data) {
  return request({ url: '/user/dict/data', method: 'post', data });
}
export function updateDictData(data) {
  return request({ url: '/user/dict/data', method: 'put', data });
}
export function deleteDictData(id) {
  return request({ url: `/user/dict/data/${id}`, method: 'delete' });
}