/* @ngInject */
function AuthProviderFactory( $httpProvider ) {
   var self = this;
   var currentUser = null;
   var authToken = null;
   var routes = {
      "login": '/users/login',
      "logout": '/users/logout',
      "fetch": '/users/me',
      "authenticationRedirect": '/login'
   };
   var EVENTS = {
      login: {
         success: 'hitmands.auth:login.resolved',
         error: 'hitmands.auth:login.rejected'
      },
      logout: {
         success: 'hitmands.auth:logout.resolved',
         error: 'hitmands.auth:logout.rejected'
      },
      fetch: {
         success: 'hitmands.auth:fetch.resolved',
         error: 'hitmands.auth:fetch.rejected'
      },
      update: 'hitmands.auth:update'
   };

   /**
    *
    * Extends Used Routes
    * @param {Object} [newRoutes = {login: String, logout: String, fetch: String, authRedirect: String}]
    */
   this.useRoutes = function AuthServiceRoutesListGetterSetter( newRoutes ) {
      if( angular.isObject(newRoutes) ) {
         routes = angular.extend(routes, newRoutes);
      }

      return this;
   };


   /**
    *
    * Get the CurrentUser Object or Null
    * @returns {Object|null}
    */
   this.getLoggedUser = function AuthServiceLoggedUserGetter() {

      return currentUser;
   };

   /**
    *
    * @returns {Boolean}
    * @private
    */
   var _isUserLoggedIn = function() {

      return angular.isObject( self.getLoggedUser() );
   };

   var _getAuthToken = function() {
      return authToken;
   };

   /**
    *
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
    *
    * Appends Authentication Token to all $httpRequests
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



   this.$get = function($rootScope, $q, $http, $state) {

      /**
       *
       * @param {Object|null} newUserData
       * @param {String|null} newAuthToken
       * @private
       */
      var _setLoggedUser = function( newUserData, newAuthToken ) {
         self.setLoggedUser( newUserData, newAuthToken );
         $rootScope.$broadcast(EVENTS.update, self.getLoggedUser(), _isUserLoggedIn());
      };


      return {

         /**
          *
          * Performs Login Request
          * @param {{username: String, password: String, rememberMe: Boolean}} credentials
          * @returns {ng.IPromise}
          */
         login: function( credentials ) {

            return $http
               .post(routes.login, credentials, { cache: false })
               .then(
               function( result ) {
                  _setLoggedUser( result.data, result.data.token );
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
          *
          * Updates the CurrentUser Object
          * @returns {ng.IPromise}
          */
         fetchLoggedUser: function() {

            return $http
               .get(routes.fetch, { cache: false })
               .then(
               function( result ) {
                  _setLoggedUser( result.data, result.data.token );
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
          *
          * Performs Logout request
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
          *
          * @returns {Object|Null} - Current User Data
          */
         getCurrentUser: function() {

            return self.getLoggedUser();
         },

         /**
          *
          * Checks if the user is logged in
          * @returns {Boolean}
          */
         isUserLoggedIn: function() {

            return _isUserLoggedIn();
         },

         /**
          *
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
          *
          * Redirects User to Authentication Route
          * @returns void
          */
         authenticationRedirect: function() {

            $state.transitionTo( routes.authenticationRedirect, {}, { inherit: false });
         },

         /**
          *
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
