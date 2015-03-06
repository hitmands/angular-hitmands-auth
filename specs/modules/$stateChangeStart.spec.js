describe('hitmands.auth.AuthServiceRun.on.$stateChangeStart', function() {
   'use strict';
   var $httpBackend, AuthService, $state, $compile, $rootScope, $timeout;

   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider, $stateProvider) {
         $exceptionHandlerProvider.mode('log');

         $stateProvider
            .state('public', {
               url: '/public',
               authLevel: 0
            })
            .state('admin', {
               url: '/admin',
               authLevel: ['admin']
            });
      });
   });

   beforeEach(angular.mock.inject(
      function(_$compile_, _$rootScope_, _$httpBackend_, _$state_, _AuthService_, _$timeout_) {
         $rootScope = _$rootScope_;
         $compile = _$compile_;
         $httpBackend = _$httpBackend_;
         $state = _$state_;
         AuthService = _AuthService_;
         AuthService.unsetCurrentUser();
         $timeout = _$timeout_;
      }
   ));

   it('$stateChangeStart Not Prevented', function() {
      $state.go('public').then(function(currentState) {
         expect(currentState.name).toEqual('public');
      });

   });

   it('$stateChangeStart Unauthorized', function() {
      $state.go('admin').catch(function(error) {
         expect(error.message).toEqual('transition prevented');
      });

   });

   it('$stateChangeStart Forbidden', function() {
      expect(AuthService.setCurrentUser({username: 'test'}, 'author', 'tokentest')).toBeTruthy();

      $state.go('admin').catch(function(error) {
         expect(error.message).toEqual('transition prevented');
      });

   });

   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
      $timeout.flush();
   })
});

