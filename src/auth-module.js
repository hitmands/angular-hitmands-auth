/**
 * @ngdoc module
 * @name hitmands.auth
 * @module hitmands.auth
 **/
var AUTO_ROUTING_PROTECTION = true;
var AUTH_PROPERTY = 'authLevel';
var currentUser = null;
var authToken = null;
var routes = {
   "login": '/users/login',
   "logout": '/users/logout',
   "fetch": '/users/me',
   "__redirectPath__": '/'
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
   function AuthCurrentUser(userData, authLevel) {

      /* jshint ignore:start */
      for(var k in userData) {
         if(userData.hasOwnProperty(k) && k !== AUTH_PROPERTY) {
            this[k] = userData[k];
         }
      }
      /* jshint ignore:end */

      Object.defineProperty(this, AUTH_PROPERTY, {
         enumerable: true,
         value: authLevel || 0
      });
   }

   return AuthCurrentUser;
}).call(this);

/* @ngInject */
function AuthModuleRun($rootScope, AuthService, $state, $location, $timeout) {
   function redirect() {
      $timeout(function() {
         $location.path(routes.__redirectPath__);
      }, 0);
   }

   if(AUTO_ROUTING_PROTECTION) {
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

         if( !AuthService.authorize(toState, AuthService.getCurrentUser()) ) {
            event.preventDefault();
            var _isUserLoggedIn = AuthService.isUserLoggedIn();

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
}

angular
   .module('hitmands.auth', ['ui.router'])
   .provider('AuthService', AuthServiceProviderFactory)
   .directive('authLogin', AuthLoginDirectiveFactory)
   .directive('authLogout', AuthLogoutDirectiveFactory)
   .directive('authClasses', AuthClassesDirectiveFactory)
   .run(AuthModuleRun);
