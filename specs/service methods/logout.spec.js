describe('hitmands.auth.AuthService.logout', function() {
   var $httpBackend, AuthServiceProvider;
   var logoutRoute = '/logout';


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
            .useRoutes({ logout: logoutRoute });
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
            .expectPOST(logoutRoute)
            .respond(function(method, url, data, headers) {

               expect(url).toEqual(logoutRoute);


               return [201, { user: { username: 'test' }, token: 'test' }, {}, ''];
            });

         AuthService
            .logout()
            .then(
            function(res) {
               $timeout.flush();
               expect(AuthService.isUserLoggedIn()).not.toBeTruthy();
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
            .expectPOST(logoutRoute)
            .respond(function(method, url, data, headers) {

               expect(url).toEqual(logoutRoute);


               return [401, {}, ''];
            });

         AuthService
            .logout()
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

