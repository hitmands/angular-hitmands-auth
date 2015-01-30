/* @ngInject */
function AuthProviderFactory( $httpProvider ) {
   /**
    * @preserve
    * @callback Requester~requestCallback - The callback that handles the response.
    */
   var _dataParser = function (data, headers, statusCode) {

      return {
         user: data,
         token: data.token,
         authLevel: data.authLevel
      };
   };

   var self = this;
   var currentUser = null;
   var authToken = null;
   var HttpHeaderAuthorization = false;

   /**
    *
    * @returns {Boolean}
    * @private
    */
   function _isUserLoggedIn() {

      return (self.getLoggedUser() instanceof AuthCurrentUser);
   }

   /**
    *
    * @returns {String}
    * @private
    */
   function _getAuthToken() {

      return authToken;
   }

   /**
    *
    * @param {Number} stateAuthLevel
    * @param {Number} userAuthLevel
    * @returns {Boolean}
    * @private
    */
   function _authorizeLevelBased(stateAuthLevel, userAuthLevel) {
      if( !angular.isNumber(userAuthLevel) ) {
         userAuthLevel = 0;
      }

      return ( userAuthLevel >= stateAuthLevel );
   }
   /**
    *
    * @param {Array} stateAuthRoles
    * @param {Array} userAuthRoles
    * @returns {Boolean}
    * @private
    */
   function _authorizeRoleBased(stateAuthRoles, userAuthRoles) {
      userAuthRoles = angular.isArray(userAuthRoles) ? userAuthRoles : [userAuthRoles];

      for(var i = 0, len = stateAuthRoles.length; i < len; i++) {
         for(var j = 0, jLen = userAuthRoles.length; j < jLen; j++) {
            if( angular.equals(stateAuthRoles[i], userAuthRoles[j]) ) {
               return true;
            }
         }
      }

      return false;
   }

   /**
    * Extends Used Routes
    *
    * @preserve
    * @param {Object} [newRoutes = {login: String, logout: String, fetch: String}]
    */
   this.useRoutes = function AuthServiceRoutesListSetter( newRoutes ) {
      if( angular.isObject(newRoutes) ) {
         routes = angular.extend(routes, newRoutes);
      }

      return this;
   };

   /**
    * Get the CurrentUser Object or Null
    *
    * @preserve
    * @returns {Object|null}
    */
   this.getLoggedUser = function AuthServiceLoggedUserGetter() {

      return currentUser;
   };

   /**
    * Appends Authentication Token to all $httpRequests
    *
    * @preserve
    * @param {String} tokenKey - The Name of Key
    */
   this.tokenizeHttp = function AuthServiceTokenizeHttp( tokenKey ) {
      if( !angular.isString(tokenKey) || tokenKey.length < 1 ) {
         tokenKey = 'x-auth-token';
      }

      $httpProvider.interceptors.push(function AuthServiceInterceptor() {

         return {
            request: function AuthServiceRequestTransform(config) {

               if(
                  _isUserLoggedIn() &&
                  angular.isObject(config) &&
                  config.hasOwnProperty('headers')
               ) {
                  config.headers[tokenKey] = _getAuthToken();
               }

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
   this.useHttpHeaderAuth = function AuthServiceUseHttpHeaderAuthorization() {
      HttpHeaderAuthorization = true;

      return this;
   };

   /**
    * @preserve
    * @param {Object|null} [userData=null]
    * @param {Number|null} authLevel
    * @param {String|null} [authenticationToken=null]
    */
   this.setLoggedUser = function AuthServiceLoggedUserSetter( userData, authenticationToken, authLevel ) {
      if( angular.isArray(userData) || !angular.isObject( userData ) || !angular.isString(authenticationToken) || authenticationToken.length < 1 ) {

         userData = null;
         authenticationToken = null;
      }

      currentUser = (userData) ? new AuthCurrentUser(userData, authLevel) : null;
      authToken = authenticationToken;

      return this;
   };

   /**
    * @preserve
    * @param {Requester~requestCallback} callback - The callback that handles the $http response.
    */
   this.parseHttpAuthData = function AuthServiceExpectDataAs( callback ) {
      if( angular.isFunction(callback) ) {

         _dataParser = callback;
      }

      return this;
   };


   this.$get = function($rootScope, $http, $state, $exceptionHandler, $timeout, $q) {

      /**
       * @param {Object|null} newUserData
       * @param {String|null} newAuthToken
       * @param {Number|null} newAuthLevel
       * @private
       */
      function _setLoggedUser( newUserData, newAuthToken, newAuthLevel ) {
         self.setLoggedUser( newUserData, newAuthToken, newAuthLevel );
         $rootScope.$broadcast(EVENTS.update);

         $timeout(function() {
            if(!$rootScope.$$phase) {
               $rootScope.$digest();
            }
         }, 0);
      }

      /**
       * @param parsedData
       * @returns {{user: Object|null, token: string|null}}
       * @private
       */
      function _sanitizeParsedData( parsedData ) {
         if( !angular.isObject(parsedData) || !angular.isObject(parsedData.user) || !angular.isString(parsedData.token) || parsedData.token.length < 1) {
            $exceptionHandler('AuthServiceProvider.parseHttpAuthData', 'Invalid callback passed. The Callback must return an object like {user: Object, token: String, authLevel: Number|Array}');

            parsedData = {
               user: null,
               token: null
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
         login: function( credentials ) {
            var configs = {
               cache: false
            };

            if(HttpHeaderAuthorization) {
               configs.headers = {
                  Authorization : 'Basic' + ' ' + btoa((credentials.username || '') + ':' + (credentials.password || ''))
               };

               try {
                  delete credentials['username'];
                  delete credentials['password'];
               } catch(e) {
                  credentials.username = '';
                  credentials.password = '';
               }
            }

            return $http
               .post(routes.login, credentials, configs)
               .then(
               function( result ) {
                  var data = _sanitizeParsedData( _dataParser(result.data, result.headers(), result.status) );

                  _setLoggedUser( data.user, data.token, data.authLevel );
                  $rootScope.$broadcast(EVENTS.login.success, result);

                  return result;
               },
               function( error ) {
                  _setLoggedUser( null, null, null );
                  $rootScope.$broadcast(EVENTS.login.error, error);

                  return $q.reject(error);
               }
            );
         },

         /**
          * Updates the Auth Data
          *
          * @preserve
          * @returns {ng.IPromise}
          */
         fetchLoggedUser: function() {

            return $http
               .get(routes.fetch, { cache: false })
               .then(
               function( result ) {
                  var data = _sanitizeParsedData( _dataParser(result.data, result.headers(), result.status) );

                  _setLoggedUser( data.user, data.token, data.authLevel );
                  $rootScope.$broadcast(EVENTS.fetch.success, result);

                  return result;
               },
               function( error ) {
                  _setLoggedUser( null, null, null );
                  $rootScope.$broadcast(EVENTS.fetch.error, error);

                  return $q.reject(error);
               }
            );
         },

         /**
          * Performs Logout request
          *
          * @preserve
          * @returns {ng.IPromise}
          */
         logout: function() {

            return $http
               .post(routes.logout, null, { cache: false })
               .then(
               function( result ) {
                  _setLoggedUser( null, null, null );
                  $rootScope.$broadcast(EVENTS.logout.success, result);

                  return result;
               },
               function( error ) {
                  _setLoggedUser( null, null, null );
                  $rootScope.$broadcast(EVENTS.logout.error, error);

                  return $q.reject(error);
               }
            );
         },

         /**
          * @preserve
          * @param {Object} user
          * @param {Number} authLevel
          * @param {String} authenticationToken
          */
         setCurrentUser: function(user, authLevel, authenticationToken) {
            if( angular.isArray(user) || !angular.isObject( user ) || !angular.isString(authenticationToken) || authenticationToken.length < 1 ) {
               return false;
            }

            _setLoggedUser( user, authenticationToken, authLevel );
            return true;
         },

         /**
          * @preserve
          */
         unsetCurrentUser: function() {

            _setLoggedUser( null, null, null );
            return true;
         },

         /**
          * @preserve
          * @returns {Object|Null} - Current User Data
          */
         getCurrentUser: function() {

            return self.getLoggedUser();
         },

         /**
          * @preserve
          * Checks if the user is logged in
          * @returns {Boolean}
          */
         isUserLoggedIn: function() {

            return _isUserLoggedIn();
         },

         /**
          * @preserve
          * @param {Object} state
          * @param {Object} [user = currentUser]
          * @returns {Boolean}
          */
         authorize: function( state, user ) {
            var userAuthLevel;
            var propertyToCheck = AuthCurrentUser.getAuthProperty();
            user = user || self.getLoggedUser();

            if( !angular.isObject(state) || Object.getPrototypeOf($state) !== Object.getPrototypeOf(state) ) {
               $exceptionHandler('AuthService.authorize', 'first param must be ui-router $state');
               return false;
            }

            try {
               userAuthLevel = user[propertyToCheck]
            } catch(e) {
               userAuthLevel = 0;
            }

            var stateAuthLevel = ((angular.isObject(state.data) && state.data.hasOwnProperty(propertyToCheck)) ?
                  state.data[propertyToCheck] : state[propertyToCheck]) || 0;

            if(angular.isNumber(stateAuthLevel)) {
               return _authorizeLevelBased(stateAuthLevel, userAuthLevel);
            }

            if(angular.isArray(stateAuthLevel)) {
               return _authorizeRoleBased(stateAuthLevel, userAuthLevel);
            }

            $exceptionHandler('AuthService.authorize', 'Cannot process authorization');
            return false;
         },

         /**
          * @preserve
          * @returns {String|Null} - The Authentication Token
          */
         getAuthenticationToken: function() {

            return _getAuthToken();
         }

      };
   };
}
