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
         return AuthServiceRedirect.go();
      });

      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
         if( error.statusCode === 403 || error.statusCode === 401 ) {
            return AuthServiceRedirect.set(toState, toParams);
         }
      });


      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

         if( !AuthService.authorize(toState) ) {
            var _isUserLoggedIn = AuthService.isUserLoggedIn();

            $rootScope.$broadcast('$stateChangeError', toState, toParams, fromState, fromParams, {
               statusCode: _isUserLoggedIn ? 403 : 401,
               statusText: _isUserLoggedIn ? 'Forbidden' : 'Unauthorized',
               isUserLoggedIn: _isUserLoggedIn
            });

            if( !fromState.name && _isUserLoggedIn ) {
               return $location.path('/');
            }

            event.preventDefault();


            if( !fromState.name || !_isUserLoggedIn ) {
               return AuthServiceRedirect.otherwise();
            }

         }
      });

      $rootScope.$on(EVENTS.update, function(event, userData) {
         var _isUserLoggedIn = AuthService.isUserLoggedIn();

         if( !AuthService.authorize($state.current) && _isUserLoggedIn) {
            return $location.path('/');
         }

         if( !AuthService.authorize($state.current) && !_isUserLoggedIn ) {
            return AuthServiceRedirect.otherwise();
         }
      });

   });
