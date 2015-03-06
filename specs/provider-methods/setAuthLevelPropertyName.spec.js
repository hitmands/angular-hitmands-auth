describe('hitmands.auth.AuthServiceProvider.setAuthLevelPropertyName', function() {
   'use strict';
   var $httpBackend;

   describe('invalid param', function() {
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider
               .setAuthLevelPropertyName();
         });
      });




      it('Test login Route', angular.mock.inject(
         function(AuthService) {

         }
      ));
   });


   describe('valid param', function() {
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider
               .setAuthLevelPropertyName('my-custom-authlevel-property-name');
         });
      });




      it('Test login Route', angular.mock.inject(
         function(AuthService) {

            AuthService.setCurrentUser({}, 1000, 'custom-token');
            expect(AuthService.getCurrentUser().authLevel).toBeUndefined();
            expect(AuthService.getCurrentUser()['my-custom-authlevel-property-name']).toBeDefined();
         }
      ));
   });


   describe('restore authlevel for other specs', function() {
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider
               .setAuthLevelPropertyName('authLevel');
         });
      });

      it('Test login Route', angular.mock.inject(
         function(AuthService) {
            AuthService.setCurrentUser({}, 1000, 'custom-token');

            expect(AuthService.getCurrentUser().authLevel).toBeDefined();
         }
      ));
   });


   afterEach(function() {
   })
});

