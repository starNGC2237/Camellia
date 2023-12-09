export const constantRoutes = [
  {
    path: '/',
    redirect: '/talk',
  },
  {
    path: '/talk',
    component: () => import('@/pages/appTalk.vue'),
  },
]
