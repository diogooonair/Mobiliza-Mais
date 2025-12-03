// src/router/index.js
import { defineRouter } from '#q-app/wrappers'
import {
  createRouter,
  createMemoryHistory,
  createWebHistory,
  createWebHashHistory,
} from 'vue-router'
import routes from './routes'
import { getUser } from 'stores/APICalls.js'


export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    history: createHistory(process.env.VUE_ROUTER_BASE),
  })

  // Guard global de navegação (Proteção de rotas)
  Router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

    let currentUser = null
    try {
      const { user, error } = await getUser()
      if (!error) currentUser = user
    } catch (err) {
      console.error('Error getting current user:', err)
    }

    if (requiresAuth && !currentUser) {
      next('/login')
    } else if ((to.path === '/login' || to.path === '/signup') && currentUser) {
      next('/home')
    } else {
      next()
    }
  })

  return Router
})
