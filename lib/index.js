'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AxiosAuthHttp = exports.AuthenticationContext = undefined;

var _authenticationContext = require('./authentication-context');

var _axiosHttp = require('./axios-http.js');

let authenticationContext = null;

const AdalPlugin = {
  install(vue, opts = {}) {
    exports.AuthenticationContext = authenticationContext = new _authenticationContext.AuthenticationContext(opts);
    vue.prototype.$adal = authenticationContext;

    vue.mixin({
      data() {
        return {
          authenticated: false
        };
      },

      computed: {
        isAuthenticated() {
          this.authenticated = this.$adal.isAuthenticated();
          return this.authenticated;
        }
      }
    });
  }
};

exports.default = AdalPlugin;
exports.AuthenticationContext = authenticationContext;
exports.AxiosAuthHttp = _axiosHttp.AxiosAuthHttp;