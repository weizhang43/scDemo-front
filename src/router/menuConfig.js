export const U_TYPE_MERCHANT = 1;
export const U_TYPE_CUSTOMER = 2;
export const U_TYPE_ADMIN = 3;

export const ROLES = [
  {
    key: 'admin',
    uType: U_TYPE_ADMIN,
    label: '管理员',
    desc: '平台运营与用户管理',
    subtitle: '管理用户、分类、公告与系统日志',
    icon: 'el-icon-s-check',
    accent: '#764ba2',
    accentSoft: 'rgba(118, 75, 162, 0.12)',
    canRegister: false
  },
  {
    key: 'merchant',
    uType: U_TYPE_MERCHANT,
    label: '商家',
    desc: '商品订单与售后管理',
    subtitle: '管理商品、秒杀、订单与售后',
    icon: 'el-icon-s-shop',
    accent: '#e8850e',
    accentSoft: 'rgba(232, 133, 14, 0.12)',
    canRegister: true
  },
  {
    key: 'customer',
    uType: U_TYPE_CUSTOMER,
    label: '顾客',
    desc: '购物下单与售后申请',
    subtitle: '逛商品、抢秒杀、领优惠券',
    icon: 'el-icon-shopping-cart-full',
    accent: '#0f9b8e',
    accentSoft: 'rgba(15, 155, 142, 0.12)',
    canRegister: true
  }
];

export function roleByKey(key) {
  return ROLES.filter(r => r.key === key)[0] || null;
}

export function roleByType(uType) {
  const t = Number(uType);
  return ROLES.filter(r => r.uType === t)[0] || null;
}

export const MENUS = [
  { path: '/home', label: '首页', icon: 'el-icon-s-home', types: [1, 2, 3] },
  { path: '/products', label: '商品管理', icon: 'el-icon-goods', types: [1] },
  { path: '/categories', label: '分类管理', icon: 'el-icon-menu', types: [3] },
  { path: '/seckills', label: '秒杀活动', icon: 'el-icon-alarm-clock', types: [1] },
  { path: '/coupon-templates', label: '优惠券管理', icon: 'el-icon-s-ticket', types: [1] },
  { path: '/orders', label: '订单管理', icon: 'el-icon-s-order', types: [1] },
  { path: '/aftersale', label: '售后管理', icon: 'el-icon-refresh-left', types: [1] },
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
  { path: '/coupons', label: '领券中心', icon: 'el-icon-s-ticket', types: [2] },
  { path: '/cart', label: '购物车', icon: 'el-icon-shopping-cart-2', types: [2] },
  { path: '/my-orders', label: '我的订单', icon: 'el-icon-s-order', types: [2] },
  { path: '/my-aftersale', label: '我的售后', icon: 'el-icon-refresh-left', types: [
      2] },
  { path: '/my-reviews', label: '我的评价', icon: 'el-icon-star-on', types: [2] },
  //{ path: '/my-profile', label: '个人主页', icon: 'el-icon-user', types: [2] },
  { path: '/system/users', label: '用户管理', icon: 'el-icon-s-tools', types: [3], children: [
      { path: '/system/users', label: '用户列表', icon: 'el-icon-user' },
      { path: '/system/roles', label: '角色列表', icon: 'el-icon-s-check' },
      { path: '/system/modules', label: '权限列表', icon: 'el-icon-set-up' }
    ]
  },
  { path: '/notices', label: '通知管理', icon: 'el-icon-bell', types: [3] },
  { path: '/logs', label: '日志管理', icon: 'el-icon-document', types: [3] },
  { path: '/customer-service', label: '智能客服', icon: 'el-icon-service', types: [1, 2, 3] },
  { path: '/admin/jobs', label: '定时任务', icon: 'el-icon-time', types: [3] }
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

export function pageKey(route) {
  return route.path === '/profile' && route.query.id
    ? `${route.path}?id=${route.query.id}`
    : route.path;
}

export function pageTitle(route) {
  const item = MENUS.reduce((found, menu) => found || [menu, ...(menu.children || [])].find(entry => entry.path === route.path), null);
  if (item) return item.label;
  const names = {
    ProductDetail: '商品详情', ProductBuy: '商品详情', OrderDetail: '订单详情',
    OrderPay: '订单支付', MockCashier: '收银台', UserProfile: '个人中心',
    UserDetail: '用户详情', UserAddress: '收货地址', UserList: '用户列表'
  };
  const title = names[route.name] || route.meta.title || '页面';
  return route.params.id ? `${title} #${route.params.id}` : title;
}
