/* @ngInject */
function AuthServiceProviderFactory( $httpProvider ) {
   var _dataParser;
   var self = this;
   var isBasicAuthEnabled = false;


   /**
    * Disables the auto routing protection
    *
    */
   self.disableAutoRoutingProtection = function AuthServiceDisableAutoRoutingProtection() {
      AUTO_ROUTING_PROTECTION = false;

      return self;
   };

   /**
    * Changes the name of the authProperty to check in ui.router $state Object
    *
    * @preserve
    * @param {String} [newAuthPropertyName = 'authLevel']
    */
   self.setAuthLevelPropertyName = function AuthServiceSetAuthLevelPropertyName( newAuthPropertyName ) {
      if(angular.isString(newAuthPropertyName)) {
         AUTH_PROPERTY = newAuthPropertyName;
      }

      return self;
   };

   /**
    * Extends Used Routes
    *
    * @preserve
    * @param {Object} [newRoutes = {login: String, logout: String, fetch: String}]
    */
   self.useRoutes = function AuthServiceRoutesListSetter( newRoutes ) {
      routes = angular.extend(routes, newRoutes);

      return self;
   };

   /**
    * Appends Authentication Token to all $httpRequests
    * If a function is passed as second parameter is passed, it will be invoked for all $httpResponses with the config object
    *
    * @preserve
    * @param {String} [tokenKey = 'x-auth-token'] - The Name of the header Key, default x-auth-token
    * @param {Function} [responseInterceptor] - if function passed, it will be invoked on every $httpResponses with the config object
    */
   self.tokenizeHttp = function AuthServiceTokenizeHttp( tokenKey, responseInterceptor ) {
      if(angular.isFunction(tokenKey)) {
         responseInterceptor = tokenKey;
         tokenKey = void(0);
      }
      $httpProvider.interceptors.push(function AuthServiceInterceptor() {

         return {
            request: function AuthServiceRequestTransform(config) {

               if(currentUser instanceof AuthCurrentUser) {
                  try {
                     config.headers[(tokenKey || 'x-auth-token')] = authToken;
                  } catch(error) {}
               }

               return config;
            },
            responseError: responseInterceptor
         };
      });

      return self;
   };

   /**
    * Encrypts login requests like headers['Authorization'] = 'Basic' + ' ' + btoa(credentials.username + ':' + credentials.password)
    * @preserve
    */
   self.useBasicAuthentication = function AuthServiceUseHttpHeaderAuthorization() {
      isBasicAuthEnabled = true;

      return self;
   };

   /**
    * @preserve
    * @param {Object|null} [userData=null]
    * @param {Number|null} authLevel
    * @param {String|null} [authenticationToken=null]
    */
   self.setLoggedUser = function AuthServiceLoggedUserSetter( userData, authenticationToken, authLevel ) {
      if( !_validAuthData(userData, authenticationToken) ) {

         userData = null;
         authenticationToken = null;
      }

      currentUser = (userData) ? new AuthCurrentUser(userData, authLevel) : null;
      authToken = authenticationToken;

      return self;
   };

   /**
    * @preserve
    * @param {Requester~requestCallback} callback - The callback that handles the $http response.
    */
   self.parseHttpAuthData = function AuthServiceExpectDataAs( callback ) {
      if( angular.isFunction(callback) ) {

         _dataParser = callback;
      }

      return self;
   };


   self.$get = function AuthServiceFactory($rootScope, $http, $state, $exceptionHandler, $timeout, $q, $injector) {
      if(!angular.isFunction(_dataParser)) {
         $exceptionHandler('AuthServiceProvider.parseHttpAuthData', 'You need to set a Callback that handles the $http response. ', 'https://github.com/hitmands/angular-hitmands-auth#module-provider-parsehttpauthdata');
      }

      /**
       * @param {Object|null} [newUserData]
       * @param {String|null} [newAuthToken]
       * @param {Number|null} [newAuthLevel]
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

      return {

         /**
          * Performs Login Request and sets the Auth Data
          *
          * @preserve
          * @param {{username: String, password: String}} credentials
          * @returns {ng.IPromise}
          */
         login: function( credentials ) {
            var configs = {
               cache: false
            };

            if(isBasicAuthEnabled) {
               configs.headers = {
                  Authorization : 'Basic ' + window.btoa((credentials.username || '') + ':' + (credentials.password || ''))
               };

               delete credentials['username'];
               delete credentials['password'];
            }

            return $http
               .post(routes.login, credentials, configs)
               .then(
               function( result ) {
                  var data = _dataParser(result.data, result.headers(), result.status);

                  _setLoggedUser( data.user, data.token, data.authLevel );
                  $rootScope.$broadcast(EVENTS.login.success, result);

                  return result;
               },
               function( error ) {
                  _setLoggedUser(  );
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
         fetch: function() {

            return $http
               .get(routes.fetch, { cache: false })
               .then(
               function( result ) {
                  var data = _dataParser(result.data, result.headers(), result.status);

                  _setLoggedUser( data.user, data.token, data.authLevel );
                  $rootScope.$broadcast(EVENTS.fetch.success, result);

                  return result;
               },
               function( error ) {
                  _setLoggedUser(  );
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
                  _setLoggedUser(  );
                  $rootScope.$broadcast(EVENTS.logout.success, result);

                  return result;
               },
               function( error ) {
                  _setLoggedUser(  );
                  $rootScope.$broadcast(EVENTS.logout.error, error);

                  return $q.reject(error);
               }
            );
         },

         /**
          * @preserve
          * @param {Object} user
          * @param {Number|Array} authLevel
          * @param {String} authenticationToken
          */
         setCurrentUser: function(user, authLevel, authenticationToken) {
            if( !_validAuthData(user, authenticationToken) ) {
               return false;
            }

            _setLoggedUser( user, authenticationToken, authLevel );
            return true;
         },

         /**
          * @preserve
          */
         unsetCurrentUser: function() {

            _setLoggedUser(  );
            return true;
         },

         /**
          * @preserve
          * @returns {Object|Null} - Current User Data
          */
         getCurrentUser: function() {

            return currentUser;
         },

         /**
          * @preserve
          * Checks if the user is logged in
          * @returns {Boolean}
          */
         isUserLoggedIn: function() {

            return (currentUser instanceof AuthCurrentUser);
         },

         /**
          * @preserve
          * @param {Object} state
          * @param {Object} [user = currentUser]
          * @returns {Boolean}
          */
         authorize: function( state, user ) {
            var userAuthLevel = 0;
            user = user || currentUser;

            if( !angular.isObject(state) ) {
               $exceptionHandler('AuthService.authorize', 'first param must be Object');
               return false;
            }

            try {
               userAuthLevel = user[AUTH_PROPERTY];
            } catch(e) {}

            var stateAuthLevel = (state.data ? state.data[AUTH_PROPERTY] : state[AUTH_PROPERTY]) || 0;

            if(angular.isFunction(stateAuthLevel)) {
               stateAuthLevel = $injector.invoke(stateAuthLevel);
            }

            if(angular.isNumber(stateAuthLevel)) {
               return _authorizeLevelBased(stateAuthLevel, userAuthLevel);
            }

            if(angular.isArray(stateAuthLevel)) {
               return _inArray(stateAuthLevel, userAuthLevel);
            }

            $exceptionHandler('AuthService.authorize', 'Cannot process authorization');
            return false;
         },

         /**
          * @preserve
          * @param needle {String|Array}
          * @param haystack {Array}
          *
          * @returns {Boolean}
          */
         check: function(needle, haystack) {

            return _inArray(haystack, needle);
         },

         /**
          * @preserve
          * @returns {String|Null} - The Authentication Token
          */
         getAuthenticationToken: function() {

            return authToken;
         }

      };
   };
}
