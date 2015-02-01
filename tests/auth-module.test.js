describe('Angular Module Hitmands-Auth', function() {
   'use strict';
   var $httpBackend, $rootScope, httpLoginHandler, httpLogoutHandler, $controller, AuthServiceProvider, spyAuthService, getController;
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
         authLevel: 1000,
         token: '697b84c9c82f9abc6a80359c9125d293'
      },
      states: {
         admin: {
            name: 'admin',
            url: 'admin',
            authLevel: 1000
         },
         public: {
            name: 'public',
            url: 'public',
            authLevel: 0
         },
         dashboard: {
            name: 'dashboard',
            url: 'admin',
            data: {
               authLevel: 100000
            }
         }
      }
   };

   // Arrange (Set Up Scenario)
   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_, $stateProvider ) {
         AuthServiceProvider = _AuthServiceProvider_;
         AuthServiceProvider.parseHttpAuthData(function(data) {
            return {
               user: data,
               authLevel: data.authLevel,
               token: data.token
            };
         });
         $stateProvider
            .state(Mocks.states.public)
            .state(Mocks.states.admin)
            .state(Mocks.states.dashboard);
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


   it('Testing Module on $stateChangeStart event (Users-NOT-logged-in)', angular.mock.inject(
      function(AuthService, $state, $location) {
         AuthService.unsetCurrentUser();
         expect(AuthService.isUserLoggedIn()).toBeFalsy();

         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

         expect(AuthService.authorize).toHaveBeenCalled();
         expect($state.current.name).not.toEqual(Mocks.states.admin.name);

         AuthService.setCurrentUser(Mocks.user, 10, Mocks.user.token);
         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

      }
   ));



   it('Testing Module on $stateChangeStart event (Users-IS-logged-in)', angular.mock.inject(
      function(AuthService, $state, $location, $timeout) {

         AuthService.setCurrentUser(Mocks.user, 10000000, Mocks.user.token);
         expect(AuthService.isUserLoggedIn()).toBeTruthy();

         $state.transitionTo(Mocks.states.dashboard.name);
         $rootScope.$digest();

         expect(AuthService.authorize).toHaveBeenCalled();
         expect($state.current.name).toEqual(Mocks.states.dashboard.name);

         AuthService.authorize($state.current);

         AuthService.unsetCurrentUser();
         $timeout.flush();
      }
   ));

   it('Testing Module on $stateChangeStart event (User-IS-logged-in)', angular.mock.inject(
      function(AuthService,  $state) {

         Mocks.user.authLevel = 1000; // giving permission
         AuthService.setCurrentUser(Mocks.user, Mocks.user.authLevel, Mocks.user.token);
         expect(AuthService.isUserLoggedIn()).toBeTruthy();

         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

         expect($state.current.name).toEqual(Mocks.states.admin.name);
      }
   ));

   it('Testing Module on $stateChangeStart event (User-IS-logged-in)', angular.mock.inject(
      function(AuthService,  $state) {

         Mocks.user.authLevel = 1000; // giving permission
         AuthService.setCurrentUser(Mocks.user, Mocks.user.authLevel, Mocks.user.token);
         expect(AuthService.isUserLoggedIn()).toBeTruthy();

         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

         expect($state.current.name).toEqual(Mocks.states.admin.name);
      }
   ));

   it('Testing Module on $stateChangeStart event (User-IS-logged-in)', angular.mock.inject(
      function(AuthService,  $state, $timeout) {

         Mocks.user.authLevel = 1000; // giving permission
         AuthService.setCurrentUser(Mocks.user, Mocks.user.authLevel, Mocks.user.token);
         expect(AuthService.isUserLoggedIn()).toBeTruthy();

         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

         expect($state.current.name).toEqual(Mocks.states.admin.name);

         AuthService.unsetCurrentUser();
         $timeout.flush();
      }
   ));

   it('Testing Module on currentUser Update event', angular.mock.inject(
      function(AuthService,  $state, $location) {

         AuthService.setCurrentUser(Mocks.user, Mocks.user.token);
         AuthService.unsetCurrentUser();
         expect(AuthService.isUserLoggedIn()).toBeFalsy();
      }
   ));

   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
