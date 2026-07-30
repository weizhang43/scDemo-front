import Vue from 'vue';
import VueRouter from 'vue-router';
import { getToken, getUser } from '../utils/auth';
import { canAccess, landingFor } from './menuConfig';

Vue.use(VueRouter);

const routes = [
  { path: '/', redirect: '/login' },
  {
    path: '/login',
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
    path: '/',
    component: () => import('../layout/Layout.vue'),
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/home/Home.vue'),
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
        path: 'gallery',
        name: 'ProductGallery',
        component: () => import('../views/product/ProductGallery.vue'),
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
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('../views/order/OrderDetail.vue'),
        meta: { requiresAuth: true, types: [1] }
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
        meta: { requiresAuth: true, types: [2] }
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
      },
      {
        path: 'logs',
        name: 'LogList',
        component: () => import('../views/system/LogList.vue'),
        meta: { requiresAuth: true, types: [3] }
      },
      {
        path: 'notices',
        name: 'NoticeList',
        component: () => import('../views/system/NoticeList.vue'),
        meta: { requiresAuth: true, types: [3] }
      }
    ]
  }
];

const router = new VueRouter({
  mode: 'hash',
  routes
});

router.beforeEach((to, from, next) => {
  const hasToken = getToken();
  const uType = (getUser() || {}).uType;
  if (to.meta.requiresAuth && !hasToken) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && hasToken) {
    next(landingFor(uType));
  } else if (hasToken && !canAccess(uType, to.meta.types)) {
    next(landingFor(uType));
  } else {
    next();
  }
});

export default router;
