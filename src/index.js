import { AuthenticationContext } from './authentication-context'

let authenticationContext = null

const AdalPlugin = {
  install (vue, opts = {}) {
    authenticationContext = new AuthenticationContext(opts)
    vue.prototype.$adal = authenticationContext
  }
}

export default AdalPlugin
export { authenticationContext as AuthenticationContext }
