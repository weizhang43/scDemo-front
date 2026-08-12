/* 商品域共用小工具：列表页与各弹窗共用 */

/** 折扣率转中文：85 → 8.5 折，90 → 9 折 */
export function discountText(discount) {
  const d = Number(discount) || 0;
  if (!d) return '';
  return `${(d / 10).toFixed(1).replace(/\.0$/, '')} 折`;
}

/** 活动所处阶段。后端返回 'yyyy-MM-dd HH:mm:ss'，替换成 '/' 兼容 Safari 解析 */
export function phaseOf(row) {
  const now = Date.now();
  const start = new Date(String(row.startTime || '').replace(/-/g, '/')).getTime();
  const end = new Date(String(row.endTime || '').replace(/-/g, '/')).getTime();
  if (now < start) return { text: '未开始', type: 'info' };
  if (now > end) return { text: '已结束', type: '' };
  return { text: '进行中', type: 'success' };
}
