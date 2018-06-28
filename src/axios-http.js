import { AuthenticationContext } from './'

const getToken = (resource, http, cb) => {
  AuthenticationContext.acquireToken(resource, (err, token) => {
    if (err) {
      let errCode = err.split(':')[0]
      switch (errCode) {
        case 'AADSTS50058': // Need to prompt for user sign in
          AuthenticationContext.login()
          break
        case 'AADSTS65001': // Token is invalid; grab a new one
          AuthenticationContext.acquireTokenRedirect(resource)
          break
        case 'AADSTS16000': // No Access
        default:
          // Need a pop-up forcing a login
          AuthenticationContext.login()
          break
      }
      cb(new Error('Failed to acquire token'))
      return
    }
    http.defaults.headers['Authorization'] = `BEARER ${token}`
    cb(null, token)
  })
}

export class AxiosAuthHttp {
  static createNewClient (options) {
    if (options == null) {
      throw new Error('Provided options for auth-http are null!')
    }
    if (options.axios == null) {
      throw new Error('options.axios is required to generate a new http client')
    }
    if (options.resourceId == null) {
      throw new Error('options.resourceId is required to acquire an auth token')
    }

    let axios = options.axios
    let http = axios.create({
      baseURL: options.baseUrl,
      headers: {
        Authorization: null
      }
    })

    http.interceptors.response.use((response) => {
      return response
    }, (error) => {
      if (error.response.status === 401) {
        AuthenticationContext.adalContext.clearCacheForResource(options.resourceId)
        return new Promise((resolve, reject) => getToken(options.resourceId, http, () => {
          let config = error.response.config
          config.headers.Authorization = http.defaults.headers['Authorization']
          http({
            method: config.method,
            url: config.url,
            data: config.data,
            headers: {
              'Accept': config.headers['Accept'],
              'Authorization': config.headers['Authorization'],
              'Content-Type': config.headers['Content-Type']
            }
          }).then(res => resolve(res), err => reject(err))
        }))
      } else {
        return Promise.reject(error)
      }
    })

    if (options.router == null) {
      return http
    }

    // Set up the router hooks for this resource
    options.router.beforeEach((to, from, next) => {
      getToken(options.resourceId, http, (err, token) => {
        if (err) {
          if (options.onTokenFailure instanceof Function) {
            options.onTokenFailure(err)
          }
          next()
          return
        }
        if (options.onTokenSuccess instanceof Function) {
          options.onTokenSuccess(http, AuthenticationContext, token)
        }
        next()
      })
    })
    return http
  }
}
