import Vue from 'vue'
import Adal from 'vue-adal'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

Vue.use(Adal, {
  config: {
    tenant: '6bd8bc15-5b97-45a3-9e18-07b519287d3e',
    clientId: '856807c7-8922-4c8c-b92e-ea66cbae41ca',
    redirectUri: 'http://localhost:8082',
    cacheLocation: 'localStorage'
  },
  requireAuthOnInitialize: true,
  router: router
})

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
