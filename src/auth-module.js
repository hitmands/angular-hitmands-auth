/**
 * @ngdoc module
 * @name hitmands.auth
 * @module hitmands.auth
 **/
angular
   .module('hitmands.auth', ['ui.router'])
   .run(function($rootScope, AuthService, $state, $location, $stateParams, $q) {
      var afterLoginRedirectTo = null;

      $rootScope.$on('hitmands.auth:login.resolved', function(event) {
         if( angular.isObject(afterLoginRedirectTo) && AuthService.authorize(afterLoginRedirectTo.state) ) {
            $state.transitionTo(
               afterLoginRedirectTo.state.name,
               afterLoginRedirectTo.params
            );
         }

         afterLoginRedirectTo = null;
      });


      $rootScope.$on('hitmands.auth:fetch.resolved', function(event) {
         if( angular.isObject(afterLoginRedirectTo) && AuthService.authorize(afterLoginRedirectTo.state) ) {
            $state.transitionTo(
               afterLoginRedirectTo.state.name,
               afterLoginRedirectTo.params
            );
         }

         afterLoginRedirectTo = null;
      });


      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

         if( !AuthService.authorize(toState) ) {
            var _isUserLoggedIn = AuthService.isUserLoggedIn();

            $rootScope.$broadcast('$stateChangeError', toState, toParams, fromState, fromParams, {
               statusCode: 403,
               statusText: 'Forbidden',
               isUserLoggedIn: _isUserLoggedIn
            });


            if( !fromState.name && _isUserLoggedIn ) {
               return $location.path('/');
            }


            event.preventDefault();

            if( !fromState.name || !_isUserLoggedIn ) {
               afterLoginRedirectTo = {
                  state: toState,
                  params: toParams
               };
               return AuthService.authenticationRedirect();
            }

         }
      });


      $rootScope.$on('hitmands.auth:update', function(event, userData) {
         if( !AuthService.authorize($state.current) ) {
            AuthService.authenticationRedirect();
         }
      });



   });
