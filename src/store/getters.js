const getters = {
  language: state => state.app.language,
  sidebar: state => state.app.sidebar,
  device: state => state.app.device,
  multiLanguage: state => state.app.multiLanguage,
  token: state => state.user.token,
  userInfo: state => state.user.info,
  roles: state => state.user.roles,
  permissions: state => state.user.permissions,
  addRoutes: state => state.permission.addRoutes,
  permission_routes: state => state.permission.routes
}

export default getters
