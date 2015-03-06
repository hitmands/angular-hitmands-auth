describe('hitmands.auth.directives.authLogin', function() {
   'use strict';
   var $compile, $rootScope, AuthServiceProvider;
   var loginForm = '<form id="loginForm" name="loginForm" auth-login="fields" auth-login-on-resolve="onLogin" auth-login-on-reject="onLogout">' +
      '<input type="text" required ng-model="fields.username" name="username"/>' +
      '<input type="password" required ng-model="fields.password" name="password"/>' +
      '<button id="loginBtn" type="submit">submit</button>' +
      '</form>';

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


   it('Invalid Attrs', angular.mock.inject(
      function(AuthService) {
         spyOn(AuthService, 'login');
         var $scope = $rootScope.$new();
         $scope.fields = null;
         $scope.onLogin = {};
         $scope.onLogout = true;
         var el = $compile(loginForm)($scope);
         $scope.$digest();

         el.triggerHandler('submit');
         $scope.$digest();

         expect(AuthService.login).not.toHaveBeenCalled();
      }
   ));

   it('Valid Attrs and invalid form', angular.mock.inject(
      function(AuthService, $q) {
         spyOn(AuthService, 'login').andReturn($q.when());
         var $scope = $rootScope.$new();
         $scope.fields = {};
         $scope.onLogin = function(result) {};
         $scope.onLogout = function(rejection) {};
         var el = $compile(loginForm)($scope);
         $scope.$digest();

         el.triggerHandler('submit');
         $scope.$digest();
         expect($scope['loginForm'].$invalid).toBeTruthy();
         expect(AuthService.login).not.toHaveBeenCalled();
      }
   ));

   it('Valid Attrs and valid form', angular.mock.inject(
      function(AuthService, $q) {
         spyOn(AuthService, 'login').andReturn($q.when());
         var $scope = $rootScope.$new();
         $scope.fields = {
            username: 'test',
            password: 'test'
         };
         $scope.onLogin = function(result) {};
         $scope.onLogout = function(rejection) {};
         var el = $compile(loginForm)($scope);
         $scope.$digest();

         el.triggerHandler('submit');
         $scope.$digest();
         expect($scope['loginForm'].$valid).toBeTruthy();
         expect(AuthService.login).toHaveBeenCalled();
      }
   ));

   it('unbind on $destroy', angular.mock.inject(
      function(AuthService, $q) {
         spyOn(AuthService, 'login').andReturn($q.when());
         var $scope = $rootScope.$new();
         $scope.fields = {
            username: 'test',
            password: 'test'
         };
         var el = $compile(loginForm)($scope);

         $scope.$digest();

         $scope.$destroy();
         $scope.$digest();

         el.triggerHandler('submit');
         $scope.$digest();

         expect(AuthService.login).not.toHaveBeenCalled();
      }
   ));

   afterEach(function() {
   })
});

