angular
   .module('hitmands.logger', [])
   .run(function($rootScope, AuthService) {

      /***/
      $rootScope.$on('hitmands.auth:update', function(event) {
         console.log( '%chitmands.auth.update (CurrentUser) ', 'color: #2E6EA5; font-weight:bolder;', AuthService.getCurrentUser() );
      });
      /***/

      /***/
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {

         console.groupCollapsed('%c$stateChangeStart (from: ' + (fromState.name || 'abstract') + ', to: ' + toState.name + ');', "color:#FF803E");
         console.log('fromState:', fromState);
         console.log('fromParams:', fromParams);
         console.info('toState:', toState);
         console.info('toParams:', toParams);
         console.groupEnd('$stateChangeStart');
      });
      /***/

      /***/
      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {

         console.groupCollapsed('%c$stateChangeSuccess (from: ' + (fromState.name || 'abstract') + ', to: ' + toState.name + ');', "color:#FF803E");
         console.log('fromState:', fromState);
         console.log('fromParams:', fromParams);
         console.info('toState:', toState);
         console.info('toParams:', toParams);
         console.groupEnd('$stateChangeSuccess');
      });
      /***/

      /***/
      $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {

         console.groupCollapsed('%c$stateChangeError (from: ' + (fromState.name || 'abstract') + ', requestedState: '+ (toState.name || 'abstract') + ')', "color:#ff3f3f");
         console.log('error:', error);
         console.groupEnd('$stateChangeError');
      });
      /***/

      /***/
      $rootScope.$on('$stateNotFound', function(event, unfoundState, fromState, fromParams) {

         console.groupCollapsed('%c$stateNotFound (from: ' + (fromState.name || 'abstract'), "color:#FF803E");
         console.log('unfoundstate.to', unfoundState.to);
         console.log('unfoundstate.toParams', unfoundState.toParams);
         console.log('unfoundstate.options', unfoundState.options);
         console.groupEnd('$stateNotFound');
      });
      /***/

      /*
       $rootScope.$on('$viewContentLoading', function(event, viewConfig) {

       console.groupCollapsed('%c$viewContentLoading', "color:#CE45FF");
       console.log('viewConfig', viewConfig);
       console.groupEnd('$viewContentLoading');
       });
       /***/


      /*
       $rootScope.$on('$viewContentLoaded', function(event) {

       console.groupCollapsed('%c$viewContentLoaded', "color:#CE45FF");
       console.log('event', event);
       console.groupEnd('$viewContentLoaded');
       });
       /***/

   });
