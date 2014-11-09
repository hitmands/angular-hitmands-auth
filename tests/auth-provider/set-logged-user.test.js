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


   it('AuthServiceProvider.setLoggedUser should not set Current User', angular.mock.inject(
         function() {
            AuthServiceProvider.setLoggedUser();
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser('invalidParameterType', 'invalidParameterType');
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser(['invalidParameterType'], ['invalidParameterType']);
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser(Infinity, NaN);
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser(null, null);
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser(Mocks.user);
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser(Mocks.user, '');
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser(Mocks.user, function() {});
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser(null, Mocks.user.token);
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser('invalidParameterType', Mocks.user.token);
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser(['invalidParameterType'], Mocks.user.token);
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();

            AuthServiceProvider.setLoggedUser(function() {}, Mocks.user.token);
            expect(AuthServiceProvider.getLoggedUser()).toBeNull();
         })
   );

   it('AuthServiceProvider.setLoggedUser should set Current User', angular.mock.inject(
         function() {
            AuthServiceProvider.setLoggedUser(Mocks.user, Mocks.user.token);

            expect(AuthServiceProvider.getLoggedUser()).toEqual(Mocks.user);
            expect(AuthServiceProvider.getLoggedUser()).not.toBeNull();
         })
   );




   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
