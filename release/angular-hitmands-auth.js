/**!
 * @Project: angular-hitmands-auth
 * @Authors: Giuseppe Mandato <gius.mand.developer@gmail.com>
 * @Link: https://github.com/hitmands/angular-hitmands-auth
 * @License: MIT
 * @Date: 2015-02-03
 * @Version: 1.0.0
***/

(function(window, angular) {
   'use strict';

   /* @ngInject */
   function AuthModuleRun($rootScope, AuthService, $state, $location, $timeout) {
      function redirect() {
         $timeout(function() {
            $location.path("/");
         }, 0);
      }
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
            fromState.name || redirect();
         }
      });
      $rootScope.$on(EVENTS.update, function(event) {
         AuthService.authorize($state.current, AuthService.getCurrentUser()) || redirect();
      });
   }
   AuthModuleRun.$inject = ['$rootScope', 'AuthService', '$state', '$location', '$timeout'];

   function _authorizeLevelBased(stateAuthLevel, userAuthLevel) {
      angular.isNumber(userAuthLevel) || (userAuthLevel = 0);
      return userAuthLevel >= stateAuthLevel;
   }

   function _authorizeRoleBased(stateAuthRoles, userAuthRoles) {
      userAuthRoles = angular.isArray(userAuthRoles) ? userAuthRoles : [ userAuthRoles ];
      for (var i = 0, len = stateAuthRoles.length; len > i; i++) {
         for (var j = 0, jLen = userAuthRoles.length; jLen > j; j++) {
            if (angular.equals(stateAuthRoles[i], userAuthRoles[j])) {
               return !0;
            }
         }
      }
      return !1;
   }

   function _sanitizeParsedData(parsedData, $exceptionHandler) {
      if (!angular.isObject(parsedData) || !angular.isObject(parsedData.user) || !angular.isString(parsedData.token) || parsedData.token.length < 1) {
         $exceptionHandler("AuthServiceProvider.parseHttpAuthData", "Invalid callback passed. The Callback must return an object like {user: Object, token: String, authLevel: Number|Array}");
         parsedData = {
            "user": null,
            "token": null,
            "authLevel": 0
         };
      }
      return parsedData;
   }

   /* @ngInject */
   function AuthProviderFactory($httpProvider) {
      var _dataParser, self = this, isBasicAuthEnabled = !1;
      /**
    * Extends Used Routes
    *
    * @preserve
    * @param {Object} [newRoutes = {login: String, logout: String, fetch: String}]
    */
      this.useRoutes = function AuthServiceRoutesListSetter(newRoutes) {
         angular.isObject(newRoutes) && (routes = angular.extend(routes, newRoutes));
         return this;
      };
      /**
    * Appends Authentication Token to all $httpRequests
    *
    * @preserve
    * @param {String} tokenKey - The Name of Key
    */
      this.tokenizeHttp = function AuthServiceTokenizeHttp(tokenKey) {
         (!angular.isString(tokenKey) || tokenKey.length < 1) && (tokenKey = "x-auth-token");
         $httpProvider.interceptors.push(function AuthServiceInterceptor() {
            return {
               "request": function AuthServiceRequestTransform(config) {
                  currentUser instanceof AuthCurrentUser && angular.isObject(config) && config.hasOwnProperty("headers") && (config.headers[tokenKey] = authToken);
                  return config;
               }
            };
         });
         return this;
      };
      /**
    * Encrypts login requests like headers['Authorization'] = 'Basic' + ' ' + btoa(credentials.username + ':' + credentials.password)
    * @preserve
    */
      this.useBasicAuthentication = function AuthServiceUseHttpHeaderAuthorization() {
         isBasicAuthEnabled = !0;
         return this;
      };
      /**
    * @preserve
    * @param {Object|null} [userData=null]
    * @param {Number|null} authLevel
    * @param {String|null} [authenticationToken=null]
    */
      this.setLoggedUser = function AuthServiceLoggedUserSetter(userData, authenticationToken, authLevel) {
         if (angular.isArray(userData) || !angular.isObject(userData) || !angular.isString(authenticationToken) || authenticationToken.length < 1) {
            userData = null;
            authenticationToken = null;
         }
         currentUser = userData ? new AuthCurrentUser(userData, authLevel) : null;
         authToken = authenticationToken;
         return this;
      };
      /**
    * @preserve
    * @param {Requester~requestCallback} callback - The callback that handles the $http response.
    */
      this.parseHttpAuthData = function AuthServiceExpectDataAs(callback) {
         angular.isFunction(callback) && (_dataParser = callback);
         return this;
      };
      this.$get = ['$rootScope', '$http', '$state', '$exceptionHandler', '$timeout', '$q', function($rootScope, $http, $state, $exceptionHandler, $timeout, $q) {
         function _setLoggedUser(newUserData, newAuthToken, newAuthLevel) {
            self.setLoggedUser(newUserData, newAuthToken, newAuthLevel);
            $rootScope.$broadcast(EVENTS.update);
            $timeout(function() {
               $rootScope.$$phase || $rootScope.$digest();
            }, 0);
         }
         angular.isFunction(_dataParser) || $exceptionHandler("AuthServiceProvider.parseHttpAuthData", "You need to set a Callback that handles the $http response");
         return {
            /**
          * Performs Login Request and sets the Auth Data
          *
          * @preserve
          * @param {{username: String, password: String}} credentials
          * @returns {ng.IPromise}
          */
            "login": function(credentials) {
               var configs = {
                  "cache": !1
               };
               if (isBasicAuthEnabled) {
                  configs.headers = {
                     "Authorization": "Basic " + window.btoa((credentials.username || "") + ":" + (credentials.password || ""))
                  };
                  delete credentials.username;
                  delete credentials.password;
               }
               return $http.post(routes.login, credentials, configs).then(function(result) {
                  var data = _sanitizeParsedData(_dataParser(result.data, result.headers(), result.status), $exceptionHandler);
                  _setLoggedUser(data.user, data.token, data.authLevel);
                  $rootScope.$broadcast(EVENTS.login.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null, null, null);
                  $rootScope.$broadcast(EVENTS.login.error, error);
                  return $q.reject(error);
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
                  var data = _sanitizeParsedData(_dataParser(result.data, result.headers(), result.status), $exceptionHandler);
                  _setLoggedUser(data.user, data.token, data.authLevel);
                  $rootScope.$broadcast(EVENTS.fetch.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null, null, null);
                  $rootScope.$broadcast(EVENTS.fetch.error, error);
                  return $q.reject(error);
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
                  _setLoggedUser(null, null, null);
                  $rootScope.$broadcast(EVENTS.logout.success, result);
                  return result;
               }, function(error) {
                  _setLoggedUser(null, null, null);
                  $rootScope.$broadcast(EVENTS.logout.error, error);
                  return $q.reject(error);
               });
            },
            /**
          * @preserve
          * @param {Object} user
          * @param {Number} authLevel
          * @param {String} authenticationToken
          */
            "setCurrentUser": function(user, authLevel, authenticationToken) {
               if (angular.isArray(user) || !angular.isObject(user) || !angular.isString(authenticationToken) || authenticationToken.length < 1) {
                  return !1;
               }
               _setLoggedUser(user, authenticationToken, authLevel);
               return !0;
            },
            /**
          * @preserve
          */
            "unsetCurrentUser": function() {
               _setLoggedUser(null, null, null);
               return !0;
            },
            /**
          * @preserve
          * @returns {Object|Null} - Current User Data
          */
            "getCurrentUser": function() {
               return currentUser;
            },
            /**
          * @preserve
          * Checks if the user is logged in
          * @returns {Boolean}
          */
            "isUserLoggedIn": function() {
               return currentUser instanceof AuthCurrentUser;
            },
            /**
          * @preserve
          * @param {Object} state
          * @param {Object} [user = currentUser]
          * @returns {Boolean}
          */
            "authorize": function(state, user) {
               var userAuthLevel, propertyToCheck = AuthCurrentUser.getAuthProperty();
               user = user || currentUser;
               if (!angular.isObject(state)) {
                  $exceptionHandler("AuthService.authorize", "first param must be Object");
                  return !1;
               }
               try {
                  userAuthLevel = user[propertyToCheck] || 0;
               } catch (e) {
                  userAuthLevel = 0;
               }
               var stateAuthLevel = (angular.isObject(state.data) && state.data.hasOwnProperty(propertyToCheck) ? state.data[propertyToCheck] : state[propertyToCheck]) || 0;
               if (angular.isNumber(stateAuthLevel)) {
                  return _authorizeLevelBased(stateAuthLevel, userAuthLevel);
               }
               if (angular.isArray(stateAuthLevel)) {
                  return _authorizeRoleBased(stateAuthLevel, userAuthLevel);
               }
               $exceptionHandler("AuthService.authorize", "Cannot process authorization");
               return !1;
            },
            /**
          * @preserve
          * @returns {String|Null} - The Authentication Token
          */
            "getAuthenticationToken": function() {
               return authToken;
            }
         };
      }];
   }
   AuthProviderFactory.$inject = ['$httpProvider'];

   /* @ngInject */
   function AuthLoginDirectiveFactory(AuthService) {
      return {
         "restrict": "A",
         "link": function(iScope, iElement, iAttributes) {
            var credentials = iScope[iAttributes.authLogin], _form = null;
            try {
               _form = iScope[iElement.attr("name")];
            } catch (error) {}
            iElement.bind("submit", function(event) {
               angular.isObject(credentials) ? angular.isObject(_form) && _form.hasOwnProperty("$invalid") && _form.$invalid ? event.preventDefault() : AuthService.login(credentials) : event.preventDefault();
            });
            iScope.$on("$destroy", function() {
               iElement.unbind("submit");
            });
         }
      };
   }
   AuthLoginDirectiveFactory.$inject = ['AuthService'];

   /* @ngInject */
   function AuthLogoutDirectiveFactory(AuthService) {
      return function(scope, element, attrs) {
         element.bind("click", function() {
            AuthService.logout();
         });
         scope.$on("$destroy", function() {
            element.unbind("click");
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
                  iAttributes.$removeClass(classes.notLoggedIn);
                  iAttributes.$addClass(classes.loggedIn);
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

   var currentUser = null, authToken = null, routes = {
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
   }, AuthCurrentUser = function() {
      function AuthCurrentUser(userData, authLevel) {
         /* jshint ignore:start */
         for (var k in userData) {
            userData.hasOwnProperty(k) && k !== authProperty && (this[k] = userData[k]);
         }
         /* jshint ignore:end */
         Object.defineProperty(this, authProperty, {
            "enumerable": !0,
            "value": authLevel || userData[authProperty] || 0
         });
      }
      var authProperty = "authLevel";
      AuthCurrentUser.getAuthProperty = function() {
         return authProperty;
      };
      return AuthCurrentUser;
   }.call(this);

   angular.module("hitmands.auth", [ "ui.router" ]).provider("AuthService", AuthProviderFactory).directive("authLogin", AuthLoginDirectiveFactory).directive("authLogout", AuthLogoutDirectiveFactory).directive("authClasses", AuthClassesDirectiveFactory).run(AuthModuleRun);
//# sourceMappingURL=angular-hitmands-auth.js.map

})(window, angular);