import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import("../views/Home.vue") 
  },
  {
    path: '/try',
    name: 'try',
    component: () => import("../views/Try.vue") 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;