describe('Angular Module Hitmands-Auth:Directives', function() {
   'use strict';
   var $compile, $rootScope, $scope;

   // Authentication Test Cases
   var Mocks = {
      validCredentials: {
         username: 'hitmands',
         password: 'asdasd'
      }
   };

   var loginForm, logoutButton;

   // Arrange (Set Up Scenario)
   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function() {});
   });

   beforeEach(angular.mock.inject(
      function(_$rootScope_) {
         $rootScope = _$rootScope_;
      }
   ));


   beforeEach(angular.mock.inject(
      function(_$compile_) {
         $compile = _$compile_;
         $scope = $rootScope.$new();

         $scope.fields = Mocks.validCredentials;

         loginForm = '<form id="loginForm" name="loginForm" auth-login="fields">' +
         '<input type="text" required ng-model="fields.username"/>' +
         '<input type="password" required ng-model="fields.password"/>' +
         '</form>';

         logoutButton = '<button auth-logout>Logout</button>';



      }
   ));


   it('Should Login directive Call AuthService.login Method', angular.mock.inject(
      function(AuthService) {
         spyOn(AuthService, 'login');

         angular.element(document.body).append($compile(loginForm)($scope));
         $scope.$digest();


         document.querySelector('form').dispatchEvent( new Event('submit') );

         expect(AuthService.login).toHaveBeenCalled();
         expect(AuthService.login).toHaveBeenCalledWith(Mocks.validCredentials);
      }
   ));


   it('Should not call logi', angular.mock.inject(
      function(AuthService) {
         spyOn(AuthService, 'login');

         $scope.fields = {};
         angular.element(document.body).append($compile(loginForm)($scope));
         $scope.$digest();


         document.querySelector('form').dispatchEvent( new Event('submit') );

         expect(AuthService.login).not.toHaveBeenCalled();
      }
   ));


   it('Should Logout directive Call AuthService.logout Method', angular.mock.inject(
      function(AuthService) {
         spyOn(AuthService, 'logout');

         angular.element(document.body).append($compile(logoutButton)($scope));
         $scope.$digest();


         document.querySelector('button').dispatchEvent( new Event('click') );

         expect(AuthService.logout).toHaveBeenCalled();
         expect(AuthService.logout).toHaveBeenCalledWith();
      }
   ));

});
