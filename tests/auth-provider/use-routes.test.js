describe('Angular Module Hitmands-Auth:AuthService.useRoutes', function() {
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


   it('AuthServiceProvider.useRoutes should set routes', angular.mock.inject(
         function(AuthService) {

            AuthServiceProvider.useRoutes({
               logout: '/api/v1/users/logout',
               login: '/api/v1/users/login',
               fetch: '/api/v1/users/current'
            });

            $httpBackend.expectPOST('/api/v1/users/login').respond(200, Mocks.user);
            AuthService.login();
            $httpBackend.flush();

            $httpBackend.expectGET('/api/v1/users/current').respond(200, Mocks.user);
            AuthService.fetchLoggedUser();
            $httpBackend.flush();

            $httpBackend.expectPOST('/api/v1/users/logout').respond([200, null]);
            AuthService.logout();
            $httpBackend.flush();
         })
   );



   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
