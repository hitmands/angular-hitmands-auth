describe('Angular Module Hitmands-Auth:AuthService', function() {
   'use strict';

   var AuthServiceProvider, $rootScope, $scope, $exceptionHandlerProvider;


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
      angular.mock.module( 'ui.router', 'hitmands.auth', function( _AuthServiceProvider_, _$exceptionHandlerProvider_, $stateProvider ) {
         AuthServiceProvider = _AuthServiceProvider_;
         $exceptionHandlerProvider = _$exceptionHandlerProvider_;
         $exceptionHandlerProvider = $exceptionHandlerProvider.mode('log');
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

   it('Should Have a Working AuthServiceRedirect', angular.mock.inject(
      function(AuthServiceRedirect, AuthService) {

         expect(AuthServiceRedirect).toBeDefined();
         expect(AuthServiceRedirect.set).toEqual( jasmine.any(Function) );
         expect(AuthServiceRedirect.unset).toEqual( jasmine.any(Function) );
         expect(AuthServiceRedirect.go).toEqual( jasmine.any(Function) );
         expect(AuthServiceRedirect.otherwise).toEqual( jasmine.any(Function) );
      }
   ));

   it('Should not set redirect if call set without parameters', angular.mock.inject(
      function(AuthServiceRedirect) {
         AuthServiceRedirect.set();
         expect(AuthServiceRedirect.get().state).toBeNull();
         expect(AuthServiceRedirect.get().params).toBeNull();
      }
   ));

   it('Should set redirect if call set with correct parameters', angular.mock.inject(
      function(AuthServiceRedirect) {
         AuthServiceRedirect.set(Mocks.states.public);
         expect(AuthServiceRedirect.get().state).toEqual(Mocks.states.public);
         expect(AuthServiceRedirect.get().params).toEqual( jasmine.any(Object) );

         AuthServiceRedirect.set(Mocks.states.public, { param: 'AnyParam' });
         expect(AuthServiceRedirect.get().state).toEqual(Mocks.states.public);
         expect(AuthServiceRedirect.get().params).toEqual( { param: 'AnyParam' } );
      }
   ));

   it('Should unset Redirect', angular.mock.inject(
      function(AuthServiceRedirect) {
         AuthServiceRedirect.set(Mocks.states.public);
         expect(AuthServiceRedirect.get().state).toEqual(Mocks.states.public);

         AuthServiceRedirect.unset();
         expect(AuthServiceRedirect.get().state).toBeNull();
         expect(AuthServiceRedirect.get().params).toBeNull();
      }
   ));

   it('Should set Redirect and go to setted Redirect', angular.mock.inject(
      function(AuthServiceRedirect, $state) {
         AuthServiceRedirect.set(Mocks.states.public);
         expect($state.current.name).not.toEqual(Mocks.states.public.name);
         AuthServiceRedirect.go();
         $scope.$digest();
         expect($state.current.name).toEqual(Mocks.states.public.name);
      }
   ));

   it('Should go to otherwise', angular.mock.inject(
      function(AuthServiceRedirect, $state) {
         AuthServiceProvider.useRoutes({
            otherwise: Mocks.states.public.name
         });

         expect($state.current.name).not.toEqual(Mocks.states.public.name);
         AuthServiceRedirect.otherwise();
         $scope.$digest();
         expect($state.current.name).toEqual(Mocks.states.public.name);
      }
   ));

});
