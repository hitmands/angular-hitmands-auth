/* @ngInject */
function AuthProviderFactory( $httpProvider ) {
   var self = this;
   var currentUser = null;
   var authToken = null;


   /**
    * @preserve
    * @callback Requester~requestCallback - The callback that handles the response.
    */
   var _dataParser = function (data, headers, statusCode) {
      return {
         user: data,
         token: data.token
      };
   };

   /**
    *
    * @returns {Boolean}
    * @private
    */
   function _isUserLoggedIn() {

      return angular.isObject( self.getLoggedUser() );
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
    * Extends Used Routes
    *
    * @preserve
    * @param {Object} [newRoutes = {login: String, logout: String, fetch: String, authRedirect: String}]
    */
   this.useRoutes = function AuthServiceRoutesListGetterSetter( newRoutes ) {
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
         tokenKey = 'X-AUTH-TOKEN';
      }

      $httpProvider.interceptors.push(function($q) {

         return {
            request: function(config) {

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
    * @preserve
    * @param {Object|null} [user=null]
    * @param {String|null} [authenticationToken=null]
    */
   this.setLoggedUser = function AuthServiceLoggedUserSetter( user, authenticationToken ) {
      if( !angular.isObject( user ) || !angular.isString(authenticationToken) || authenticationToken.length < 1 ) {
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
   this.setDataParser = function AuthServiceExpectDataAs( callback ) {
      if( angular.isFunction(callback) ) {

         _dataParser =  callback;
      }

      return this;
   };


   this.$get = function($rootScope, $q, $http, $exceptionHandler, $state) {

      /**
       * @preserve
       * @param {Object|null} newUserData
       * @param {String|null} newAuthToken
       * @private
       */
      var _setLoggedUser = function( newUserData, newAuthToken ) {
         self.setLoggedUser( newUserData, newAuthToken );
         $rootScope.$broadcast(EVENTS.update, self.getLoggedUser(), _isUserLoggedIn());
      };

      /**
       * @param parsedData
       * @returns {{user: Object|null, token: string|null}}
       */
      var sanitizeParsedData = function( parsedData ) {
         if( !angular.isObject(parsedData) || !angular.isObject(parsedData.user) || !angular.isString(parsedData.token) || parsedData.token.length < 1) {
            $exceptionHandler('AuthService.processServerData', 'Invalid callback passed. The Callback must return an object like {user: Object, token: String}');

            parsedData = {
               user: null,
               token: null
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
         login: function( credentials ) {

            return $http
               .post(routes.login, credentials, { cache: false })
               .then(
               function( result ) {
                  var data = sanitizeParsedData( _dataParser(result.data, result.headers(), result.status) );

                  _setLoggedUser( data.user, data.token );
                  $rootScope.$broadcast(EVENTS.login.success, result);

                  return result;
               },
               function( error ) {
                  _setLoggedUser( null, null );
                  $rootScope.$broadcast(EVENTS.login.error, error);

                  return error;
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
                  var data = sanitizeParsedData( _dataParser(result.data, result.headers(), result.status) );

                  _setLoggedUser( data.user, data.token );
                  $rootScope.$broadcast(EVENTS.fetch.success, result);

                  return result;
               },
               function( error ) {
                  _setLoggedUser( null, null );
                  $rootScope.$broadcast(EVENTS.fetch.error, error);

                  return error;
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
                  _setLoggedUser( null, null );
                  $rootScope.$broadcast(EVENTS.logout.success, result);

                  return result;
               },
               function( error ) {
                  _setLoggedUser( null, null );
                  $rootScope.$broadcast(EVENTS.logout.error, error);

                  return error;
               }
            );
         },

         /**
          * @preserve
          * @param {Object} user
          * @param {String} authenticationToken
          */
         setCurrentUser: function(user, authenticationToken) {
            _setLoggedUser( user, authenticationToken );
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
          * @returns {Boolean} Is the CurrentUser Authorized for State?
          */
         authorize: function( state ) {

            if( !angular.isNumber(state.authLevel) || state.authLevel < 1) {
               return true;
            }

            if( !_isUserLoggedIn() ) {
               return false;
            }

            return ( (self.getLoggedUser().authLevel || 0) >= state.authLevel);
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

angular
   .module('hitmands.auth')
   .provider('AuthService', AuthProviderFactory);
