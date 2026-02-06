import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import Landing from '@/views/Landing.vue';

import { useNotify } from '@/composables/useNotify';

var HomeRoute;

var isAuthenticated;

if (localStorage.getItem('token') == null) {
  isAuthenticated = false;
} else {
  isAuthenticated = true
}

if (isAuthenticated) {
  HomeRoute = {
    path: '/',
    name: 'Home',
    component: Home,
    alias: '/home'
  };
} else {
  HomeRoute = {
    path: '/',
    name: 'Landing',
    component: Landing,
    alias: '/landing'
  }
}

var routes;

routes = [

  HomeRoute,

  {
    path: '/login',
    name: 'Login',
    component: function () {
      return import("@/views/Login.vue");
    },
    meta: { requiresGuest: true, }
  },
  {
    path: '/:pathMatch(.*)*',
    name: '404',
    component: function () {
      return import("@/views/404.vue");
    },
  },

  {
    path: "/account",
    name: "Account",
    component: () => {
      return import("@/views/Account.vue")
    },
    meta: { requiresAuth: true }
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

// Add the router guard
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresGuest) && isAuthenticated) {
    next({ name: 'Home' });
  } else if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router