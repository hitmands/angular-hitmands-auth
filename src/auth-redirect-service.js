/* @ngInject */
function AuthServiceRedirectFactory() {
   var state = null;
   var params = null;

   this.$get = function($state, AuthService) {

      return {

         set: function(toState, toParams) {
            state  = toState;
            params = toParams;
         },
         unset: function() {
            state  = null;
            params = null;
         },
         go: function() {
            if( angular.isObject(state) && AuthService.authorize(state) ) {
               $state.go(state, params);
            }

            this.unset();
         },
         otherwise: function() {

            return $state.go(routes.otherwise);
         }

      };
   };

}

angular
   .module('hitmands.auth')
   .provider('AuthServiceRedirect', AuthServiceRedirectFactory);
