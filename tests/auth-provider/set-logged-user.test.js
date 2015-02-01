describe('Angular Module Hitmands-Auth:AuthService.setLoggedUser', function() {
   'use strict';
   var $httpBackend, $rootScope, $controller, AuthServiceProvider;

   // Authentication Test Cases
   var Mocks = {
      validCredentials: {
         username: 'hitmands',
         password: 'asdasd'
      },
      invalidCredentials: {
         username: '',
         password: ''
      },
      user: {
         username: 'Hitmands',
         id: 1,
         slug: 'giuseppe-mandato',
         authLevel: 1000,
         name: 'Giuseppe',
         surname: 'Mandato',
         token: '697b84c9c82f9abc6a80359c9125d293'
      }
   };

   // Arrange (Set Up Scenario)
   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_ ) {
         AuthServiceProvider = _AuthServiceProvider_;
         AuthServiceProvider.parseHttpAuthData(function(data) {
            return {
               user: data,
               authLevel: data.authLevel,
               token: data.token
            };
         });
      });
   });

   beforeEach(angular.mock.inject(
      function( _$rootScope_, _$controller_, _$httpBackend_) {
         $httpBackend = _$httpBackend_;
         $controller = _$controller_;
         $rootScope = _$rootScope_;
      }
   ));


   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
