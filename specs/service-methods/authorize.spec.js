describe('hitmands.auth.AuthService.authorize', function() {
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
      angular.mock.inject(function(_$httpBackend_) {
         $httpBackend = _$httpBackend_;
      });
   });

   it('authorize, bad parameter passed', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            authLevel: 1000
         };
         expect(AuthService.authorize('test')).toBeFalsy();
         expect($exceptionHandler.errors.pop()).toContain('AuthService.authorize');
      }
   ));

   it('authorize, bad parameter passed', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            authLevel: '1000'
         };
         expect(AuthService.authorize($state)).toBeFalsy();
         expect($exceptionHandler.errors.pop()).toContain('AuthService.authorize');
      }
   ));


   it('authorize should return false, authlevel {Number}', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            authLevel: 1000
         };
         expect(AuthService.authorize($state)).toBeFalsy();
      }
   ));

   it('authorize should return false, data.authlevel {Number}', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            data: {
               authLevel: 1000
            }
         };
         expect(AuthService.authorize($state)).toBeFalsy();
      }
   ));

   it('authorize should return true, no authlevel {default: 0}', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {};
         expect(AuthService.authorize($state)).toBeTruthy();
      }
   ));

   it('authorize should return true', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            authLevel: 1000
         };
         AuthService.setCurrentUser({}, 1000, 'test');
         expect(AuthService.authorize($state)).toBeTruthy();
      }
   ));

   it('authorize should return false', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            authLevel: 1000
         };
         AuthService.setCurrentUser({}, 100, 'test');
         expect(AuthService.authorize($state)).toBeFalsy();
      }
   ));


   it('authorize should return false, authlevel {Array}', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            authLevel: ['public']
         };
         expect(AuthService.authorize($state)).toBeFalsy();
      }
   ));

   it('authorize should return false, data.authlevel {Array}', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            data: {
               authLevel: ['public']
            }
         };
         expect(AuthService.authorize($state)).toBeFalsy();
      }
   ));

   // TODO: define the behaviour when authLevel is Empty Array
   it('authorize should return true, no authlevel {EmptyArray}', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            authLevel: []
         };
         expect(AuthService.authorize($state)).toBeTruthy();
      }
   ));

   it('authorize should return true', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            authLevel: ['test']
         };
         AuthService.setCurrentUser({}, ['test'], 'test');
         expect(AuthService.authorize($state)).toBeTruthy();
      }
   ));

   it('authorize should return false', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var $state = {
            authLevel: ['test:write', 'test:read']
         };
         AuthService.setCurrentUser({}, ['test'], 'test');
         expect(AuthService.authorize($state)).toBeFalsy();
      }
   ));

   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   })

});

