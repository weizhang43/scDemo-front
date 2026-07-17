import Vue from 'vue';
import VueRouter from 'vue-router';
import { getToken } from '../utils/auth';

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
        path: 'products',
        name: 'ProductList',
        component: () => import('../views/product/ProductList.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('../views/product/ProductDetail.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('../views/order/OrderList.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'order/:id',
        name: 'OrderDetail',
        component: () => import('../views/order/OrderDetail.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'profile',
        name: 'UserDetail',
        component: () => import('../views/user/UserDetail.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('../views/user/UserList.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'user/:id/address',
        name: 'UserAddress',
        component: () => import('../views/user/UserAddress.vue'),
        meta: { requiresAuth: true }
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
  if (to.meta.requiresAuth && !hasToken) {
    next('/login');
  } else if ((to.path === '/login' || to.path === '/register') && hasToken) {
    next('/products');
  } else {
    next();
  }
});

export default router;
