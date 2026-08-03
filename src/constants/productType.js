export const PRODUCT_TYPE_OPTIONS = [
  { value: 1, label: '食品饮品' },
  { value: 2, label: '电子产品' },
  { value: 3, label: '服装饰品' },
  { value: 4, label: '家用电器' },
  { value: 5, label: '汽车' },
  { value: 6, label: '厨房用品' },
  { value: 7, label: '其他' }
];

export function productTypeLabel(code) {
  const found = PRODUCT_TYPE_OPTIONS.find(o => o.value === Number(code));
  return found ? found.label : '其他';
}
