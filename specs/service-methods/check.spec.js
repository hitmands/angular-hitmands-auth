describe('hitmands.auth.AuthService.check', function() {
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

   it('check should return false', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var haystack = ['itemA'];
         var needle = 'test';
         expect(AuthService.check(needle, haystack)).toBeFalsy();
      }
   ));

   it('check should return true', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var haystack = ['itemA'];
         var needle = 'itemA';
         expect(AuthService.check(needle, haystack)).toBeTruthy();
      }
   ));

   it('check should return true', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var haystack = ['itemA'];
         var needle = ['itemA'];
         expect(AuthService.check(needle, haystack)).toBeTruthy();
      }
   ));


   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   })

});

