(function(window, angular) {
   'use strict';

   /* @ngInject */
   function moduleRun($rootScope, AuthService, $state, $location) {
      $rootScope.$on("$stateChangeStart", function(event, toState, toParams, fromState, fromParams) {
         if (!AuthService.authorize(toState, AuthService.getCurrentUser())) {
            var _isUserLoggedIn = AuthService.isUserLoggedIn();
            event.preventDefault();
            $rootScope.$broadcast("$stateChangeError", toState, toParams, fromState, fromParams, {
               "statusCode": _isUserLoggedIn ? 403 : 401,
               "statusText": _isUserLoggedIn ? "Forbidden" : "Unauthorized",
               "isUserLoggedIn": _isUserLoggedIn,
               "publisher": "AuthService.authorize"
            });
            fromState.name || $location.path("/");
         }
      });
      $rootScope.$on(EVENTS.update, function() {
         AuthService.authorize($state.current, AuthService.getCurrentUser()) || $location.path("/");
      });
   }
   moduleRun.$inject = ['$rootScope', 'AuthService', '$state', '$location'];

   /* @ngInject */
   function AuthProviderFactory($httpProvider) {
      function _isUserLoggedIn() {
         return angular.isObject(self.getLoggedUser());
      }
      function _getAuthToken() {
         return authToken;
      }
      /**
    * @preserve
    * @callback Requester~requestCallback - The callback that handles the response.
    */
      var _dataParser = function(data) {
         return {
            "user": data,
            "token": data.token
         };
      }, self = this, currentUser = null, authToken = null;
      /**
    * Extends Used Routes
    *
    * @preserve
    * @param {Object} [newRoutes = {login: String, logout: String, fetch: String, authRedirect: String}]
    */
      this.useRoutes = function(newRoutes) {
         angular.isObject(newRoutes) && (routes = angular.extend(routes, newRoutes));
         return this;
      };
      /**
    * Get the CurrentUser Object or Null
    *
    * @preserve
    * @returns {Object|null}
    */
      this.getLoggedUser = function() {
         return currentUser;
      };
      /**
    * Appends Authentication Token to all $httpRequests
    *
    * @preserve
    * @param {String} tokenKey - The Name of Key
    */
      this.tokenizeHttp = function(tokenKey) {
         (!angular.isString(tokenKey) || tokenKey.length < 1) && (tokenKey = "x-auth-token");
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
      /**
    * @preserve
    * @param {Object|null} [user=null]
    * @param {String|null} [authenticationToken=null]
    */
      this.setLoggedUser = function(user, authenticationToken) {
         if (angular.isArray(user) || !angular.isObject(user) || !angular.isString(authenticationToken) || authenticationToken.length < 1) {
            user = null;
            authenticationToken = null;
         }
         currentUser = angular.copy(user);
         authToken = authenticationToken;
         return this;
      };
      /**
    * @preserve
    * @param {Requester~requestCallback} callback - The callback that handles the response.
    */
      this.defineModel = function(callback) {
         angular.isFunction(callback) && (_dataParser = callback);
         return this;
      };
      this.$get = ['$rootScope', '$http', '$exceptionHandler', function($rootScope, $http, $exceptionHandler) {
         function _setLoggedUser(newUserData, newAuthToken) {
            self.setLoggedUser(newUserData, newAuthToken);
            $rootScope.$broadcast(EVENTS.update);
         }
         function _sanitizeParsedData(parsedData) {
            if (!angular.isObject(parsedData) || !angular.isObject(parsedData.user) || !angular.isString(parsedData.token) || parsedData.token.length < 1) {
               $exceptionHandler("AuthService.defineModel", "Invalid callback passed. The Callback must return an object like {user: Object, token: String}");
               parsedData = {
                  "user": null,
                  "token": null
               };
            }
            return parsedData;
         }
         return {
            /**
          * Performs Login Request and sets the Auth Data
          *
          * @preserve
          * @param {{username: String, password: String, rememberMe: Boolean}} credentials
          * @returns {ng.IPromise}
          */
            "login": function(credentials) {
               return $http.post(routes.login, credentials, {
                  "cache": !1
               }).then(function(result) {
                  var data = _sanitizeParsedData(_dataParser(result.data, result.headers(), result.status));
                  _setLoggedUser(data.user, data.token);
                  $rootScope.$broadcast(EVENTS.login.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null, null);
                  $rootScope.$broadcast(EVENTS.login.error, error);
                  return error;
               });
            },
            /**
          * Updates the Auth Data
          *
          * @preserve
          * @returns {ng.IPromise}
          */
            "fetchLoggedUser": function() {
               return $http.get(routes.fetch, {
                  "cache": !1
               }).then(function(result) {
                  var data = _sanitizeParsedData(_dataParser(result.data, result.headers(), result.status));
                  _setLoggedUser(data.user, data.token);
                  $rootScope.$broadcast(EVENTS.fetch.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null, null);
                  $rootScope.$broadcast(EVENTS.fetch.error, error);
                  return error;
               });
            },
            /**
          * Performs Logout request
          *
          * @preserve
          * @returns {ng.IPromise}
          */
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
            /**
          * @preserve
          * @param {Object} user
          * @param {String} authenticationToken
          */
            "setCurrentUser": function(user, authenticationToken) {
               angular.isArray(user) || !angular.isObject(user) || !angular.isString(authenticationToken) || authenticationToken.length < 1 || _setLoggedUser(user, authenticationToken);
            },
            /**
          * @preserve
          */
            "unsetCurrentUser": function() {
               _setLoggedUser(null, null);
            },
            /**
          * @preserve
          * @returns {Object|Null} - Current User Data
          */
            "getCurrentUser": function() {
               return self.getLoggedUser();
            },
            /**
          * @preserve
          * Checks if the user is logged in
          * @returns {Boolean}
          */
            "isUserLoggedIn": function() {
               return _isUserLoggedIn();
            },
            /**
          * @preserve
          * @param {Object} state
          * @param {Object} [user = currentUser]
          * @returns {Boolean} Is the CurrentUser Authorized for State?
          */
            "authorize": function(state, user) {
               if (angular.isArray(state) || !angular.isObject(state)) {
                  $exceptionHandler("AuthService.authorize", "first params must be ui.router state");
                  return !1;
               }
               return !angular.isNumber(state.authLevel) || state.authLevel < 1 ? !0 : angular.isObject(user) ? (user.authLevel || 0) >= state.authLevel : _isUserLoggedIn() ? (self.getLoggedUser().authLevel || 0) >= state.authLevel : !1;
            },
            /**
          * @preserve
          * @returns {String|Null} - The Authentication Token
          */
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

   /* @ngInject */
   function AuthClassesDirectiveFactory(AuthService) {
      var classes = {
         "loggedIn": "user-is-logged-in",
         "notLoggedIn": "user-not-logged-in"
      };
      return {
         "restrict": "A",
         "scope": !1,
         "link": function(iScope, iElement, iAttributes) {
            function _toggleClass() {
               if (AuthService.isUserLoggedIn()) {
                  iAttributes.$addClass(classes.loggedIn);
                  iAttributes.$removeClass(classes.notLoggedIn);
               } else {
                  iAttributes.$removeClass(classes.loggedIn);
                  iAttributes.$addClass(classes.notLoggedIn);
               }
            }
            _toggleClass();
            iScope.$on(EVENTS.update, function() {
               _toggleClass();
            });
         }
      };
   }
   AuthClassesDirectiveFactory.$inject = ['AuthService'];

   var routes = {
      "login": "/users/login",
      "logout": "/users/logout",
      "fetch": "/users/me"
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

   angular.module("hitmands.auth", [ "ui.router" ]).provider("AuthService", AuthProviderFactory).directive("authLogin", AuthLoginDirectiveFactory).directive("authLogout", AuthLogoutDirectiveFactory).directive("authClasses", AuthClassesDirectiveFactory).run(moduleRun);
//# sourceMappingURL=angular-hitmands-auth.js.map

})(window, angular);