/**
 * @ngdoc module
 * @name hitmands.auth
 * @module hitmands.auth
 **/

var routes = {
   "login": '/users/login',
   "logout": '/users/logout',
   "fetch": '/users/me',
   "otherwise": '/login'
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

angular
   .module('hitmands.auth', ['ui.router'])
   .run(function($rootScope, AuthService, $state, $location, AuthServiceRedirect, $stateParams, $q) {

      $rootScope.$on(EVENTS.login.success, function() {
         if( AuthServiceRedirect.isSetted() ) {
            return AuthServiceRedirect.go();
         }
      });

      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
         if( error.publisher === 'AuthService.authorize' && (error.statusCode === 403 || error.statusCode === 401) ) {
            return AuthServiceRedirect.set(toState, toParams);
         }
      });

      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

         if( !AuthService.authorize(toState, AuthService.getCurrentUser()) ) {
            var _isUserLoggedIn = AuthService.isUserLoggedIn();

            $rootScope.$broadcast('$stateChangeError', toState, toParams, fromState, fromParams, {
               statusCode: _isUserLoggedIn ? 403 : 401,
               statusText: _isUserLoggedIn ? 'Forbidden' : 'Unauthorized',
               isUserLoggedIn: _isUserLoggedIn,
               publisher: 'AuthService.authorize'
            });
            event.preventDefault();

            if( !fromState.name && _isUserLoggedIn ) {
               AuthServiceRedirect.goHome();
            }

            if( !fromState.name && !_isUserLoggedIn ) {
               return AuthServiceRedirect.otherwise();
            }

         }
      });

      $rootScope.$on(EVENTS.update, function(event) {
         var _isUserLoggedIn = AuthService.isUserLoggedIn();
         var currentUser = AuthService.getCurrentUser();

         if( _isUserLoggedIn && !AuthService.authorize($state.current, currentUser) ) {
            return $location.path('/');
         }

         if( !_isUserLoggedIn && !AuthService.authorize($state.current, currentUser) ) {
            return AuthServiceRedirect.otherwise();
         }
      });

   });
