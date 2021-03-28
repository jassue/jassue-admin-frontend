import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

export const constantRouterMap = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/'),
    hidden: true
  },
  {
    path: '/404',
    name: 'Page404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  }
]

export const asyncRouterMap = [
  {
    path: '/redirect',
    component: () => import('@/layout/'),
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: () => import('@/views/redirect/')
      }
    ]
  },
  {
    path: '/account',
    component: () => import('@/layout/'),
    hidden: true,
    children: [{
      path: 'settings',
      component: () => import('@/views/account-setting/'),
      name: 'AccountSetting',
      meta: { title: 'account_setting' }
    }]
  },
  {
    path: '/',
    component: () => import('@/layout/'),
    redirect: '/dashboard',
    meta: { permission: 'DASHBOARD' },
    children: [{
      path: 'dashboard',
      component: () => import('@/views/dashboard/'),
      name: 'Dashboard',
      meta: { title: 'dashboard', icon: 'dashboard', permission: 'DASHBOARD' }
    }]
  },
  {
    path: '/personnel',
    component: () => import('@/layout/'),
    redirect: '/personnel/staff_dep',
    name: 'Personnel',
    meta: {
      title: 'personnel',
      icon: 'peoples'
    },
    children: [
      {
        path: 'staff_dep',
        component: () => import('@/views/staff_dep/'),
        name: 'StaffDep',
        meta: { title: 'staff_dep', icon: 'tree', permission: 'STAFF_DEPT_VIEW' }
      },
      {
        path: 'admin_role',
        component: () => import('@/views/roles/List'),
        name: 'RoleList',
        meta: { title: 'admins', icon: 'user', permission: 'ADMIN_ROLE_VIEW' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new VueRouter({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})

const router = new VueRouter({
  routes: constantRouterMap
})

export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
