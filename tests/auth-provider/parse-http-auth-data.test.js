describe('Angular Module Hitmands-Auth:AuthService.parseHttpAuthData', function() {
   'use strict';
   var $httpBackend, $rootScope, $controller, AuthServiceProvider, $exceptionHandlerProvider;

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
      }
   };

   describe('Passing bad parameter type', function() {
      // Arrange (Set Up Scenario)
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_ ) {
            AuthServiceProvider = _AuthServiceProvider_;
            AuthServiceProvider.parseHttpAuthData('invalidParameterType');
         });
      });

      beforeEach(angular.mock.inject(
         function( _$rootScope_, _$controller_, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
         }
      ));


      it('AuthServiceProvider.parseHttpAuthData doesn\'t take effect', angular.mock.inject(
            function(AuthService, $http) {

               expect(AuthService.getCurrentUser()).toBeNull();
               AuthServiceProvider.setLoggedUser(Mocks.user, Mocks.user.token);
               expect(AuthService.getCurrentUser()).toEqual(Mocks.user);

            })
      );

   });

   describe('Passing invalid callback', function() {
      // Arrange (Set Up Scenario)
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_, _$exceptionHandlerProvider_  ) {
            $exceptionHandlerProvider = _$exceptionHandlerProvider_;
            $exceptionHandlerProvider = $exceptionHandlerProvider.mode('log');
            AuthServiceProvider = _AuthServiceProvider_;
            AuthServiceProvider.parseHttpAuthData(function(data, headers, status) {
               return {
                  user: data,
                  token: {}
               };
            });
         });
      });

      beforeEach(angular.mock.inject(
         function( _$rootScope_, _$controller_, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
         }
      ));


      it('AuthServiceProvider.parseHttpAuthData should obtain Exception', angular.mock.inject(
            function(AuthService, $http, $exceptionHandler) {
               expect(AuthService.getCurrentUser()).toBeNull();

               $httpBackend
                  .expectPOST('/users/login')
                  .respond(200, Mocks.user);
               AuthService.login();
               $httpBackend.flush();

               expect($exceptionHandler.errors).toContain([
                  'AuthServiceProvider.parseHttpAuthData',
                  'Invalid callback passed. The Callback must return an object like {user: Object, token: String, authLevel: Number|Array}'
               ]);

               expect(AuthService.getCurrentUser()).not.toEqual(Mocks.user);
            })
      );

   });

   describe('Passing valid callback', function() {
      // Arrange (Set Up Scenario)
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_) {
            AuthServiceProvider = _AuthServiceProvider_;
            AuthServiceProvider.parseHttpAuthData(function(data, headers, status) {
               return {
                  user: data[0],
                  token: data[1]
               }
            });
         });
      });

      beforeEach(angular.mock.inject(
         function( _$rootScope_, _$controller_, _$httpBackend_) {
            $httpBackend = _$httpBackend_;
            $controller = _$controller_;
            $rootScope = _$rootScope_;
         }
      ));


      it('AuthServiceProvider.parseHttpAuthData should overwrite default dataParser', angular.mock.inject(
            function(AuthService, $http) {

               expect(AuthService.getCurrentUser()).toBeNull();

               $httpBackend
                  .expectPOST('/users/login')
                  .respond(200, [Mocks.user, Mocks.user.token]);
               AuthService.login();
               $httpBackend.flush();

               expect(AuthService.getCurrentUser()).toEqual(Mocks.user);
            })
      );

   });



   afterEach(function() {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
   });

});
