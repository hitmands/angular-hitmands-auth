xdescribe('Angular Module Hitmands-Auth', function() {
   'use strict';
   var $httpBackend, $rootScope, AuthRedirectHelperProvider, httpLoginHandler, httpLogoutHandler, $controller, AuthServiceProvider, spyAuthService, getController;

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
         surname: 'Mandato',
         token: '697b84c9c82f9abc6a80359c9125d293'
      },
      states: {
         admin: {
            name: 'admin',
            authLevel: 1000
         },
         public: {
            name: 'public',
            authLevel: 0
         }
      }
   };

   // Arrange (Set Up Scenario)
   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthRedirectHelperProvider_, _AuthServiceProvider_, $stateProvider ) {
         AuthServiceProvider = _AuthServiceProvider_;
         AuthRedirectHelperProvider = _AuthRedirectHelperProvider_;

         $stateProvider
            .state(Mocks.states.public)
            .state(Mocks.states.admin);
      });
   });

   beforeEach(angular.mock.inject(
      function( _$rootScope_, _$controller_, _$httpBackend_, AuthService) {

         spyOn(AuthService, 'authorize').andCallThrough();
         $httpBackend = _$httpBackend_;
         $controller = _$controller_;
         $rootScope = _$rootScope_;

         httpLoginHandler = $httpBackend
            .whenPOST('/users/login')
            .respond(function( method, url, data, headers ) {
               data = angular.fromJson(data);

               var resolve = [200, Mocks.user, { 'X-AUTH-TOKEN' : Mocks.user.token }];
               var reject = [401, null];
               var isValid  = angular.equals(data, Mocks.validCredentials );

               return isValid ? resolve : reject;
            });

         httpLogoutHandler = $httpBackend
            .whenPOST('/users/logout')
            .respond([200, null]);
      }
   ));


   it('AuthService.authorize Should broadcast StateChangeError when no users are logged-in', angular.mock.inject(
      function(AuthService, AuthRedirectHelper, $state) {

         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

         console.log(AuthService.authorize(), 'pippo');
         expect(AuthService.authorize).toHaveBeenCalled();
         expect($state.current.name).toEqual(Mocks.states.public.name);
      }
   ));

   it('AuthService.authorize Should broadcast StateChangeError when no users are logged-in', angular.mock.inject(
      function(AuthService, AuthRedirectHelper, $state) {
         AuthServiceProvider.useRoutes({
            otherwise: 'public'
         });

         Mocks.user.authLevel = 10;
         AuthService.setCurrentUser(Mocks.user, Mocks.user.token);

         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

         expect($state.current.name).not.toEqual(Mocks.states.admin.name);
         expect($state.current.name).not.toEqual(Mocks.states.public.name);
      }
   ));



   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
