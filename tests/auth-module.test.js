describe('Angular Module Hitmands-Auth', function() {
   'use strict';
   var $httpBackend, $rootScope, httpLoginHandler, httpLogoutHandler, $controller, AuthServiceProvider, getController;

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
      angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_, $stateProvider ) {
         AuthServiceProvider = _AuthServiceProvider_;
         $stateProvider
            .state(Mocks.states.public)
            .state(Mocks.states.admin);
      });
   });

   beforeEach(angular.mock.inject(
      function( _$rootScope_, _$controller_, _$httpBackend_, AuthService) {

         $httpBackend = _$httpBackend_;
         $controller = _$controller_;
         $rootScope = _$rootScope_;

         spyOn($rootScope, '$broadcast').andCallThrough();
         spyOn($rootScope, '$on').andCallThrough();

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


   it('Should call $broadcast event', angular.mock.inject(
      function(AuthService, AuthServiceRedirect) {
         AuthService.login(Mocks.validCredentials);
         $httpBackend.flush();

         expect($rootScope.$broadcast).toHaveBeenCalled();

      }
   ));

   it('AuthService.authorize Should broadcast StateChangeError when no users are logged-in', angular.mock.inject(
      function(AuthService, AuthServiceRedirect, $state) {
         AuthServiceProvider.useRoutes({
            otherwise: 'public'
         });

         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

         expect($rootScope.$broadcast).toHaveBeenCalled();
         expect($state.current.name).toEqual(Mocks.states.public.name);
      }
   ));

   it('AuthService.authorize Should broadcast StateChangeError when no users are logged-in', angular.mock.inject(
      function(AuthService, AuthServiceRedirect, $state) {
         AuthServiceProvider.useRoutes({
            otherwise: 'public'
         });

         Mocks.user.authLevel = 10;
         AuthService.setCurrentUser(Mocks.user, Mocks.user.token);
         $state.transitionTo(Mocks.states.admin.name);
         $rootScope.$digest();

         expect($rootScope.$broadcast).toHaveBeenCalled();
         expect($state.current.name).not.toEqual(Mocks.states.admin.name);
         expect($state.current.name).not.toEqual(Mocks.states.public.name);
      }
   ));



   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
