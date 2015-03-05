describe('hitmands.auth.AuthService.setCurrentUser', function() {
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

   it('Set Current User', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var token = '12312';
         var user = { username: 'test' };
         var authLevel = [];
         expect(AuthService.getCurrentUser()).toBeNull();

         expect(AuthService.setCurrentUser(user, authLevel, token)).toBeTruthy();

         expect(AuthService.getCurrentUser()).not.toBeNull();
         expect(AuthService.getCurrentUser().authLevel).toBeDefined();
         expect(AuthService.getCurrentUser().username).toEqual(user.username);
         expect(AuthService.getCurrentUser().authLevel).toEqual(authLevel);

         expect(AuthService.getAuthenticationToken()).toEqual(token);

         AuthService.unsetCurrentUser();
      }
   ));


   it('Not-Set Current User', angular.mock.inject(
      function(AuthService, $exceptionHandler, $timeout) {
         var token = '12312';
         var user = { username: 'test' };
         var authLevel = [];
         expect(AuthService.getCurrentUser()).toBeNull();

         expect(AuthService.setCurrentUser()).toBeFalsy();

         expect(AuthService.getCurrentUser()).toBeNull();
         expect(AuthService.getAuthenticationToken()).toBeNull();
      }
   ));

   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   })

});

