describe('hitmands.auth.directives.authClasses', function() {
   var $compile, $rootScope, AuthServiceProvider;
   var element = '<div id="testAuthClasses" auth-classes></div>';

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


   it('classList when user is logged in', angular.mock.inject(
      function(AuthService) {
         spyOn(AuthService, 'isUserLoggedIn').andReturn(true);
         spyOn(AuthService, 'getCurrentUser').andReturn({
            authLevel: ['admin', 'editor']
         });

         var $scope = $rootScope.$new();
         var el = $compile(element)($scope);
         $scope.$digest();

         expect(el.attr('class')).toContain('user-is-logged-in');
         expect(el.attr('class')).toContain('user-has-role-admin');
         expect(el.attr('class')).toContain('user-has-role-admin');
         expect(AuthService.isUserLoggedIn).toHaveBeenCalled();
         expect(AuthService.getCurrentUser).toHaveBeenCalled();
      }
   ));

   it('classList when user is NOT logged in', angular.mock.inject(
      function(AuthService) {
         spyOn(AuthService, 'isUserLoggedIn').andReturn(false);
         spyOn(AuthService, 'getCurrentUser').andReturn({
            authLevel: ['admin', 'editor']
         });

         var $scope = $rootScope.$new();
         var el = $compile(element)($scope);
         $scope.$digest();


         expect(el.attr('class')).toContain('user-not-logged-in');

         expect(el.attr('class')).not.toContain('user-is-logged-in');
         expect(el.attr('class')).not.toContain('user-has-role-admin');
         expect(el.attr('class')).not.toContain('user-has-role-admin');

         expect(AuthService.isUserLoggedIn).toHaveBeenCalled();
         expect(AuthService.getCurrentUser).not.toHaveBeenCalled();
      }
   ));


   it('test on hitmands.auth:update', angular.mock.inject(
      function(AuthService) {
         spyOn(AuthService, 'isUserLoggedIn').andCallThrough();
         spyOn(AuthService, 'getCurrentUser').andCallThrough();

         var $scope = $rootScope.$new();
         var el = $compile(element)($scope);
         $scope.$digest();
         expect(el.attr('class')).toContain('user-not-logged-in');
         expect(el.attr('class')).not.toContain('user-is-logged-in');

         AuthService.setCurrentUser({
            username: 'test'
         }, 1000, 'authTokenTest');
         $scope.$digest();


         expect(el.attr('class')).toContain('user-is-logged-in');
         expect(el.attr('class')).not.toContain('user-not-logged-in');

         expect(AuthService.isUserLoggedIn).toHaveBeenCalled();
         expect(AuthService.getCurrentUser).toHaveBeenCalled();
      }
   ));

   afterEach(function() {
   })
});

