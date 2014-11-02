(function(window, angular) {
   'use strict';

   /* @ngInject */
   function AuthProviderFactory($httpProvider) {
      function _isUserLoggedIn() {
         return angular.isObject(self.getLoggedUser());
      }
      function _getAuthToken() {
         return authToken;
      }
      var self = this, currentUser = null, authToken = null, _dataParser = function(data) {
         return {
            "user": data,
            "token": data.token
         };
      };
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
      /**
    * @preserve
    * @param {Object|null} [user=null]
    * @param {String|null} [authenticationToken=null]
    */
      this.setLoggedUser = function(user, authenticationToken) {
         if (!angular.isObject(user) || !angular.isString(authenticationToken) || authenticationToken.length < 1) {
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
      this.setDataParser = function(callback) {
         angular.isFunction(callback) && (_dataParser = callback);
         return this;
      };
      this.$get = ['$rootScope', '$q', '$http', '$exceptionHandler', function($rootScope, $q, $http, $exceptionHandler) {
         /**
       * @preserve
       * @param {Object|null} newUserData
       * @param {String|null} newAuthToken
       * @private
       */
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
               _setLoggedUser(user, authenticationToken);
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
          * @returns {Boolean} Is the CurrentUser Authorized for State?
          */
            "authorize": function(state) {
               return !angular.isNumber(state.authLevel) || state.authLevel < 1 ? !0 : _isUserLoggedIn() ? (self.getLoggedUser().authLevel || 0) >= state.authLevel : !1;
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