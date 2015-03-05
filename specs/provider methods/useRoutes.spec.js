describe('hitmands.auth.AuthServiceProvider.userRoutes', function() {
   var $httpBackend;

   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
         $exceptionHandlerProvider.mode('log');
         AuthServiceProvider
            .useRoutes({login: '/api/test/login'})
            .useRoutes({logout: '/api/test/logout'})
            .useRoutes({fetch: '/api/test/fetch'})
         ;
      });
   });




   it('Test login Route', angular.mock.inject(
      function(AuthService, $exceptionHandler, _$httpBackend_) {
         $httpBackend = _$httpBackend_;
         $httpBackend
            .expectPOST('/api/test/login')
            .respond();

         AuthService.login();

         $httpBackend.flush();
      }
   ));

   it('Test logout Route', angular.mock.inject(
      function(AuthService, $exceptionHandler, _$httpBackend_) {
         $httpBackend = _$httpBackend_;
         $httpBackend
            .expectPOST('/api/test/logout')
            .respond();

         AuthService.logout();

         $httpBackend.flush();
      }
   ));

   it('Test fetch Route', angular.mock.inject(
      function(AuthService, $exceptionHandler, _$httpBackend_) {
         $httpBackend = _$httpBackend_;
         $httpBackend
            .expectGET('/api/test/fetch')
            .respond();

         AuthService.fetch();

         $httpBackend.flush();
      }
   ));


   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   })
});

