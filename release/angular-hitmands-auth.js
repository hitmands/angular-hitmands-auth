/**!
 * @Project: angular-hitmands-auth
 * @Authors: Giuseppe Mandato <gius.mand.developer@gmail.com>
 * @Link: https://github.com/hitmands/angular-hitmands-auth
 * @License: MIT
 * @Date: 2014-11-02
 * @Version: 0.0.1
***/

(function(window, angular) {
   'use strict';

   /* @ngInject */
   function AuthProviderFactory($httpProvider) {
      var self = this, currentUser = null, authToken = null, _dataParser = function(data) {
         return {
            "user": data,
            "token": data.token
         };
      }, _isUserLoggedIn = function() {
         return angular.isObject(self.getLoggedUser());
      }, _getAuthToken = function() {
         return authToken;
      };
      this.useRoutes = function(newRoutes) {
         angular.isObject(newRoutes) && (routes = angular.extend(routes, newRoutes));
         return this;
      };
      this.getLoggedUser = function() {
         return currentUser;
      };
      this.tokenizeHttp = function(tokenKey) {
         (!angular.isString(tokenKey) || tokenKey.length < 1) && (tokenKey = "X-AUTH-TOKEN");
         $httpProvider.interceptors.push(function() {
            return {
               "request": function(config) {
                  _isUserLoggedIn() && angular.isObject(config) && config.hasOwnProperty("headers") && (config.headers[tokenKey] = _getAuthToken());
                  return config;
               }
            };
         });
         return this;
      };
      this.setLoggedUser = function(user, authenticationToken) {
         if (!angular.isObject(user) || !angular.isString(authenticationToken) || authenticationToken.length < 1) {
            user = null;
            authenticationToken = null;
         }
         currentUser = angular.copy(user);
         authToken = authenticationToken;
         return this;
      };
      this.setDataParser = function(callback) {
         angular.isFunction(callback) && (_dataParser = callback);
         return this;
      };
      this.$get = ['$rootScope', '$q', '$http', '$exceptionHandler', function($rootScope, $q, $http, $exceptionHandler) {
         var _setLoggedUser = function(newUserData, newAuthToken) {
            self.setLoggedUser(newUserData, newAuthToken);
            $rootScope.$broadcast(EVENTS.update, self.getLoggedUser(), _isUserLoggedIn());
         }, sanitizeParsedData = function(parsedData) {
            if (!angular.isObject(parsedData) || !angular.isObject(parsedData.user) || !angular.isString(parsedData.token) || parsedData.token.length < 1) {
               $exceptionHandler("AuthService.processServerData", "Invalid callback passed. The Callback must return an object like {user: Object, token: String}");
               parsedData = {
                  "user": null,
                  "token": null
               };
            }
            return parsedData;
         };
         return {
            "login": function(credentials) {
               return $http.post(routes.login, credentials, {
                  "cache": !1
               }).then(function(result) {
                  var data = sanitizeParsedData(_dataParser(result.data, result.headers(), result.status));
                  _setLoggedUser(data.user, data.token);
                  $rootScope.$broadcast(EVENTS.login.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null, null);
                  $rootScope.$broadcast(EVENTS.login.error, error);
                  return error;
               });
            },
            "fetchLoggedUser": function() {
               return $http.get(routes.fetch, {
                  "cache": !1
               }).then(function(result) {
                  var data = sanitizeParsedData(_dataParser(result.data, result.headers(), result.status));
                  _setLoggedUser(data.user, data.token);
                  $rootScope.$broadcast(EVENTS.fetch.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null, null);
                  $rootScope.$broadcast(EVENTS.fetch.error, error);
                  return error;
               });
            },
            "logout": function() {
               return $http.post(routes.logout, null, {
                  "cache": !1
               }).then(function(result) {
                  _setLoggedUser(null, null);
                  $rootScope.$broadcast(EVENTS.logout.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null, null);
                  $rootScope.$broadcast(EVENTS.logout.error, error);
                  return error;
               });
            },
            "setCurrentUser": function(user, authenticationToken) {
               _setLoggedUser(user, authenticationToken);
            },
            "getCurrentUser": function() {
               return self.getLoggedUser();
            },
            "isUserLoggedIn": function() {
               return _isUserLoggedIn();
            },
            "authorize": function(state) {
               return !angular.isNumber(state.authLevel) || state.authLevel < 1 ? !0 : _isUserLoggedIn() ? (self.getLoggedUser().authLevel || 0) >= state.authLevel : !1;
            },
            "getAuthenticationToken": function() {
               return _getAuthToken();
            }
         };
      }];
   }
   AuthProviderFactory.$inject = ['$httpProvider'];

   /* @ngInject */
   function AuthServiceRedirectFactory() {
      var state = null, params = null;
      this.$get = ['$state', 'AuthService', function($state, AuthService) {
         return {
            "set": function(toState, toParams) {
               state = toState;
               params = toParams;
            },
            "unset": function() {
               state = null;
               params = null;
            },
            "go": function() {
               angular.isObject(state) && AuthService.authorize(state) && $state.go(state, params);
               this.unset();
            },
            "otherwise": function() {
               return $state.go(routes.otherwise);
            }
         };
      }];
   }

   /* @ngInject */
   function AuthLoginDirectiveFactory(AuthService) {
      var _form = null;
      return {
         "restrict": "A",
         "link": function(iScope, iElement, iAttributes) {
            var credentials = iScope[iAttributes.authLogin];
            try {
               _form = iScope[iElement.attr("name")];
            } catch (error) {}
            iElement.bind("submit", function(event) {
               angular.isObject(credentials) ? angular.isObject(_form) && _form.hasOwnProperty("$invalid") && _form.$invalid ? event.preventDefault() : AuthService.login(credentials) : event.preventDefault();
            });
         }
      };
   }
   AuthLoginDirectiveFactory.$inject = ['AuthService'];

   /* @ngInject */
   function AuthLogoutDirectiveFactory(AuthService) {
      return function(scope, element) {
         element.bind("click", function() {
            AuthService.logout();
         });
      };
   }
   AuthLogoutDirectiveFactory.$inject = ['AuthService'];

   var routes = {
      "login": "/users/login",
      "logout": "/users/logout",
      "fetch": "/users/me",
      "otherwise": "/login"
   }, EVENTS = {
      "login": {
         "success": "hitmands.auth:login.resolved",
         "error": "hitmands.auth:login.rejected"
      },
      "logout": {
         "success": "hitmands.auth:logout.resolved",
         "error": "hitmands.auth:logout.rejected"
      },
      "fetch": {
         "success": "hitmands.auth:fetch.resolved",
         "error": "hitmands.auth:fetch.rejected"
      },
      "update": "hitmands.auth:update"
   };

   angular.module("hitmands.auth", [ "ui.router" ]).run(['$rootScope', 'AuthService', '$state', '$location', 'AuthServiceRedirect', function($rootScope, AuthService, $state, $location, AuthServiceRedirect) {
      $rootScope.$on(EVENTS.login.success, function() {
         return AuthServiceRedirect.go();
      });
      $rootScope.$on("$stateChangeError", function(event, toState, toParams, fromState, fromParams, error) {
         return 403 === error.statusCode || 401 === error.statusCode ? AuthServiceRedirect.set(toState, toParams) : void 0;
      });
      $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
         if (!AuthService.authorize(toState)) {
            var _isUserLoggedIn = AuthService.isUserLoggedIn();
            $rootScope.$broadcast("$stateChangeError", toState, toParams, fromState, fromParams, {
               "statusCode": _isUserLoggedIn ? 403 : 401,
               "statusText": _isUserLoggedIn ? "Forbidden" : "Unauthorized",
               "isUserLoggedIn": _isUserLoggedIn
            });
            if (!fromState.name && _isUserLoggedIn) {
               return $location.path("/");
            }
            event.preventDefault();
            if (!fromState.name || !_isUserLoggedIn) {
               return AuthServiceRedirect.otherwise();
            }
         }
      });
      $rootScope.$on(EVENTS.update, function() {
         var _isUserLoggedIn = AuthService.isUserLoggedIn();
         return !AuthService.authorize($state.current) && _isUserLoggedIn ? $location.path("/") : AuthService.authorize($state.current) || _isUserLoggedIn ? void 0 : AuthServiceRedirect.otherwise();
      });
   }]);

   angular.module("hitmands.auth").provider("AuthService", AuthProviderFactory);

   angular.module("hitmands.auth").provider("AuthServiceRedirect", AuthServiceRedirectFactory);

   angular.module("hitmands.auth").directive("authLogin", AuthLoginDirectiveFactory).directive("authLogout", AuthLogoutDirectiveFactory);
//# sourceMappingURL=angular-hitmands-auth.js.map

})(window, angular);