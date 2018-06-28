# Vue Adal

Vue Adal is a plugin for [Vue.js](https://vuejs.org/) to help with using Azure Active Directory.

Check the [sample](/sample) folder for a usage example.

## Installation
```code
yarn add vue-adal
```
OR
```code
npm install vue-adal
```
## Basic Usage

```javascript
import Adal from 'vue-adal'
Vue.use(Adal, {
// This config gets passed along to Adal, so all settings available to adal can be used here.
  config: {
    // 'common' (multi-tenant gateway) or Azure AD Tenant ID
    tenant: '<guid>',

    // Application ID
    clientId: '<guid>',

    // Host URI
    redirectUri: '<host addr>',

    cacheLocation: 'localStorage'
  },

  // Set this to true for authentication on startup
  requireAuthOnInitialize: true,

  // Pass a vue-router object in to add route hooks with authentication and role checking
  router: router
})
```

**important**: make sure to set the mode on your router to 'history' so that it doesn't use hashes!  This will have implications on the serverside.

```javascript
new Router({
  mode: 'history', // Required for Adal library
  ... // Rest of router init
})
```

### Getting user Information

After signing in, get access to the user as follows:

```javascript
import { AuthenticationContext } from 'vue-adal' // This will be populated with a valid context after initialization

...
const profile = AuthenticationContext.user.profile
...
```

## Getting Access to a Resource

After configuring Vue Adal, you'll still need to get a token to a resource.  

***Important:*** your Azure application must be configured to allow the oauth2ImplicitFlow in the manifest, like so:
![implicit flow](/resources/implicit-flow.png "Implicit Flow")

### Axios HTTP Client / Interceptor

Vue Adal provides a convenient and automated way to do that with an axios http client, called AxiosAuthHttp.  It configures an interceptor the auto-acquires tokens and will retry requests after a 401 and another attempt to get a token.

Here is an example:

```javascript
import axios from 'axios'
import { default as Adal, AxiosAuthHttp } from 'vue-adal'

...
Vue.use({
  install (vue, opts = {}) {
    // Configures an axios http client with a interceptor to auto-acquire tokens
    vue.prototype.$graphApi = AxiosAuthHttp.createNewClient({
      // Required Params
      axios: axios,
      resourceId: graphApiResource, // Resource id to get a token against

      // Optional Params
      router: router, // Enables a router hook to auto-acquire a token for the specific resource

      baseUrl: graphApiBase, // Base url to configure the client with

      onTokenSuccess (http, context, token) { // Token success hook
        // When an attempt to retrieve a token is successful, this will get called.
        // This enables modification of the client after a successful call.
        if (context.user) {
          // Setup the client to talk with the Microsoft Graph API
          http.defaults.baseURL = `${graphApiBase}/${context.user.profile.tid}`
        }
      },

      onTokenFailure (error) { // Token failure hook
        // When an attempt to retrieve a token is not successful, this will get called.
        console.log(error)
      }
    })
  }
})
...

```
Take a look at the sample for more details.


## Manually getting a token

If you'd like to get a token yourself, use the acquireToken command on the Authentication context:

```javascript
import { AuthenticationContext } from 'vue-adal' // This will be populated with a valid context after initialization

...
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
      return
    }
    const headers = {
      'Authorization': `BEARER ${token}`
    }
  })
...
```

## Route Hooks

If you pass in a router object as an option in Vue Adal, it will configure a global hook before each route allowing for route meta tags around authentication and roles.

**To make a route that requires auth, add a meta object to the route with requireAuth set to true:**

```javascript
// Other routes
...
    {
      path: '/secret',
      name: 'secret',
      component: MySecretComponent,
      meta: {
        requireAuth: true
      }
    }
...
```

**To make a route that requires role(s), add a :**

```javascript
// Other routes
...
    {
      path: '/secretRoles',
      name: 'secretRoles',
      component: MySecretRolesComponent,
      meta: {
        requireAuth: true
        // Much match at least one of these roles
        requireRoles: [
          'TheMan',
          'Admin'
        ]
      }
    }
...
```

## Conditionally Show Content Based on Auth Status

**Conditionally show content when authenticated:**

```html
<div v-if="$adal.isAuthenticated()">You are signed in!</div>
```

**Conditionally show content only when at least one role exists on user:**

```html
<div v-if="$adal.checkRoles(['Admin'])">You are an admin!</div>
```