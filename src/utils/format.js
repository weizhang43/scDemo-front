/* 通用格式化与状态映射：多个订单/售后页面共用，避免各页重复定义 */

export function formatTime(time) {
  if (!time) return '-';
  const d = new Date(time);
  if (isNaN(d.getTime())) return String(time);
  const pad = n => (n < 10 ? '0' + n : n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export function formatAmount(amount) {
  if (amount === null || amount === undefined || amount === '') return '0.00';
  const num = Number(amount);
  if (isNaN(num)) return '0.00';
  return num.toFixed(2);
}

/* 截取 yyyy-MM-dd */
export function formatDate(d) {
  if (!d) return '';
  const s = String(d);
  return s.length >= 10 ? s.substring(0, 10) : s;
}

/* 订单状态（OrderPay 的「待签收」文案是买家视角特例，不走这里） */
export const ORDER_STATUS_MAP = {
  '-1': { label: '已取消', type: 'info' },
  '0': { label: '待支付', type: 'warning' },
  '1': { label: '待发货', type: 'primary' },
  '3': { label: '已发货', type: '' },
  '2': { label: '已完成', type: 'success' }
};

export const AFTERSALE_STATUS_MAP = {
  '0': { label: '待审核', type: 'warning' },
  '1': { label: '退款中', type: 'primary' },
  '2': { label: '已退款', type: 'success' },
  '3': { label: '已拒绝', type: 'danger' },
  '4': { label: '已取消', type: 'info' }
};

export function statusLabel(map, status) {
  return (map[status] || {}).label || '未知';
}

export function statusTagType(map, status) {
  return (map[status] || {}).type || 'info';
}
