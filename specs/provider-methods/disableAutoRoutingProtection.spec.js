describe('hitmands.auth.AuthServiceProvider.disableAutoRoutingProtection', function() {
   'use strict';
   var AuthServiceProvider;

   describe('no call $stateChangeError', function() {
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(_AuthServiceProvider_, $exceptionHandlerProvider, $stateProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider = _AuthServiceProvider_ ;
            AuthServiceProvider.disableAutoRoutingProtection();
            $stateProvider.state('admin', {
               url: '/admin/',
               authLevel: ['admin']
            });
         });
      });




      it('go to protected state admin', angular.mock.inject(
         function(AuthService, $state) {
            spyOn(AuthService, 'authorize');
            expect(AuthService.isUserLoggedIn()).toBeFalsy();

            $state.go('admin').then(function() {
               console.log('resolved')
            });

            expect(AuthService.isUserLoggedIn()).toBeFalsy();
            expect(AuthService.authorize).not.toHaveBeenCalled();
         }
      ));
   });

   afterEach(function() {
   })
});

