describe('hitmands.auth.AuthService.isUserLoggedIn', function() {
   var $httpBackend, AuthServiceProvider;
   var logoutRoute = '/logout';


   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function(_AuthServiceProvider_, $exceptionHandlerProvider) {
         $exceptionHandlerProvider.mode('log');
         AuthServiceProvider = _AuthServiceProvider_;
      });
   });

   beforeEach(function() {
      angular.mock.inject(function(_$httpBackend_, AuthService) {
         $httpBackend = _$httpBackend_;
         AuthService.unsetCurrentUser();
      });
   });

   it('isUserLoggedIn should return false', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var token = '12312';
         var user = { username: 'test' };
         var authLevel = [];
         expect(AuthService.isUserLoggedIn()).toBeFalsy();
      }
   ));

   it('isUserLoggedIn should return true', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var token = '12312';
         var user = { username: 'test' };
         var authLevel = [];
         AuthService.setCurrentUser(user, authLevel, token);

         expect(AuthService.isUserLoggedIn()).toBeTruthy();
      }
   ));


   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   })

});

