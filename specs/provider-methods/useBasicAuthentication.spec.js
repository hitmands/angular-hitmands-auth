describe('hitmands.auth.AuthServiceProvider.useBasicAuthentication', function() {
   var $httpBackend;
   var loginData = {param1: 'test1', param2: 'test2', username: 'test', password: 'test'};

   describe('no basic authenticatino', function() {
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider
               .useRoutes({login: '/api/test/login'})
            ;
         });
      });




      it('no Authentication in headers', angular.mock.inject(
         function(AuthService, $exceptionHandler, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $httpBackend
               .expectPOST('/api/test/login')
               .respond(function(method, url, data, headers) {
                  data = angular.fromJson(data);
                  expect('Authorization' in headers).toBeFalsy();
                  expect(data.username).toBeDefined();
                  expect(data.password).toBeDefined();
                  return [200];
               });

            AuthService.login(angular.copy(loginData));

            $httpBackend.flush();
         }
      ));
   });

   describe('with basic authentication', function() {
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider
               .useRoutes({login: '/api/test/login'})
               .useBasicAuthentication()
            ;
         });
      });




      it('with auth in header', angular.mock.inject(
         function(AuthService, $exceptionHandler, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $httpBackend
               .expectPOST('/api/test/login')
               .respond(function(method, url, data, headers) {
                  data = angular.fromJson(data);

                  expect('Authorization' in headers).toBeTruthy();
                  var _auth = headers['Authorization'].split(' ');
                  var authMethod = _auth.shift();
                  var credentials = _auth.pop();

                  expect(authMethod).toEqual('Basic');
                  expect(credentials).toEqual(window.btoa(loginData.username + ':' + loginData.password));

                  expect(data.username).toBeUndefined();
                  expect(data.password).toBeUndefined();
                  return [200];
               });

            AuthService.login(angular.copy(loginData));

            $httpBackend.flush();
         }
      ));
   });



   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   })
});

