/**
 * @ngdoc module
 * @name hitmands.auth
 * @module hitmands.auth
 **/

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

/* @ngInject */
function moduleRun($rootScope, AuthService, $state, $location) {
   $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

      if( !AuthService.authorize(toState, AuthService.getCurrentUser()) ) {
         var _isUserLoggedIn = AuthService.isUserLoggedIn();

         $rootScope.$broadcast('$stateChangeError', toState, toParams, fromState, fromParams, {
            statusCode: _isUserLoggedIn ? 403 : 401,
            statusText: _isUserLoggedIn ? 'Forbidden' : 'Unauthorized',
            isUserLoggedIn: _isUserLoggedIn,
            publisher: 'AuthService.authorize'
         });

         if( !fromState.name ) {
            return $location.path('/');
         }

         alert('ciao');
         event.preventDefault();
      }
   });

   $rootScope.$on(EVENTS.update, function(event) {
      if( !AuthService.isUserLoggedIn() && !AuthService.authorize($state.current, AuthService.getCurrentUser()) ) {
         return $location.path('/');
      }
   });
}

angular
   .module('hitmands.auth', ['ui.router'])
   .provider('AuthService', AuthProviderFactory)
   .directive('authLogin', AuthLoginDirectiveFactory)
   .directive('authLogout', AuthLogoutDirectiveFactory)
   .directive('authClasses', AuthClassesDirectiveFactory)
   .run(moduleRun);
