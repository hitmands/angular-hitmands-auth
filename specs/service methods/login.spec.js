describe('hitmands.auth.AuthService.login', function() {
   var $httpBackend, AuthServiceProvider;
   var loginRoute = '/login';

   describe('Login without Basic Auth', function() {

      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(_AuthServiceProvider_, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider = _AuthServiceProvider_;
            AuthServiceProvider
               .parseHttpAuthData(function(data, header, statusCode) {
                  return {
                     user: data.user,
                     token: data.token
                  };
               })
               .useRoutes({ login: loginRoute });
         });
      });

      beforeEach(function() {
         angular.mock.inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
         });
      });

      it('Resolve Request', angular.mock.inject(
         function(AuthService, $exceptionHandler, $timeout) {
            $httpBackend
               .expectPOST(loginRoute)
               .respond(function(method, url, data, headers) {

                  expect(url).toEqual(loginRoute);


                  return [201, { user: { username: 'test' }, token: 'test' }, {}, ''];
               });

            AuthService
               .login({field1: 'test', field2: 'test'})
               .then(
               function(res) {
                  $timeout.flush();
                  expect(AuthService.isUserLoggedIn()).toBeTruthy();
               },
               function(err) {
               }
            );

            $httpBackend.flush();
         }
      ));

      it('Reject Request', angular.mock.inject(
         function(AuthService, $exceptionHandler) {
            $httpBackend
               .expectPOST(loginRoute)
               .respond(function(method, url, data, headers) {

                  expect(url).toEqual(loginRoute);


                  return [401, {}, ''];
               });

            AuthService
               .login({field1: 'test', field2: 'test'})
               .then(
               function(res) {
               },
               function(err) {
                  expect(AuthService.isUserLoggedIn()).toBeFalsy();
               }
            );

            $httpBackend.flush();
         }
      ));


      afterEach(function() {
         $httpBackend.verifyNoOutstandingExpectation();
         $httpBackend.verifyNoOutstandingRequest();
      })
   });

   describe('Login with Basic Auth', function() {

      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(_AuthServiceProvider_, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider = _AuthServiceProvider_;
            AuthServiceProvider
               .useBasicAuthentication()
               .parseHttpAuthData(function(data, header, statusCode) {
                  return {
                     user: data.user,
                     token: data.token
                  };
               })
               .useRoutes({ login: loginRoute });
         });
      });

      beforeEach(function() {
         angular.mock.inject(function(_$httpBackend_) {
            $httpBackend = _$httpBackend_;
         });
      });

      it('Resolve Request', angular.mock.inject(
         function(AuthService, $exceptionHandler, $timeout) {
            $httpBackend
               .expectPOST(loginRoute)
               .respond(function(method, url, data, headers) {
                  data = angular.fromJson(data);
                  expect(url).toEqual(loginRoute);
                  expect(data).toEqual({});
                  expect('Authorization' in headers).toBeTruthy();
                  var method = headers.Authorization.split(' ');
                  var credentials = method.pop();
                  expect(method.shift()).toEqual('Basic');
                  expect(credentials).toEqual(btoa('test' + ':' + 'testpwd'));



                  return [201, { user: { username: 'test' }, token: 'test' }, {}, ''];
               });

            AuthService
               .login({username: 'test', password: 'testpwd'})
               .then(
               function(res) {
                  $timeout.flush();
                  expect(AuthService.isUserLoggedIn()).toBeTruthy();
               },
               function(err) {
               }
            );

            $httpBackend.flush();
         }
      ));

      it('Reject Request', angular.mock.inject(
         function(AuthService, $exceptionHandler) {
            $httpBackend
               .expectPOST(loginRoute)
               .respond(function(method, url, data, headers) {



                  return [401, {}, ''];
               });

            AuthService
               .login({field1: undefined, field2: null})
               .then(
               function(res) {
               },
               function(err) {
                  expect(AuthService.isUserLoggedIn()).toBeFalsy();
               }
            );

            $httpBackend.flush();
         }
      ));


      afterEach(function() {
         $httpBackend.verifyNoOutstandingExpectation();
         $httpBackend.verifyNoOutstandingRequest();
      })
   });
});

