describe('hitmands.auth.AuthServiceRun.on.hitmands.auth:update', function() {
   var $httpBackend, AuthService, $state, $compile, $rootScope, $timeout, $location;

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
      function(_$compile_, _$rootScope_, _$httpBackend_, _$state_, _AuthService_, _$timeout_, _$location_) {
         $rootScope = _$rootScope_;
         $compile = _$compile_;
         $httpBackend = _$httpBackend_;
         $state = _$state_;
         AuthService = _AuthService_;
         $timeout = _$timeout_;
         $location = _$location_;

         AuthService.unsetCurrentUser();
      }
   ));

   it('hitmands.auth.update', function() {
      expect(AuthService.setCurrentUser({username: 'test'}, 'admin', 'tokentest')).toBeTruthy();
      $rootScope.$digest();

      $state
         .go('admin')
         .then(function(currentState) {
            expect($state.current.name).toEqual('admin');
            AuthService.unsetCurrentUser();
            expect(AuthService.isUserLoggedIn()).toBeFalsy();
            return $timeout.flush();
         })
         .then(function() {
            expect($location.path()).not.toEqual('/admin');
         });


   });

   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   })
});

