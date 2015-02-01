describe('Angular Module Hitmands-Auth:AuthService.tokenizeHttp', function() {
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
         authLevel: 1000,
         slug: 'giuseppe-mandato',
         name: 'Giuseppe',
         surname: 'Mandato',
         token: '697b84c9c82f9abc6a80359c9125d293'
      }
   };

   describe('Using default token key', function() {
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
            AuthServiceProvider.tokenizeHttp();
         });
      });

      beforeEach(angular.mock.inject(
         function( _$rootScope_, _$controller_, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
         }
      ));


      it('AuthServiceProvider.tokenizeHttp should NOT set authToken if no users is logged in', angular.mock.inject(
            function(AuthService, $http) {

               expect(AuthService.getCurrentUser()).toBeNull();

               $httpBackend.expectGET('/sample-route')
                  .respond(function( method, url, data, headers ) {

                     expect(headers['x-auth-token']).toBeUndefined();

                     return [201, ''];
                  });

               $http.get('/sample-route');
               $httpBackend.flush();
            })
      );

      it('AuthServiceProvider.tokenizeHttp should set authToken Value', angular.mock.inject(
            function(AuthService, $http) {
               expect(AuthService.getCurrentUser()).toBeNull();

               AuthServiceProvider.setLoggedUser(Mocks.user, Mocks.user.token, Mocks.user.authLevel);

               expect(AuthService.getCurrentUser()).toEqual(Mocks.user);
               expect(AuthService.getAuthenticationToken()).toEqual(Mocks.user.token);

               $httpBackend.expectGET('/sample-route')
                  .respond(function( method, url, data, headers ) {

                     expect(('x-auth-token' in headers)).toBeTruthy();
                     expect(headers['x-auth-token']).toBeDefined();
                     expect(headers.hasOwnProperty('x-auth-token')).toBeTruthy();
                     expect(headers['x-auth-token']).toEqual(Mocks.user.token);
                     return [201, ''];
                  });

               $http.get('/sample-route');
               $httpBackend.flush();

            })
      );
   });

   describe('Change TokenKey', function() {

      // Arrange (Set Up Scenario)
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_ ) {
            AuthServiceProvider = _AuthServiceProvider_;
            AuthServiceProvider.tokenizeHttp('sample-token-key');
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

      it('AuthServiceProvider.tokenizeHttp should set authToken Value', angular.mock.inject(
            function(AuthService, $http) {
               AuthService.unsetCurrentUser();
               expect(AuthService.getCurrentUser()).toBeNull();

               AuthServiceProvider.setLoggedUser(Mocks.user, Mocks.user.token);

               expect(AuthService.getCurrentUser()).toEqual(Mocks.user);
               expect(AuthService.getAuthenticationToken()).toEqual(Mocks.user.token);

               $httpBackend.expectDELETE('/users/' + Mocks.user.id)
                  .respond(function( method, url, data, headers ) {

                     expect(headers['x-auth-token']).toBeUndefined();
                     expect(('sample-token-key' in headers)).toBeTruthy();
                     expect(headers.hasOwnProperty('sample-token-key')).toBeTruthy();
                     expect(headers['sample-token-key']).toEqual(Mocks.user.token);
                     return [200, null]
                  });

               $http['delete']('/users/' + Mocks.user.id);
               $httpBackend.flush();

            })
      );

   });



   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
