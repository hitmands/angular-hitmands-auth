describe('hitmands.auth.AuthServiceProvider.tokenizeHttp', function() {
   'use strict';
   var $httpBackend;

   describe('DEFAULT TOKEN', function() {
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');

            AuthServiceProvider.tokenizeHttp();
         });
      });


      beforeEach(function() {
         angular.mock.inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
         });
      });

      it('No token when no user logged in', angular.mock.inject(
         function(AuthService, $http) {
            AuthService.unsetCurrentUser();

            $httpBackend
               .expectGET('/api/test/token-default')
               .respond(function(method, url, data, headers) {
                  expect('x-auth-token' in headers).toBeFalsy();
                  return [200];
               });

            $http
               .get('/api/test/token-default');

            $httpBackend.flush();
         }
      ));


      it('Token and Default Header Key', angular.mock.inject(
         function(AuthService, $http) {

            var TOKEN = 'custom-auth-token';
            AuthService.setCurrentUser({
               username: 'test'
            }, 100, TOKEN);

            $httpBackend
               .expectGET('/api/test/token-default')
               .respond(function(method, url, data, headers) {
                  expect('x-auth-token' in headers).toBeTruthy();
                  expect(headers['x-auth-token']).toEqual(TOKEN);

                  return [200];
               });

            $http
               .get('/api/test/token-default');

            $httpBackend.flush();
         }
      ));

   });


   describe('CUSTOM TOKEN', function() {
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');

            AuthServiceProvider.tokenizeHttp('custom-auth-token-key');
         });
      });

      beforeEach(function() {
         angular.mock.inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
         });
      });

      it('Token and Custom Header Key', angular.mock.inject(
         function(AuthService, $http) {

            var TOKEN = 'custom-auth-token';
            AuthService.setCurrentUser({
               username: 'test'
            }, 100, TOKEN);

            $httpBackend
               .expectGET('/api/test/token-default')
               .respond(function(method, url, data, headers) {
                  expect('custom-auth-token-key' in headers).toBeTruthy();
                  expect(headers['custom-auth-token-key']).toEqual(TOKEN);

                  return [200];
               });

            $http
               .get('/api/test/token-default');

            $httpBackend.flush();
         }
      ));
   });


   describe('CUSTOM TOKEN AND RESPONSE ERROR INTERCEPTOR', function() {
      var responseError = null;
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');

            AuthServiceProvider.tokenizeHttp('custom-auth-token-key', function(config) {
               responseError = config;
            });
         });
      });

      beforeEach(function() {
         angular.mock.inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
         });
      });

      it('Interceptor can set responseError variable. Should have Token and Custom Header Key', angular.mock.inject(
         function(AuthService, $http) {

            var TOKEN = 'custom-auth-token';
            AuthService.setCurrentUser({
               username: 'test'
            }, 100, TOKEN);

            $httpBackend
               .expectGET('/api/test/token-default')
               .respond(function(method, url, data, headers) {
                  expect('custom-auth-token-key' in headers).toBeTruthy();
                  expect(headers['custom-auth-token-key']).toEqual(TOKEN);

                  return [401, 'error', {}, 'unauthorized'];
               });

            $http
               .get('/api/test/token-default');

            $httpBackend.flush();

            expect(responseError).not.toBeNull();
            expect(responseError.status).toEqual(401);
            responseError = null;
         }
      ));

      it('Interceptor not called in resolved promises. Should have Token and Custom Header Key', angular.mock.inject(
         function(AuthService, $http) {

            var TOKEN = 'custom-auth-token';
            AuthService.setCurrentUser({
               username: 'test'
            }, 100, TOKEN);

            $httpBackend
               .expectGET('/api/test/token-default')
               .respond(function(method, url, data, headers) {
                  expect('custom-auth-token-key' in headers).toBeTruthy();
                  expect(headers['custom-auth-token-key']).toEqual(TOKEN);

                  return [200];
               });

            $http
               .get('/api/test/token-default');

            $httpBackend.flush();

            expect(responseError).toBeNull();
            responseError = null;
         }
      ));

   });

   describe('DEFAULT TOKEN AND RESPONSE ERROR INTERCEPTOR', function() {
      var responseError = null;
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');

            AuthServiceProvider.tokenizeHttp(function(config) {
               responseError = config;
            });
         });
      });

      beforeEach(function() {
         angular.mock.inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
         });
      });

      it('Interceptor can set responseError variable. Should have Token and Default Header Key', angular.mock.inject(
         function(AuthService, $http) {

            var TOKEN = 'custom-auth-token';
            AuthService.setCurrentUser({
               username: 'test'
            }, 100, TOKEN);

            $httpBackend
               .expectGET('/api/test/token-default')
               .respond(function(method, url, data, headers) {
                  expect('x-auth-token' in headers).toBeTruthy();
                  expect(headers['x-auth-token']).toEqual(TOKEN);

                  return [401, 'error', {}, 'unauthorized'];
               });

            $http
               .get('/api/test/token-default');

            $httpBackend.flush();

            expect(responseError).not.toBeNull();
            expect(responseError.status).toEqual(401);
            responseError = null;
         }
      ));

   });


   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   })
});

