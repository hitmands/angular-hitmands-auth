describe('hitmands.auth.AuthService.getCurrentUser', function() {
   'use strict';
   var $httpBackend, AuthServiceProvider;
   var logoutRoute = '/logout';


   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function(_AuthServiceProvider_, $exceptionHandlerProvider) {
         $exceptionHandlerProvider.mode('log');
         AuthServiceProvider = _AuthServiceProvider_;
      });
   });

   beforeEach(function() {
      angular.mock.inject(function(_$httpBackend_, AuthService) {
         $httpBackend = _$httpBackend_;
         AuthService.unsetCurrentUser();
      });
   });

   it('get Current User should return null', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var token = '12312';
         var user = { username: 'test' };
         var authLevel = [];
         expect(AuthService.getCurrentUser()).toBeNull();
      }
   ));

   it('get Current User should return an object', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var token = '12312';
         var user = { username: 'test' };
         var authLevel = [];
         AuthService.setCurrentUser(user, authLevel, token);

         expect(AuthService.getCurrentUser()).not.toBeNull();
         expect(AuthService.getCurrentUser().authLevel).toBeDefined();
         expect(AuthService.getCurrentUser().username).toEqual(user.username);
      }
   ));


   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   })

});

