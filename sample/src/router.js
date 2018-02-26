import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import About from './views/About.vue'

Vue.use(Router)

export default new Router({
  mode: 'history', // Required for Adal library
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/secret',
      name: 'secret',
      component: About,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/admin',
      name: 'admin',
      component: About,
      meta: {
        requireAuth: true,
        requireRoles: [ // Much match at least one of these roles
          'TheMan',
          'Admin'
        ]
      }
    }
  ]
})
