describe('hitmands.auth.AuthService.getAuthenticationToken', function() {
   var $httpBackend, AuthServiceProvider;
   var logoutRoute = '/logout';


   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function(_AuthServiceProvider_, $exceptionHandlerProvider) {
         $exceptionHandlerProvider.mode('log');
         AuthServiceProvider = _AuthServiceProvider_;
      });
   });

   beforeEach(function() {
      angular.mock.inject(function(_$httpBackend_) {
         $httpBackend = _$httpBackend_;
      });
   });

   it('getAuthenticationToken should return Null', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var token = '12312';
         var user = { username: 'test' };
         var authLevel = [];
         expect(AuthService.getAuthenticationToken()).toBeNull();
      }
   ));

   it('getAuthenticationToken should return String', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var token = '12312';
         var user = { username: 'test' };
         var authLevel = [];
         AuthService.setCurrentUser(user, authLevel, token);

         expect(AuthService.getAuthenticationToken()).toEqual(token);
      }
   ));


   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   })

});

