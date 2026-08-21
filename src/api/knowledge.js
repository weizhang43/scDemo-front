import request from '../utils/request';

// 新增知识点
export function addKnowledge(data) {
  return request({
    url: '/user/knowledge',
    method: 'post',
    data
  });
}

// 下一题，currentId 为当前题 id，首次不传；tag 为标签筛选
export function getNextKnowledge(currentId, tag) {
  return request({
    url: '/user/knowledge/next',
    method: 'get',
    params: { currentId, tag }
  });
}

// 按关键字搜索题干（自动补全），tag 为标签筛选
export function searchKnowledge(keyword, tag) {
  return request({
    url: '/user/knowledge/search',
    method: 'get',
    params: { keyword, tag }
  });
}

// 按 id 取题，用于恢复上次浏览位置
export function getKnowledgeById(id) {
  return request({
    url: `/user/knowledge/${id}`,
    method: 'get'
  });
}

// 上一题，currentId 为当前题 id；tag 为标签筛选
export function getPrevKnowledge(currentId, tag) {
  return request({
    url: '/user/knowledge/prev',
    method: 'get',
    params: { currentId, tag }
  });
}

// 查看答案，同时记录查看进度
export function viewKnowledge(id) {
  return request({
    url: `/user/knowledge/view/${id}`,
    method: 'post'
  });
}

// 切换收藏
export function favoriteKnowledge(id) {
  return request({
    url: `/user/knowledge/favorite/${id}`,
    method: 'post'
  });
}

// 忽略（逻辑删除）
export function ignoreKnowledge(id) {
  return request({
    url: `/user/knowledge/ignore/${id}`,
    method: 'post'
  });
}

// 添加笔记
export function addKnowledgeNote(id, content) {
  return request({
    url: `/user/knowledge/${id}/note`,
    method: 'post',
    data: { content }
  });
}

// 查询笔记列表
export function getKnowledgeNotes(id) {
  return request({
    url: `/user/knowledge/${id}/notes`,
    method: 'get'
  });
}
