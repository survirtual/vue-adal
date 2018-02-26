# Vue Adal

Vue Adal is a plugin for Vue to help with using the Azure Active Directory.

Check the [sample](/sample) folder for a usage example.
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

