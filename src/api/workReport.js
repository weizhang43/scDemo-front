import request from '../utils/request';

// 分页查询（type: 1-日报 2-周报）
export function getReportPage(params) {
  return request({
    url: '/user/workReport/page',
    method: 'get',
    params
  });
}

export function getReportDetail(reportId) {
  return request({
    url: `/user/workReport/${reportId}`,
    method: 'get'
  });
}

// 新增日报/周报，同类型一天只能新增一次
export function addReport(data) {
  return request({
    url: '/user/workReport',
    method: 'post',
    data
  });
}

// 日报默认内容模板（含当日 git 提交统计）
export function getDailyTemplate() {
  return request({
    url: '/user/workReport/dailyTemplate',
    method: 'get'
  });
}

// 周报默认内容模板（含本周 git 提交与 GitLab 合并 MR 统计）
export function getWeeklyTemplate(title) {
  return request({
    url: '/user/workReport/weeklyTemplate',
    method: 'get',
    params: { title }
  });
}

export function updateReport(data) {
  return request({
    url: '/user/workReport',
    method: 'put',
    data
  });
}

export function deleteReport(reportId) {
  return request({
    url: `/user/workReport/${reportId}`,
    method: 'delete'
  });
}

// 将报告内容发送到指定邮箱
export function sendReport(reportId, email) {
  return request({
    url: '/user/workReport/send',
    method: 'post',
    params: { reportId, email }
  });
}
