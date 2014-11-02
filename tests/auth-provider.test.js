xdescribe('Angular Module Hitmands-Auth:AuthService', function() {
   'use strict';
   var $httpBackend, $rootScope, httpLoginHandler, httpLogoutHandler, $controller, AuthServiceProvider, getController;

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
         AuthServiceProvider.tokenizeHttp();
      });
   });

   beforeEach(angular.mock.inject(
      function( _$rootScope_, _$controller_, _$httpBackend_) {

         $httpBackend = _$httpBackend_;
         $controller = _$controller_;
         $rootScope = _$rootScope_;

         httpLoginHandler = $httpBackend
            .whenPOST('/users/login')
            .respond(function( method, url, data, headers ) {
               data = angular.fromJson(data);

               var resolve = [200, Mocks.user, { 'X-AUTH-TOKEN' : Mocks.user.token }];
               var reject = [401, null];
               var isValid  = angular.equals(data, Mocks.validCredentials );

               return isValid ? resolve : reject;
            });

         httpLogoutHandler = $httpBackend
            .whenPOST('/users/logout')
            .respond([200, null]);

      }
   ));


   xit('Should Have a Working AuthService', angular.mock.inject(
      function(AuthService) {
         expect(AuthServiceProvider).toBeDefined();
         expect(AuthServiceProvider.setLoggedUser).toEqual( jasmine.any(Function) );
         expect(AuthServiceProvider.getLoggedUser).toEqual( jasmine.any(Function) );
         expect(AuthServiceProvider.tokenizeHttp).toEqual( jasmine.any(Function) );
         expect(AuthServiceProvider.useRoutes).toEqual( jasmine.any(Function) );

         expect(AuthService).toBeDefined();
         expect(AuthService.login).toEqual( jasmine.any(Function) );
         expect(AuthService.logout).toEqual( jasmine.any(Function) );
         expect(AuthService.authorize).toEqual( jasmine.any(Function) );
         expect(AuthService.authenticationRedirect).toEqual( jasmine.any(Function) );
         expect(AuthService.fetchLoggedUser).toEqual( jasmine.any(Function) );
         expect(AuthService.getCurrentUser).toEqual( jasmine.any(Function) );
         expect(AuthService.isUserLoggedIn).toEqual( jasmine.any(Function) );
         expect(AuthService.getAuthenticationToken).toEqual( jasmine.any(Function) );
      }
   ));



   it('Should Resolve Login Request', angular.mock.inject(
      function(AuthService) {

         expect(AuthService.isUserLoggedIn()).toBeFalsy();
         expect(AuthService.getCurrentUser()).toBeNull();
         expect(AuthService.getAuthenticationToken()).toBeNull();

         $httpBackend.expectPOST('/users/login');
         AuthService.login(Mocks.validCredentials);
         $httpBackend.flush();

         expect(AuthService.isUserLoggedIn()).toBeTruthy();
         expect(AuthService.getCurrentUser()).toEqual(Mocks.user);
         expect(AuthService.getAuthenticationToken()).toEqual(Mocks.user.token);
      }
   ));


   it('Should Resolve Logout Request', angular.mock.inject(
      function(AuthService) {

         $httpBackend.expectPOST('/users/login');
         AuthService.login(Mocks.validCredentials);
         $httpBackend.flush();

         expect(AuthService.isUserLoggedIn()).toBeTruthy();
         expect(AuthService.getCurrentUser()).toEqual(Mocks.user);
         expect(AuthService.getAuthenticationToken()).toEqual(Mocks.user.token);

         $httpBackend.expectPOST('/users/logout');
         AuthService.logout();
         $httpBackend.flush();

         expect(AuthService.isUserLoggedIn()).toBeFalsy();
         expect(AuthService.getCurrentUser()).toBeNull();
         expect(AuthService.getAuthenticationToken()).toBeNull();
      }
   ));


   it('Should Fetch UserSessionData', angular.mock.inject(
      function(AuthService) {

         $httpBackend.expectPOST('/users/login');
         $httpBackend
            .expectGET('/users/me')
            .respond(function( method, url, data, headers ) {
               var resolve = [200, Mocks.user, { 'X-AUTH-TOKEN' : Mocks.user.token }];
               var reject = [401, null];
               return AuthService.isUserLoggedIn() ? resolve : reject;
            });


         AuthService
            .login(Mocks.validCredentials)
            .finally(function() {

               expect(AuthService.isUserLoggedIn()).toBeTruthy();
               AuthService.fetchLoggedUser();
            });



         $httpBackend.flush();
         expect(AuthService.isUserLoggedIn()).toBeTruthy();
         expect(AuthService.getCurrentUser()).toEqual(Mocks.user);
         expect(AuthService.getAuthenticationToken()).toEqual(Mocks.user.token);
      }
   ));

   it('Should Have X-AUTH-TOKEN in all loggedIn HttpRequests', angular.mock.inject(
      function(AuthService) {

         $httpBackend
            .expectGET('/users/me')
            .respond(function( method, url, data, headers ) {
               var resolve = [200, Mocks.user, { 'X-AUTH-TOKEN' : Mocks.user.token }];
               var reject = [401, null];

               expect(headers['X-AUTH-TOKEN']).not.toBeDefined();

               return AuthService.isUserLoggedIn() ? resolve : reject;
            });
         AuthService.fetchLoggedUser();


         AuthService.login(Mocks.validCredentials);
         $httpBackend.flush();

         $httpBackend
            .expectGET('/users/me')
            .respond(function( method, url, data, headers ) {
               var resolve = [200, Mocks.user, { 'X-AUTH-TOKEN' : Mocks.user.token }];
               var reject = [401, null];
               expect(headers['X-AUTH-TOKEN']).toEqual(Mocks.user.token);
               return AuthService.isUserLoggedIn() ? resolve : reject;
            });
         AuthService.fetchLoggedUser();
         $httpBackend.flush();
      }
   ));


   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
