ddescribe('hitmands.auth.AuthServiceProvider.setRedirectPath', function() {
   'use strict';
   var REDIRECT = '/auth/login';

   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider, $stateProvider) {
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
               url: REDIRECT
            })
         ;
      });
   });


   it('Test redirect', angular.mock.inject(
      function(AuthService, $exceptionHandler, $state, $location, $rootScope, $timeout) {
         $state.go('admin');
         $rootScope.$digest();
         $timeout.flush();
         expect($location.path()).toBe(REDIRECT);
         expect($state.current.name).toBe('login');
      }
   ));


   afterEach(function() {
   })
});

