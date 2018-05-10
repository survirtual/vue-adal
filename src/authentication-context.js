import AdalContext from 'adal-angular/lib/adal.js'

class AuthenticationContext {
  /**
   * Configuration options for Adal Authentication Context.
   * @class config
   *  @property {string} tenant - Your target tenant.
   *  @property {string} clientId - Client ID assigned to your app by Azure Active Directory.
   *  @property {string} redirectUri - Endpoint at which you expect to receive tokens.Defaults to `window.location.href`.
   *  @property {string} instance - Azure Active Directory Instance.Defaults to `https://login.microsoftonline.com/`.
   *  @property {Array} endpoints - Collection of {Endpoint-ResourceId} used for automatically attaching tokens in webApi calls.
   *  @property {Boolean} popUp - Set this to true to enable login in a popup winodow instead of a full redirect.Defaults to `false`.
   *  @property {string} localLoginUrl - Set this to redirect the user to a custom login page.
   *  @property {function} displayCall - User defined function of handling the navigation to Azure AD authorization endpoint in case of login. Defaults to 'null'.
   *  @property {string} postLogoutRedirectUri - Redirects the user to postLogoutRedirectUri after logout. Defaults is 'redirectUri'.
   *  @property {string} cacheLocation - Sets browser storage to either 'localStorage' or sessionStorage'. Defaults to 'sessionStorage'.
   *  @property {Array.<string>} anonymousEndpoints Array of keywords or URI's. Adal will not attach a token to outgoing requests that have these keywords or uri. Defaults to 'null'.
   *  @property {number} expireOffsetSeconds If the cached token is about to be expired in the expireOffsetSeconds (in seconds), Adal will renew the token instead of using the cached token. Defaults to 300 seconds.
   *  @property {string} correlationId Unique identifier used to map the request with the response. Defaults to RFC4122 version 4 guid (128 bits).
   *  @property {number} loadFrameTimeout The number of milliseconds of inactivity before a token renewal response from AAD should be considered timed out.
   */

  /**
   * Configuration options for Authentication Context.
   * @class options
   *  @property {config} config - Configuration options for Adal Authentication Context.
   *  @property {boolean} requireAuthOnInitialize - Perform authentication upon startup.
   *  @property {any} router - Configure the router with route hooks.
   */

  /**
   * Creates a new AuthenticationContext object.
   * @constructor
   * @param {options}  options - Configuration options for AuthenticationContext
   */
  constructor (opts) {
    // Initialization to options or default
    this.config = opts.config || {
      tenant: 'your aad tenant',
      clientId: 'your aad application client id',
      redirectUri: 'base uri for this application',
      cacheLocation: 'localStorage',
      endpoints: {}
    }
    this.requireAuthOnInitialize = opts.requireAuthOnInitialize
    this.adalContext = opts.adalContext || new AdalContext(this.config)

    if (this.adalContext.isCallback(window.location.hash) || window !== window.parent) {
      // This was a redirect from a login attempt
      this.adalContext.handleWindowCallback()
    } else {
      var user = this.adalContext.getCachedUser()
      if (user && window.parent === window && !window.opener) {
        this.user = user
      } else if (this.requireAuthOnInitialize) {
        this.login()
      }
    }

    if (this.requireAuthOnInitialize) {
      this.acquireToken(opts.config.clientId, (err, token) => {
        if (err) {
          console.log('Could not get token')
        }
      })
      if (this.config.endpoints) {
        Object.keys(this.config.endpoints).forEach(function (key, index) {
          const resource = this.config.endpoints[key]
          this.acquireToken(resource, (err, token) => {
            if (err) {
              console.log('Could not get token')
            }
          })
        })
      }
    }

    if (opts.router) {
      // Initialize the router hooks
      opts.router.beforeEach((to, from, next) => {
        if (opts.globalAuth || to.matched.some(record => record.meta.requireAuth)) {
          if (this.isAuthenticated()) {
            // Authenticated, make sure roles are okay
            let checkRoles = []
            if (to.matched.some(record => {
              if (record.meta.requireRoles) {
                checkRoles = checkRoles.concat(record.meta.requireRoles)
                return true
              }
              return false
            })) {
              if (this.checkRoles(checkRoles)) {
                // Authorized to see the page
                next()
              } else {
                // Not authorized to see page
                console.log('Not Authorized')
                next(from.fullPath)
              }
            } else {
              next()
            }
          } else {
            this.login()
          }
        } else {
          next()
        }
      })
    }
  }

  /**
   * Initiates the login process by redirecting the user to Azure AD authorization endpoint.
   * @memberof AuthenticationContext
   */
  login () {
    this.adalContext.login()
  }

  /**
   * Redirects user to logout endpoint.
   * After logout, it will redirect to postLogoutRedirectUri if added as a property on the config object.
   * @memberof AuthenticationContext
   */
  logout () {
    this.adalContext.logOut()
  }

  /**
   * @callback tokenCallback
   * @param {string} error_description error description returned from AAD if token request fails.
   * @param {string} token token returned from AAD if token request is successful.
   * @param {string} error error message returned from AAD if token request fails.
   */

  /**
   * Acquires token from the cache if it is not expired. Otherwise sends request to AAD to obtain a new token.
   * @param {string}   resource  ResourceUri identifying the target resource
   * @param {tokenCallback} callback -  The callback provided by the caller. It will be called with token or error.
   * @memberof AuthenticationContext
   */
  acquireToken (resource, callback) {
    this.adalContext.acquireToken(resource, (err, token) => {
      if (err) {
        callback(err)
      } else {
        callback(null, token)
      }
    })
  }

  /**
    * Acquires token (interactive flow using a redirect) by sending request to AAD to obtain a new token. In this case the callback passed in the Authentication
    * request constructor will be called.
    * @param {string}   resource  ResourceUri identifying the target resource
    * @param {string}   extraQueryParameters  extraQueryParameters to add to the authentication request
    * @memberof AuthenticationContext
    */
  acquireTokenRedirect (resource, extraQueryParameters) {
    this.adalContext.acquireTokenRedirect(resource, extraQueryParameters)
  }

  getResourceForEndpoint (endpoint) {
    return this.adalContext.getResourceForEndpoint(endpoint)
  }

  isAuthenticated () {
    const authenticated = !!this.adalContext.getCachedToken(this.config.clientId)
    if (authenticated && !this.user) {
      this.user = this.adalContext.getCachedUser()
    }
    return authenticated && this.user
  }

  checkRoles (roles) {
    if (!this.isAuthenticated()) {
      return false
    }
    if (!this.user.profile.roles) {
      return false
    }
    if (typeof roles === 'string') {
      roles = [roles]
    }

    for (let i = 0; i < roles.length; i++) {
      if (this.user.profile.roles.indexOf(roles[i]) > -1) {
        return true
      }
    }

    return false
  }
}

export { AuthenticationContext }
