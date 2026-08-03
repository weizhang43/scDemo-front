export const U_TYPE_MERCHANT = 1;
export const U_TYPE_CUSTOMER = 2;
export const U_TYPE_ADMIN = 3;

export const MENUS = [
  { path: '/home', label: '首页', icon: 'el-icon-s-home', types: [1, 2, 3] },
  { path: '/products', label: '商品管理', icon: 'el-icon-goods', types: [1] },
  { path: '/seckills', label: '秒杀活动', icon: 'el-icon-alarm-clock', types: [1] },
  { path: '/orders', label: '订单管理', icon: 'el-icon-s-order', types: [1] },
  {
    path: '/stats', label: '统计报表', icon: 'el-icon-s-data', types: [1],
    children: [
      { path: '/stats/product-type', label: '商品类型统计', icon: 'el-icon-pie-chart' },
      { path: '/stats/type-sales', label: '商品类型销量统计', icon: 'el-icon-s-data' },
      { path: '/stats/monthly-sales', label: '近三个月销量统计', icon: 'el-icon-data-line' }
    ]
  },
  { path: '/gallery', label: '商品列表', icon: 'el-icon-picture-outline', types: [2] },
  { path: '/seckill', label: '限时秒杀', icon: 'el-icon-alarm-clock', types: [2] },
  { path: '/cart', label: '购物车', icon: 'el-icon-shopping-cart-2', types: [2] },
  { path: '/my-orders', label: '我的订单', icon: 'el-icon-s-order', types: [2] },
  { path: '/my-reviews', label: '我的评价', icon: 'el-icon-star-on', types: [2] },
  { path: '/my-profile', label: '个人主页', icon: 'el-icon-user', types: [2] },
  { path: '/customer-service', label: '智能客服', icon: 'el-icon-service', types: [2] },
  { path: '/system/users', label: '用户管理', icon: 'el-icon-s-tools', types: [3] },
  { path: '/notices', label: '通知管理', icon: 'el-icon-bell', types: [3] },
  { path: '/logs', label: '日志管理', icon: 'el-icon-document', types: [3] },
  { path: '/jobs', label: '定时任务', icon: 'el-icon-time', types: [3] }
];

// 本次改动前登录的会话，localStorage 里的 sc_user 没有 uType，按管理员兜底避免空菜单
export function normalizeType(uType) {
  const t = Number(uType);
  return t === 1 || t === 2 || t === 3 ? t : U_TYPE_ADMIN;
}

export function menusForType(uType) {
  const t = normalizeType(uType);
  return MENUS.filter(m => m.types.indexOf(t) > -1);
}

export function canAccess(uType, types) {
  if (!types) return true;
  return types.indexOf(normalizeType(uType)) > -1;
}

export function landingFor(uType) {
  const menus = menusForType(uType);
  return menus.length ? menus[0].path : '/home';
}
