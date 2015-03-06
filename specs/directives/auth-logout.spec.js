describe('hitmands.auth.directives.authLogout', function() {
   'use strict';
   var $compile, $rootScope, AuthServiceProvider;
   var logoutBtn = '<button id="logoutBtn" type="button" auth-logout>submit</button>';

   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function(_AuthServiceProvider_, $exceptionHandlerProvider) {
         AuthServiceProvider = _AuthServiceProvider_;
         $exceptionHandlerProvider.mode('log');
      });
   });


   beforeEach(angular.mock.inject(
      function(_$compile_, _$rootScope_) {
         $rootScope = _$rootScope_;
         $compile = _$compile_;
      }
   ));



   it('Logout', angular.mock.inject(
      function(AuthService, $q) {
         spyOn(AuthService, 'logout');
         var $scope = $rootScope.$new();

         var el = $compile(logoutBtn)($scope);
         $scope.$digest();

         el.triggerHandler('click');
         $scope.$digest();

         expect(AuthService.logout).toHaveBeenCalled();
      }
   ));

   it('unbind on $destroy', angular.mock.inject(
      function(AuthService, $q) {
         spyOn(AuthService, 'logout');
         var $scope = $rootScope.$new();
         var el = $compile(logoutBtn)($scope);

         $scope.$digest();

         $scope.$destroy();
         $scope.$digest();

         el.triggerHandler('click');
         $scope.$digest();

         expect(AuthService.logout).not.toHaveBeenCalled();
      }
   ));

   afterEach(function() {
   })
});

