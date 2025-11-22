// src/router/routes.js
const routes = [
  {
    path: '/',
    redirect: '/login',
  },

  {
    path: '/login',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/LoginPage.vue') }],
  },

  {
    path: '/signup',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/SignUp.vue') }],
  },

  {
    path: '/home',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/HomePage.vue') }],
    meta: { requiresAuth: true },
  },

  {
    path: '/register-trip',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/RegisterTrip.vue') }],
    meta: { requiresAuth: true },
  },

  {
    path: '/statistics',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/TheStatistics.vue') }],
    meta: { requiresAuth: true },
  },

  {
    path: '/rankings',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/TheRankings.vue') }],
    meta: { requiresAuth: true },
  },

  {
    path: '/profile',
    component: () => import('src/layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('src/pages/UserProfile.vue') }],
    meta: { requiresAuth: true },
  },

  // Rota de Erro 404 (Sempre em último)
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/pages/ErrorNotFound.vue'),
  },
]

export default routes
