describe('Angular Module Hitmands-Auth:AuthService', function() {
   'use strict';
   var $httpBackend, $rootScope,$controller, AuthServiceProvider;

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
         name: 'Giuseppe',
         surname: 'Mandato',
         token: '697b84c9c82f9abc6a80359c9125d293'
      }
   };

   // Arrange (Set Up Scenario)
   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_ ) {
         AuthServiceProvider = _AuthServiceProvider_;
      });
   });

   beforeEach(angular.mock.inject(
      function( _$rootScope_, _$controller_, _$httpBackend_) {

         $httpBackend = _$httpBackend_;
         $controller = _$controller_;
         $rootScope = _$rootScope_;
      }
   ));



   it('Should Resolve FetchLoggedUser', angular.mock.inject(
      function(AuthService) {
         AuthServiceProvider.setLoggedUser(Mocks.user, Mocks.user.token);

         $httpBackend
            .expectGET('/users/me')
            .respond(function( method, url, data, headers ) {
               var resolve = [200, Mocks.user, { 'X-AUTH-TOKEN' : Mocks.user.token }];
               var reject = [401, null];
               return AuthService.isUserLoggedIn() ? resolve : reject;
            });
         AuthService.fetchLoggedUser();
         $httpBackend.flush();

         expect(AuthService.isUserLoggedIn()).toBeTruthy();
         expect(AuthService.getCurrentUser()).toEqual(Mocks.user);
         expect(AuthService.getAuthenticationToken()).toEqual(Mocks.user.token);
      }
   ));


   it('Should Not Resolve FetchLoggedUser', angular.mock.inject(
      function(AuthService) {
         AuthServiceProvider.setLoggedUser(Mocks.user, 'sampleToken');

         $httpBackend
            .expectGET('/users/me')
            .respond(function( method, url, data, headers ) {
               var resolve = [200, Mocks.user, { 'X-AUTH-TOKEN' : Mocks.user.token }];
               var reject = [498, null];

               return (headers['x-auth-token'] === Mocks.user.token) ? resolve : reject;
            });
         AuthService.fetchLoggedUser();
         $httpBackend.flush();

         expect(AuthService.isUserLoggedIn()).toBeFalsy();
         expect(AuthService.getCurrentUser()).toBeNull();
         expect(AuthService.getAuthenticationToken()).toBeNull();
      }
   ));


   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
