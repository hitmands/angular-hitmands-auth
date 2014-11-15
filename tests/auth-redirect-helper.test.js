describe('Angular Module Hitmands-Auth:AuthService', function() {
   'use strict';

   var AuthServiceProvider, AuthRedirectHelperProvider, $rootScope, $scope, $exceptionHandlerProvider;


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

   beforeEach(function() {
      angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_, _$exceptionHandlerProvider_, $stateProvider, _AuthRedirectHelperProvider_ ) {
         AuthServiceProvider = _AuthServiceProvider_;
         $exceptionHandlerProvider = _$exceptionHandlerProvider_;
         $exceptionHandlerProvider = $exceptionHandlerProvider.mode('log');
         AuthRedirectHelperProvider = _AuthRedirectHelperProvider_;
         $stateProvider
            .state(Mocks.states.public)
            .state(Mocks.states.admin);
      });
   });
   beforeEach(angular.mock.inject(
      function( _$rootScope_, AuthService) {
         $rootScope = _$rootScope_;
         $scope = $rootScope.$new();
         spyOn(AuthService, 'authorize').andCallThrough();
      }
   ));

   it('Should Have a Working AuthRedirectHelper', angular.mock.inject(
      function(AuthRedirectHelper, AuthService) {

         expect(AuthRedirectHelper).toBeDefined();
         expect(AuthRedirectHelper.set).toEqual( jasmine.any(Function) );
         expect(AuthRedirectHelper.unset).toEqual( jasmine.any(Function) );
         expect(AuthRedirectHelper.go).toEqual( jasmine.any(Function) );
         expect(AuthRedirectHelper.otherwise).toEqual( jasmine.any(Function) );
      }
   ));

   it('Should not set redirect if call set without parameters', angular.mock.inject(
      function(AuthRedirectHelper) {
         AuthRedirectHelper.set();
         expect(AuthRedirectHelper.get().state).toBeNull();
         expect(AuthRedirectHelper.get().params).toBeNull();
      }
   ));

   it('Should set redirect if call set with correct parameters', angular.mock.inject(
      function(AuthRedirectHelper) {
         AuthRedirectHelper.set(Mocks.states.public);
         expect(AuthRedirectHelper.get().state).toEqual(Mocks.states.public);
         expect(AuthRedirectHelper.get().params).toEqual( jasmine.any(Object) );

         AuthRedirectHelper.set(Mocks.states.public, { param: 'AnyParam' });
         expect(AuthRedirectHelper.get().state).toEqual(Mocks.states.public);
         expect(AuthRedirectHelper.get().params).toEqual( { param: 'AnyParam' } );
      }
   ));

   it('Should unset Redirect', angular.mock.inject(
      function(AuthRedirectHelper) {
         AuthRedirectHelper.set(Mocks.states.public);
         expect(AuthRedirectHelper.get().state).toEqual(Mocks.states.public);

         AuthRedirectHelper.unset();
         expect(AuthRedirectHelper.get().state).toBeNull();
         expect(AuthRedirectHelper.get().params).toBeNull();
      }
   ));

   it('Should set Redirect and go to setted Redirect', angular.mock.inject(
      function(AuthRedirectHelper, $state) {
         AuthRedirectHelper.set(Mocks.states.public);
         expect($state.current.name).not.toEqual(Mocks.states.public.name);
         AuthRedirectHelper.go();
         $scope.$digest();
         expect($state.current.name).toEqual(Mocks.states.public.name);
      }
   ));

   it('Should go to otherwise', angular.mock.inject(
      function(AuthRedirectHelper, $state) {
         AuthRedirectHelperProvider.useRoutes({
            otherwise: Mocks.states.public.name
         });

         expect($state.current.name).not.toEqual(Mocks.states.public.name);
         AuthRedirectHelper.otherwise();
         $scope.$digest();
         expect($state.current.name).toEqual(Mocks.states.public.name);
      }
   ));

});
