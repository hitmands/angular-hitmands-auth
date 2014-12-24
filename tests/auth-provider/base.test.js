describe('Angular Module Hitmands-Auth:AuthService', function() {
   'use strict';

   var AuthServiceProvider, $rootScope, $scope, $exceptionHandlerProvider;

   // Authentication Test Cases
   var Mocks = {
      validCredentials: {
         username: 'hitmands',
         password: 'asdasd'
      },
      invalidCredentials: {
         username: '',
         password: ''
      },
      user: {
         username: 'Hitmands',
         id: 1,
         slug: 'giuseppe-mandato',
         name: 'Giuseppe',
         authLevel: 1000,
         surname: 'Mandato',
         token: '697b84c9c82f9abc6a80359c9125d293'
      },
      states: {
         admin: {
            authLevel: 1000
         },
         public: {
            authLevel: 0
         }
      }
   };

   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_, _$exceptionHandlerProvider_ ) {
         AuthServiceProvider = _AuthServiceProvider_;
         $exceptionHandlerProvider = _$exceptionHandlerProvider_;
         $exceptionHandlerProvider = $exceptionHandlerProvider.mode('log');
      });
   });
   beforeEach(angular.mock.inject(
      function( _$rootScope_, AuthService) {
         $rootScope = _$rootScope_;
         $scope = $rootScope.$new();
         spyOn(AuthService, 'authorize').andCallThrough();
      }
   ));

   it('Should Have a Working AuthService', angular.mock.inject(
      function(AuthService) {
         expect(AuthServiceProvider).toBeDefined();
         expect(AuthServiceProvider.setLoggedUser).toEqual( jasmine.any(Function) );
         expect(AuthServiceProvider.getLoggedUser).toEqual( jasmine.any(Function) );
         expect(AuthServiceProvider.tokenizeHttp).toEqual( jasmine.any(Function) );
         expect(AuthServiceProvider.parseHttpAuthData).toEqual( jasmine.any(Function) );
         expect(AuthServiceProvider.useRoutes).toEqual( jasmine.any(Function) );

         expect(AuthService).toBeDefined();
         expect(AuthService.login).toEqual( jasmine.any(Function) );
         expect(AuthService.logout).toEqual( jasmine.any(Function) );
         expect(AuthService.authorize).toEqual( jasmine.any(Function) );
         expect(AuthService.fetchLoggedUser).toEqual( jasmine.any(Function) );
         expect(AuthService.getCurrentUser).toEqual( jasmine.any(Function) );
         expect(AuthService.setCurrentUser).toEqual( jasmine.any(Function) );
         expect(AuthService.unsetCurrentUser).toEqual( jasmine.any(Function) );
         expect(AuthService.isUserLoggedIn).toEqual( jasmine.any(Function) );
         expect(AuthService.getAuthenticationToken).toEqual( jasmine.any(Function) );
      }
   ));

   it('Set Current User', angular.mock.inject(
      function(AuthService) {
         expect(AuthService.getCurrentUser()).toBeNull();
         AuthService.setCurrentUser(Mocks.user, Mocks.user.authLevel, Mocks.user.token);
         expect(AuthService.getCurrentUser()).toEqual(Mocks.user);
      }
   ));
   it('Can\'t Set Current User', angular.mock.inject(
      function(AuthService) {
         expect(AuthService.getCurrentUser()).toBeNull();

         AuthService.setCurrentUser(Mocks.user, '');
         expect(AuthService.getCurrentUser()).not.toEqual(Mocks.user);
         expect(AuthService.getCurrentUser()).toBeNull();

         AuthService.setCurrentUser([Mocks.user], Mocks.user.authLevel, '');
         expect(AuthService.getCurrentUser()).not.toEqual(Mocks.user);
         expect(AuthService.getCurrentUser()).toBeNull();
      }
   ));

   it('Get AuthenticationToken', angular.mock.inject(
      function(AuthService) {
         expect(AuthService.getCurrentUser()).toBeNull();
         AuthService.setCurrentUser(Mocks.user, Mocks.user.authLevel, Mocks.user.token);

         expect(AuthService.getAuthenticationToken()).toEqual(Mocks.user.token);

         AuthService.unsetCurrentUser();
         expect(AuthService.getAuthenticationToken()).toBeNull();
         expect(AuthService.getAuthenticationToken()).not.toEqual(Mocks.user.token);
      }
   ));

   it('AuthService.authorize bad parameter passed', angular.mock.inject(
      function(AuthService, $exceptionHandler) {
         expect(AuthService.authorize()).toBeFalsy();
         expect($exceptionHandler.errors).toContain([
            'AuthService.authorize',
            'first params must be ui-router $state'
         ]);

      }
   ));

   it('AuthService.authorize cases when no users are logged-in', angular.mock.inject(
      function(AuthService) {

         expect(AuthService.authorize(Mocks.states.public)).toBeTruthy();
         expect(AuthService.authorize(Mocks.states.admin)).toBeFalsy();
      }
   ));

   it('AuthService.authorize cases when no users are logged-in', angular.mock.inject(
      function(AuthService) {
         var user = angular.copy(Mocks.user);
         user.authLevel = 0;

         AuthServiceProvider.setLoggedUser(Mocks.user, Mocks.user.authLevel, Mocks.user.token);

         expect(AuthService.authorize(Mocks.states.public)).toBeTruthy();
         expect(AuthService.authorize(Mocks.states.admin)).toBeFalsy();

         expect(AuthService.authorize(Mocks.states.admin, user)).toBeFalsy();
         user.authLevel = 100000;
         expect(AuthService.authorize(Mocks.states.admin, user)).toBeTruthy();

         expect(AuthService.authorize).toHaveBeenCalledWith(Mocks.states.admin, user);
      }
   ));

});
