ddescribe('Angular Module Hitmands-Auth', function() {
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
         }
      }
   };

   // Arrange (Set Up Scenario)
   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_, $stateProvider ) {
         AuthServiceProvider = _AuthServiceProvider_;

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


   it('Testing Service on $stateChangeStart event', angular.mock.inject(
      function(AuthService, $state, $location) {

         expect(AuthService.isUserLoggedIn()).toBeFalsy();

         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

         expect(AuthService.authorize).toHaveBeenCalled();
         expect($state.current.name).not.toEqual(Mocks.states.admin.name);
      }
   ));

   it('AuthService.authorize Should broadcast StateChangeError when no users are logged-in', angular.mock.inject(
      function(AuthService,  $state) {

         Mocks.user.authLevel = 1000; // giving permission
         AuthService.setCurrentUser(Mocks.user, Mocks.user.token);
         expect(AuthService.isUserLoggedIn()).toBeTruthy();

         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

         expect($state.current.name).toEqual(Mocks.states.admin.name);
      }
   ));



   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
