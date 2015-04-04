describe('hitmands.auth.AuthServiceProvider.setRedirectPath', function() {
   'use strict';
   var REDIRECT = '/auth/login';
   var AuthServiceProvider;

   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function(_AuthServiceProvider_, $exceptionHandlerProvider, $stateProvider) {
         AuthServiceProvider = _AuthServiceProvider_;
         $exceptionHandlerProvider.mode('log');

         AuthServiceProvider
            .setRedirectPath(REDIRECT)
         ;
         $stateProvider
            .state('admin', {
               url: 'admin/',
               authLevel: 1000
            })
            .state('login', {
               url: 'auth/login',
               authLevel: 0
            })
         ;
      });
   });

   it('Test redirect', angular.mock.inject(
      function(AuthService, $exceptionHandler, $state, $location, $rootScope, $timeout) {

         $state.go('admin').finally(function() {
            $timeout.flush();
         });
         $rootScope.$digest();

      }
   ));


   afterEach(function() {
      AuthServiceProvider
         .setRedirectPath('/')
      ;
   })
});

