/**
 * @ngdoc module
 * @name hitmands.auth
 * @module hitmands.auth
 **/
var currentUser = null;
var authToken = null;
var routes = {
   "login": '/users/login',
   "logout": '/users/logout',
   "fetch": '/users/me'
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

var AuthCurrentUser = (function() {
   var authProperty = 'authLevel';
   function AuthCurrentUser(userData, authLevel) {

      /* jshint ignore:start */
      for(var k in userData) {
         if(userData.hasOwnProperty(k) && k !== authProperty) {
            this[k] = userData[k];
         }
      }
      /* jshint ignore:end */

      Object.defineProperty(this, authProperty, {
         enumerable: true,
         value: authLevel || userData[authProperty] || 0
      });
   }

   AuthCurrentUser.getAuthProperty = function() {
      return authProperty;
   };

   return AuthCurrentUser;
}).call(this);

/* @ngInject */
function AuthModuleRun($rootScope, AuthService, $state, $location, $timeout) {
   function redirect() {
      $timeout(function() {
         $location.path('/');
      }, 0);
   }

   $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

      if( !AuthService.authorize(toState, AuthService.getCurrentUser()) ) {
         var _isUserLoggedIn = AuthService.isUserLoggedIn();
         event.preventDefault();

         $rootScope.$broadcast('$stateChangeError', toState, toParams, fromState, fromParams, {
            statusCode: _isUserLoggedIn ? 403 : 401,
            statusText: _isUserLoggedIn ? 'Forbidden' : 'Unauthorized',
            isUserLoggedIn: _isUserLoggedIn,
            publisher: 'AuthService.authorize'
         });

         if( !fromState.name ) {
            redirect();
         }
      }
   });

   $rootScope.$on(EVENTS.update, function(event) {
      if( !AuthService.authorize($state.current, AuthService.getCurrentUser()) ) {
         redirect();
      }
   });
}

angular
   .module('hitmands.auth', ['ui.router'])
   .provider('AuthService', AuthProviderFactory)
   .directive('authLogin', AuthLoginDirectiveFactory)
   .directive('authLogout', AuthLogoutDirectiveFactory)
   .directive('authClasses', AuthClassesDirectiveFactory)
   .run(AuthModuleRun);
