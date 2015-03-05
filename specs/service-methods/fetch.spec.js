describe('hitmands.auth.AuthService.fetch', function() {
   var $httpBackend, AuthServiceProvider;
   var fetchRoute = '/user/me';


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
            .useRoutes({ fetch: fetchRoute });
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
            .expectGET(fetchRoute)
            .respond(function(method, url, data, headers) {

               expect(url).toEqual(fetchRoute);


               return [201, { user: { username: 'test' }, token: 'test' }, {}, ''];
            });

         AuthService
            .fetch()
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
            .expectGET(fetchRoute)
            .respond(function(method, url, data, headers) {

               expect(url).toEqual(fetchRoute);


               return [401, {}, ''];
            });

         AuthService
            .fetch()
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

