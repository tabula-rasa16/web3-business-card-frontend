import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Welcome',
    component: () => import('../views/Welcome.vue')  // 注意这里路径要修改
  },
  {
    path: '/create/:user_id',
    name: 'CreateCard',
    component: () => import('../views/CreateCard.vue')  // 注意这里路径要修改
  },
  {
    path: '/profile/:user_id',
    name: 'Profile',
    component: () => import('../views/Profile.vue')  // 注意这里路径要修改
  },
  {
    path: '/card/:token',
    name: 'CardDisplay',
    component: () => import('../views/CardDisplay.vue')  // 注意这里路径要修改
  },
  {
    path: '/card/shared',
    name: 'SharedCard',
    component: () => import('../views/CardDisplay.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/edit/:user_id',
    name: 'EditCard',
    component: () => import('@/views/EditCard.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 