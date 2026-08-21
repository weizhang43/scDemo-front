import Vue from 'vue';
import VueRouter from 'vue-router';
import { getToken, getUser } from '../utils/auth';
import { canAccess, landingFor } from './menuConfig';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/portal' },
  {
    path: '/portal',
    name: 'RolePortal',
    component: () => import('../views/login/RolePortal.vue'),
    meta: { public: true }
  },
  { path: '/login', redirect: '/portal' },
  {
    path: '/login/:role',
    name: 'Login',
    component: () => import('../views/login/Login.vue'),
    meta: { public: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/register/Register.vue'),
    meta: { public: true }
  },
  {
    path: '/forgot-password',
    name: 'ForgotPassword',
    component: () => import('../views/login/ForgotPassword.vue'),
    meta: { public: true }
  },
  {
    path: '/customer',
    name: 'CustomerChat',
    component: () => import('../views/customer/CustomerChat.vue'),
    meta: { public: true }
  },
  {
    path: '/browse',
    name: 'GuestGallery',
    component: () => import('../views/product/GuestGallery.vue'),
    meta: { public: true }
  },
  {
    path: '/personal-work',
    name: 'PersonalWork',
    component: () => import('../views/work/PersonalWork.vue'),
    meta: { public: true }
  },
  {
    path: '/knowledge',
    name: 'KnowledgePage',
    component: () => import('../views/work/KnowledgePage.vue'),
    meta: { public: true }
  },
  {
    path: '/jobs',
    name: 'JobSchedulerPage',
    component: () => import('../views/work/JobSchedulerPage.vue'),
    meta: { public: true }
  },
  {
    path: '/work-report/add',
    name: 'WorkReportAdd',
    component: () => import('../views/work/WorkReportAdd.vue'),
    meta: { public: true }
  },
  {
    path: '/work-report/:id',
    name: 'WorkReportDetail',
    component: () => import('../views/work/WorkReportDetail.vue'),
    meta: { public: true }
  },
  {
    path: '/',
    component: () => import('../layout/Layout.vue'),
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/home/HomeEntry.vue'),
        meta: { requiresAuth: true, types: [1, 2, 3] }
      },
      {
        path: 'products',
        name: 'ProductList',
        component: () => import('../views/product/ProductList.vue'),
        meta: { requiresAuth: true, types: [1] }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('../views/product/ProductDetail.vue'),
        meta: { requiresAuth: true, types: [1] }
      },
      {
        path: 'seckills',
        name: 'SeckillActivityList',
        component: () => import('../views/product/SeckillActivityList.vue'),
        meta: { requiresAuth: true, types: [1] }
      },
      {
        path: 'categories',
        name: 'CategoryManage',
        component: () => import('../views/product/CategoryManage.vue'),
        meta: { requiresAuth: true, types: [1, 3] }
      },
      {
        path: 'coupon-templates',
        name: 'CouponTemplateList',
        component: () => import('../views/product/CouponTemplateList.vue'),
        meta: { requiresAuth: true, types: [1, 3] }
      },
      {
        path: 'coupons',
        name: 'CouponCenter',
        component: () => import('../views/product/CouponCenter.vue'),
        meta: { requiresAuth: true, types: [2] }
      },
      {
        path: 'gallery',
        name: 'ProductGallery',
        component: () => import('../views/product/ProductGallery.vue'),
        meta: { requiresAuth: true, types: [2] }
      },
      {
        path: 'seckill',
        name: 'SeckillZone',
        component: () => import('../views/product/SeckillZone.vue'),
        meta: { requiresAuth: true, types: [2] }
      },
      {
        path: 'product-buy/:id',
        name: 'ProductBuy',
        component: () => import('../views/product/ProductBuy.vue'),
        meta: { requiresAuth: true, types: [2] }
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('../views/order/OrderList.vue'),
        meta: { requiresAuth: true, types: [1] }
      },
      {
        path: 'aftersale',
        name: 'AfterSaleList',
        component: () => import('../views/order/AfterSaleList.vue'),
        meta: { requiresAuth: true, types: [1] }
      },
      {
        path: 'stats',
        component: () => import('../views/statistics/StatsLayout.vue'),
        redirect: '/stats/product-type',
        children: [
          {
            path: 'product-type',
            name: 'ProductTypeStats',
            component: () => import('../views/statistics/ProductTypeStats.vue'),
            meta: { requiresAuth: true, types: [1] }
          },
          {
            path: 'type-sales',
            name: 'TypeSalesStats',
            component: () => import('../views/statistics/TypeSalesStats.vue'),
            meta: { requiresAuth: true, types: [1] }
          },
          {
            path: 'monthly-sales',
            name: 'MonthlySalesStats',
            component: () => import('../views/statistics/MonthlySalesStats.vue'),
            meta: { requiresAuth: true, types: [1] }
          }
        ]
      },
      {
        path: 'cart',
        name: 'CartList',
        component: () => import('../views/cart/CartList.vue'),
        meta: { requiresAuth: true, types: [2] }
      },
      {
        path: 'my-orders',
        name: 'MyOrderList',
        component: () => import('../views/order/MyOrderList.vue'),
        meta: { requiresAuth: true, types: [2] }
      },
      {
        path: 'my-aftersale',
        name: 'MyAfterSaleList',
        component: () => import('../views/order/MyAfterSaleList.vue'),
        meta: { requiresAuth: true, types: [2] }
      },
      {
        path: 'my-reviews',
        name: 'MyReviewList',
        component: () => import('../views/review/MyReviewList.vue'),
        meta: { requiresAuth: true, types: [2] }
      },
      {
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('../views/order/OrderDetail.vue'),
        meta: { requiresAuth: true, types: [1, 2] }
      },
      {
        path: 'pay/:id',
        name: 'OrderPay',
        component: () => import('../views/order/OrderPay.vue'),
        meta: { requiresAuth: true, types: [2] }
      },
      {
        path: 'cashier/:transactionId',
        name: 'MockCashier',
        component: () => import('../views/pay/MockCashier.vue'),
        meta: { requiresAuth: true, types: [2] }
      },
      {
        path: 'jobs',
        name: 'JobScheduler',
        component: () => import('../views/system/JobScheduler.vue'),
        meta: { requiresAuth: true, types: [3] }
      },
      {
        path: 'customer-service',
        name: 'CustomerService',
        component: () => import('../views/customer/CustomerServiceEmbed.vue'),
        meta: { requiresAuth: true, types: [1, 2, 3] }
      },
      {
        path: 'my-profile',
        name: 'UserProfile',
        component: () => import('../views/user/UserProfile.vue'),
        meta: { requiresAuth: true, types: [1, 2, 3] }
      },
      {
        path: 'profile',
        name: 'UserDetail',
        component: () => import('../views/user/UserDetail.vue'),
        meta: { requiresAuth: true, types: [1, 2, 3] }
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('../views/user/UserList.vue'),
        meta: { requiresAuth: true, types: [3] }
      },
      {
        path: 'notices',
        name: 'NoticeList',
        component: () => import('../views/system/NoticeList.vue'),
        meta: { requiresAuth: true, types: [3] }
      },
      {
        path: 'logs',
        name: 'LogList',
        component: () => import('../views/system/LogList.vue'),
        meta: { requiresAuth: true, types: [3] }
      },
      {
        path: 'user/:id/address',
        name: 'UserAddress',
        component: () => import('../views/user/UserAddress.vue'),
        meta: { requiresAuth: true, types: [1, 2, 3] }
      }
    ]
  },
  {
    path: '/system',
    component: () => import('../layout/SystemLayout.vue'),
    children: [
      {
        path: 'users',
        name: 'SystemUserList',
        component: () => import('../views/user/UserList.vue'),
        meta: { requiresAuth: true, types: [3] }
      },
      {
        path: 'roles',
        name: 'RoleList',
        component: () => import('../views/system/RoleList.vue'),
        meta: { requiresAuth: true, types: [3] }
      },
      {
        path: 'modules',
        name: 'ModuleList',
        component: () => import('../views/system/ModuleList.vue'),
        meta: { requiresAuth: true, types: [3] }
      }
    ]
  }
];

const router = new VueRouter({
  mode: 'hash',
  routes
});

// 角色选择页、各角色登录页与注册页：已登录用户不应再看到，直接送回其落地页
function isAuthEntry(path) {
  return path === '/portal' || path === '/register' || path.indexOf('/login') === 0;
}

router.beforeEach((to, from, next) => {
  const hasToken = getToken();
  const uType = (getUser() || {}).uType;
  if (to.meta.requiresAuth && !hasToken) {
    next('/portal');
  } else if (isAuthEntry(to.path) && hasToken) {
    next(landingFor(uType));
  } else if (hasToken && !canAccess(uType, to.meta.types)) {
    next(landingFor(uType));
  } else {
    next();
  }
});

export default router;
