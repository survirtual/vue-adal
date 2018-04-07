import { AuthenticationContext } from './authentication-context'
import { AxiosAuthHttp } from './axios-http.js'

let authenticationContext = null

const AdalPlugin = {
  install (vue, opts = {}) {
    authenticationContext = new AuthenticationContext(opts)
    vue.prototype.$adal = authenticationContext

    vue.mixin({
      data () {
        return {
          authenticated: false
        }
      },

      computed: {
        isAuthenticated () {
          this.authenticated = this.$adal.isAuthenticated()
          return this.authenticated
        }
      }
    })
  }
}

export default AdalPlugin
export { authenticationContext as AuthenticationContext, AxiosAuthHttp }
