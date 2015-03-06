describe('hitmands.auth.AuthServiceProvider.parseHttpAuthData', function() {
   'use strict';

   describe('MIDDLEWARE NOT SET', function() {
      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
         });
      });




      it('$exceptionHandler should have a AuthServiceProvider Exception', angular.mock.inject(
         function(AuthService, $exceptionHandler) {

            expect($exceptionHandler.errors.shift()).toContain('AuthServiceProvider.parseHttpAuthData');
         }
      ));
   });

   describe('MIDDLEWARE AS STRING', function() {

      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider.parseHttpAuthData( 'invalid argument' );
         });
      });




      it('$exceptionHandler should be empty', angular.mock.inject(
         function(AuthService, $exceptionHandler) {
            expect($exceptionHandler.errors.shift()).toContain('AuthServiceProvider.parseHttpAuthData');
         }
      ));
   });

   describe('MIDDLEWARE AS NUMBER', function() {

      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider.parseHttpAuthData( 1 );
         });
      });




      it('$exceptionHandler should be empty', angular.mock.inject(
         function(AuthService, $exceptionHandler) {
            expect($exceptionHandler.errors.shift()).toContain('AuthServiceProvider.parseHttpAuthData');
         }
      ));
   });

   describe('MIDDLEWARE AS OBJECT', function() {

      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider.parseHttpAuthData( {} );
         });
      });




      it('$exceptionHandler should be empty', angular.mock.inject(
         function(AuthService, $exceptionHandler) {
            expect($exceptionHandler.errors.shift()).toContain('AuthServiceProvider.parseHttpAuthData');
         }
      ));
   });

   describe('MIDDLEWARE AS ARRAY', function() {

      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {
            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider.parseHttpAuthData( [] );
         });
      });




      it('$exceptionHandler should be empty', angular.mock.inject(
         function(AuthService, $exceptionHandler) {
            expect($exceptionHandler.errors.shift()).toContain('AuthServiceProvider.parseHttpAuthData');
         }
      ));
   });

   describe('MIDDLEWARE SET', function() {

      beforeEach(function() {
         angular.mock.module( 'ui.router', 'hitmands.auth', function(AuthServiceProvider, $exceptionHandlerProvider) {

            $exceptionHandlerProvider.mode('log');
            AuthServiceProvider.parseHttpAuthData(function() {
               return {};
            });
         });
      });




      it('$exceptionHandler should be empty', angular.mock.inject(
         function(AuthService, $exceptionHandler) {
            expect($exceptionHandler.errors.length).toEqual(0);
         }
      ));
   });

   afterEach(function() {
   })
});

