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
    component: () => import('@/views/errorPage/404'),
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
    children: [
      {
        path: 'settings',
        component: () => import('@/views/accountSetting/'),
        name: 'AccountSetting',
        meta: { title: 'account_setting' }
      }
    ]
  },
  {
    path: '/',
    component: () => import('@/layout/'),
    redirect: '/dashboard',
    meta: { 
      isLeaf: true
    },
    children: [
      {
        path: 'dashboard',
        component: () => import('@/views/dashboard/'),
        name: 'Dashboard',
        meta: { title: 'dashboard', icon: 'dashboard', permission: 'DASHBOARD' }
      }
    ]
  },
  {
    path: '/system',
    component: () => import('@/layout/'),
    redirect: '/system/log',
    meta: {
      title: 'system',
      icon: 'setting',
      isLeaf: true
    },
    children: [
      {
        path: 'setting',
        component: () => import('@/views/system/setting/'),
        name: 'Setting',
        meta: { title: 'setting', icon: 'setting2', permission: 'SYSTEM_CONFIG' }
      },
      {
        path: 'log',
        component: () => import('@/views/system/log/'),
        name: 'Log',
        meta: { title: 'log', icon: 'log', permission: 'SYSTEM_LOG' }
      }
    ]
  },
  {
    path: '/personnel',
    component: () => import('@/layout/'),
    redirect: '/personnel/staffDep',
    meta: {
      title: 'personnel',
      icon: 'peoples',
      isLeaf: true
    },
    children: [
      {
        path: 'staff_dep',
        component: () => import('@/views/staffDep/'),
        name: 'StaffDep',
        meta: { title: 'staff_dep', icon: 'tree', permission: 'STAFF_DEPT_VIEW' }
      },
      {
        path: 'admin_role',
        component: () => import('@/views/adminRole/'),
        name: 'AdminRole',
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
