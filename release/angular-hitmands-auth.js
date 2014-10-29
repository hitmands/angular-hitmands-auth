/**!
 * @Project: angular-hitmands-auth
 * @Authors: Giuseppe Mandato <gius.mand.developer@gmail.com>
 * @Link: https://github.com/hitmands/angular-hitmands-auth
 * @License: MIT
 * @Date: 2014-10-29
 * @Version: 0.0.1
***/

(function(window, angular) {
   'use strict';

   /* @ngInject */
   function AuthProviderFactory($httpProvider) {
      var self = this, currentUser = null, authToken = null, routes = {
         "login": "/users/login",
         "logout": "/users/logout",
         "fetch": "/users/me",
         "authenticationRedirect": "/login"
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
      this.useRoutes = function(newRoutes) {
         angular.isObject(newRoutes) && (routes = angular.extend(routes, newRoutes));
         return this;
      };
      this.getLoggedUser = function() {
         return currentUser;
      };
      var _isUserLoggedIn = function() {
         return angular.isObject(self.getLoggedUser());
      }, _getAuthToken = function() {
         return authToken;
      };
      this.setLoggedUser = function(user) {
         if (!angular.isObject(user)) {
            user = null;
            authToken = null;
         }
         currentUser = angular.copy(user);
         try {
            authToken = currentUser.token;
         } catch (error) {}
         return this;
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
      this.$get = ['$rootScope', '$q', '$http', '$state', function($rootScope, $q, $http, $state) {
         var _setLoggedUser = function(newUserData) {
            self.setLoggedUser(newUserData);
            $rootScope.$broadcast(EVENTS.update, self.getLoggedUser(), _isUserLoggedIn());
         };
         return {
            "login": function(credentials) {
               return $http.post(routes.login, credentials, {
                  "cache": !1
               }).then(function(result) {
                  _setLoggedUser(result.data);
                  $rootScope.$broadcast(EVENTS.login.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null);
                  $rootScope.$broadcast(EVENTS.login.error, error);
                  return error;
               });
            },
            "fetchLoggedUser": function() {
               return $http.get(routes.fetch, {
                  "cache": !1
               }).then(function(result) {
                  _setLoggedUser(result.data);
                  $rootScope.$broadcast(EVENTS.fetch.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null);
                  $rootScope.$broadcast(EVENTS.fetch.error, error);
                  return error;
               });
            },
            "logout": function() {
               return $http.post(routes.logout, null, {
                  "cache": !1
               }).then(function(result) {
                  _setLoggedUser(null);
                  $rootScope.$broadcast(EVENTS.logout.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null);
                  $rootScope.$broadcast(EVENTS.logout.error, error);
                  return error;
               });
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
            "authenticationRedirect": function() {
               $state.transitionTo(routes.authenticationRedirect, {}, {
                  "inherit": !1
               });
            },
            "getAuthenticationToken": function() {
               return _getAuthToken();
            }
         };
      }];
   }
   AuthProviderFactory.$inject = ['$httpProvider'];

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

   angular.module("hitmands.auth", [ "ui.router" ]).run(['$rootScope', 'AuthService', '$state', '$location', function($rootScope, AuthService, $state, $location) {
      var afterLoginRedirectTo = null;
      $rootScope.$on("hitmands.auth:login.resolved", function() {
         angular.isObject(afterLoginRedirectTo) && AuthService.authorize(afterLoginRedirectTo.state) && $state.transitionTo(afterLoginRedirectTo.state.name, afterLoginRedirectTo.params);
         afterLoginRedirectTo = null;
      });
      $rootScope.$on("hitmands.auth:fetch.resolved", function() {
         angular.isObject(afterLoginRedirectTo) && AuthService.authorize(afterLoginRedirectTo.state) && $state.transitionTo(afterLoginRedirectTo.state.name, afterLoginRedirectTo.params);
         afterLoginRedirectTo = null;
      });
      $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
         if (!AuthService.authorize(toState)) {
            var _isUserLoggedIn = AuthService.isUserLoggedIn();
            $rootScope.$broadcast("$stateChangeError", toState, toParams, fromState, fromParams, {
               "statusCode": 403,
               "statusText": "Forbidden",
               "isUserLoggedIn": _isUserLoggedIn
            });
            if (!fromState.name && _isUserLoggedIn) {
               return $location.path("/");
            }
            event.preventDefault();
            if (!fromState.name || !_isUserLoggedIn) {
               afterLoginRedirectTo = {
                  "state": toState,
                  "params": toParams
               };
               return AuthService.authenticationRedirect();
            }
         }
      });
      $rootScope.$on("hitmands.auth:update", function() {
         AuthService.authorize($state.current) || AuthService.authenticationRedirect();
      });
   }]);

   angular.module("hitmands.auth").provider("AuthService", AuthProviderFactory);

   angular.module("hitmands.auth").directive("authLogin", AuthLoginDirectiveFactory).directive("authLogout", AuthLogoutDirectiveFactory);
//# sourceMappingURL=angular-hitmands-auth.js.map

})(window, angular);