import Vue from 'vue'
import VueRouter from 'vue-router'
Vue.use(VueRouter)

import Layout from '@/layout/'
import Login from '@/views/login/'
import Page404 from '@/views/error-page/404'

import Redirect from '@/views/redirect/'
import Dashboard from '@/views/dashboard/'
import AccountSetting from '@/views/account-setting/'
import UserList from '@/views/users/List'
import UserProfile from '@/views/users/Profile'
import RoleList from '@/views/roles/List'
import RoleInfo from '@/views/roles/Info'

export const constantRouterMap = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
    hidden: true
  },
  {
    path: '/404',
    name: 'Page404',
    component: Page404,
    hidden: true
  }
]

export const asyncRouterMap = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path*',
        component: Redirect
      }
    ]
  },
  {
    path: '/account',
    component: Layout,
    hidden: true,
    children: [{
      path: 'settings',
      component: AccountSetting,
      name: 'AccountSetting',
      meta: { title: 'account_setting' }
    }]
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    meta: { permission: 'DASHBOARD' },
    children: [{
      path: 'dashboard',
      component: Dashboard,
      name: 'Dashboard',
      meta: { title: 'dashboard', icon: 'dashboard', permission: 'DASHBOARD' }
    }]
  },
  {
    path: '/administrator',
    component: Layout,
    redirect: '/administrator/users',
    name: 'Administrator',
    meta: {
      title: 'administrator',
      icon: 'admin'
    },
    children: [
      {
        path: 'users',
        component: UserList,
        name: 'UserList',
        meta: { title: 'users', icon: 'user', permission: 'ADMIN_VIEW' }
      },
      {
        path: 'users/create',
        component: UserProfile,
        name: 'UserCreate',
        meta: { title: 'UserCreate', noCache: true, permission: 'ADMIN_CREATE' },
        hidden: true
      },
      {
        path: 'users/edit/:id(\\d+)',
        component: UserProfile,
        name: 'UserEdit',
        meta: { title: 'UserEdit', noCache: true, permission: 'ADMIN_UPDATE' },
        hidden: true
      },
      {
        path: 'roles',
        component: RoleList,
        name: 'RoleList',
        meta: { title: 'roles', icon: 'role', permission: 'ROLE_VIEW' }
      },
      {
        path: 'roles/create',
        component: RoleInfo,
        name: 'RoleCreate',
        meta: { title: 'RoleCreate', noCache: true, permission: 'ROLE_CREATE' },
        hidden: true
      },
      {
        path: 'roles/edit/:id(\\d+)',
        component: RoleInfo,
        name: 'RoleEdit',
        meta: { title: 'RoleEdit', noCache: true, permission: 'ROLE_UPDATE' },
        hidden: true
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