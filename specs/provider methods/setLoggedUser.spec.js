describe('hitmands.auth.AuthServiceProvider.setLoggedUser', function() {
   var $httpBackend, AuthServiceProvider;

   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function(_AuthServiceProvider_, $exceptionHandlerProvider) {
         $exceptionHandlerProvider.mode('log');
         AuthServiceProvider = _AuthServiceProvider_;
      });
   });





   it('No AuthCurrentUser Instance', angular.mock.inject(
      function(AuthService) {
         AuthServiceProvider.setLoggedUser();
         expect(AuthService.isUserLoggedIn()).toBeFalsy();
      }
   ));

   it('No AuthCurrentUser Instance (Wrong Params)', angular.mock.inject(
      function(AuthService) {
         expect(AuthService.isUserLoggedIn()).toBeFalsy();
         AuthServiceProvider.setLoggedUser([]);
         expect(AuthService.isUserLoggedIn()).toBeFalsy();
      }
   ));

   it('No AuthCurrentUser Instance (Wrong Params)', angular.mock.inject(
      function(AuthService) {
         expect(AuthService.isUserLoggedIn()).toBeFalsy();
         AuthServiceProvider.setLoggedUser({}, '');
         expect(AuthService.isUserLoggedIn()).toBeFalsy();
      }
   ));

   it('Create AuthCurrentUser Instance', angular.mock.inject(
      function(AuthService) {
         expect(AuthService.isUserLoggedIn()).toBeFalsy();
         AuthServiceProvider.setLoggedUser({}, 'string');
         expect(AuthService.isUserLoggedIn()).toBeTruthy();
      }
   ));

   it('Destroy AuthCurrentUser Instance', angular.mock.inject(
      function(AuthService) {
         expect(AuthService.isUserLoggedIn()).toBeTruthy();
         AuthServiceProvider.setLoggedUser();
         expect(AuthService.isUserLoggedIn()).toBeFalsy();
      }
   ));


   afterEach(function() {

   })
});

